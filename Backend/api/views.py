from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
import os
import uuid

from .models import FoodAnalysis, UserProfile
from .serializers import (
    UserSerializer, RegisterSerializer, FoodAnalysisSerializer,
    UserProfileSerializer
)

# Import the model loader
import sys
sys.path.append(str(settings.BASE_DIR))
from ml_models.model_loader import model_loader

# Initialize model on startup
try:
    model_loader.load_model(settings.MODEL_PATH, settings.LABEL_ENCODER_PATH)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create user profile
            UserProfile.objects.create(user=user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class LogoutView(generics.GenericAPIView):
    """User logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_food(request):
    """
    Predict food from uploaded image
    """
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Validate file size (5MB max)
    if image_file.size > 5 * 1024 * 1024:
        return Response({'error': 'Image too large. Max 5MB'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get portion size (default 100g)
    portion_g = float(request.data.get('portion_g', 100))
    
    try:
        # Predict using the model
        result = model_loader.predict(image_file, portion_g)
        
        # Save image
        file_extension = os.path.splitext(image_file.name)[1]
        filename = f"{request.user.id}_{uuid.uuid4().hex}{file_extension}"
        filepath = os.path.join('uploads', filename)
        saved_path = default_storage.save(filepath, ContentFile(image_file.read()))
        
        # Save to database
        analysis = FoodAnalysis.objects.create(
            user=request.user,
            image=saved_path,
            predicted_food=result['predicted_food'],
            confidence=result['confidence'],
            calories_per_100g=result['nutrition_per_100g'].get('calories', 0),
            protein_per_100g=result['nutrition_per_100g'].get('protein', 0),
            carbs_per_100g=result['nutrition_per_100g'].get('carbs', 0),
            fat_per_100g=result['nutrition_per_100g'].get('fat', 0),
            estimated_portion_g=portion_g
        )
        
        response_data = {
            'id': analysis.id,
            'predicted_food': result['predicted_food'],
            'confidence': result['confidence'],
            'nutrition_per_100g': result['nutrition_per_100g'],
            'estimated_nutrition': result['estimated_nutrition'],
            'top_predictions': result.get('top_predictions', []),
            'image_url': request.build_absolute_uri(analysis.image.url),
            'created_at': analysis.created_at
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    """
    Get user's food analysis history
    """
    # Start with base queryset (no slice yet)
    analyses = FoodAnalysis.objects.filter(user=request.user)
    
    # Calculate today's totals using the unsliced queryset
    today = timezone.now().date()
    today_analyses = analyses.filter(created_at__date=today)
    
    # Now apply the slice for the history response
    analyses_history = analyses[:50]
    
    serializer = FoodAnalysisSerializer(analyses_history, many=True)
    
    daily_totals = {
        'calories': sum(a.estimated_calories for a in today_analyses),
        'protein': sum(a.estimated_protein for a in today_analyses),
        'carbs': sum(a.estimated_carbs for a in today_analyses),
        'fat': sum(a.estimated_fat for a in today_analyses),
    }
    
    return Response({
        'history': serializer.data,
        'daily_totals': daily_totals,
        'count': analyses.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analysis_detail(request, analysis_id):
    """
    Get specific analysis details
    """
    try:
        analysis = FoodAnalysis.objects.get(id=analysis_id, user=request.user)
        serializer = FoodAnalysisSerializer(analysis)
        return Response(serializer.data)
    except FoodAnalysis.DoesNotExist:
        return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_analysis(request, analysis_id):
    """
    Delete a specific analysis
    """
    try:
        analysis = FoodAnalysis.objects.get(id=analysis_id, user=request.user)
        if analysis.image:
            analysis.image.delete()
        analysis.delete()
        return Response({'message': 'Analysis deleted successfully'})
    except FoodAnalysis.DoesNotExist:
        return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update user profile
    """
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_foods(request):
    """
    Get list of all foods the model can recognize
    """
    # Use classes attribute from model loader (mock version)
    if hasattr(model_loader, 'classes') and model_loader.classes:
        foods = model_loader.classes
        return Response({'foods': foods, 'count': len(foods)})
    
    # Fallback hardcoded list
    fallback_foods = ['caesar_salad', 'cheesecake', 'donuts', 'dumplings', 
                      'french_toast', 'macarons', 'prime_rib', 'ramen', 
                      'spaghetti_bolognese']
    return Response({'foods': fallback_foods, 'count': len(fallback_foods)})