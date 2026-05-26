from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FoodAnalysis, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.USER_ROLES, required=False, default='patient')
    license_number = serializers.CharField(required=False, allow_blank=True)
    specialization = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name',
                  'role', 'license_number', 'specialization']
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"error": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        license_number = validated_data.pop('license_number', '')
        specialization = validated_data.pop('specialization', '')
        
        validated_data.pop('confirm_password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create profile with role
        profile = UserProfile.objects.create(
            user=user,
            role=role,
            license_number=license_number,
            specialization=specialization
        )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'daily_calorie_goal', 'daily_protein_goal', 'daily_carbs_goal', 'daily_fat_goal',
                  'age', 'height', 'weight', 'license_number', 'specialization', 
                  'hospital_affiliation', 'created_at', 'updated_at']


class FoodAnalysisSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FoodAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PatientListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    total_meals = serializers.SerializerMethodField()
    total_calories_today = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'daily_calorie_goal', 'total_meals', 'total_calories_today']
    
    def get_total_meals(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return FoodAnalysis.objects.filter(
            user=obj.user, 
            created_at__date=today
        ).count()
    
    def get_total_calories_today(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        analyses = FoodAnalysis.objects.filter(user=obj.user, created_at__date=today)
        return sum(a.estimated_calories for a in analyses)