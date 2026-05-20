from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Prediction
    path('predict/', views.predict_food, name='predict'),
    
    # History
    path('history/', views.get_user_history, name='history'),
    path('analysis/<int:analysis_id>/', views.get_analysis_detail, name='analysis-detail'),
    path('analysis/<int:analysis_id>/delete/', views.delete_analysis, name='analysis-delete'),
    
    # Profile
    path('profile/', views.user_profile, name='profile'),
    
    # Utils
    path('foods/', views.get_available_foods, name='foods'),
]