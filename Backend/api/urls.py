from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Prediction
    path('predict/', views.predict_food, name='predict'),
    
    # User history (own)
    path('history/', views.get_user_history, name='history'),
    path('analysis/<int:analysis_id>/', views.get_analysis_detail, name='analysis-detail'),
    path('analysis/<int:analysis_id>/delete/', views.delete_analysis, name='analysis-delete'),
    
    # Profile
    path('profile/', views.user_profile, name='profile'),
    
    # Utils
    path('foods/', views.get_available_foods, name='foods'),
    
    # ========== NEW MULTI-USER ENDPOINTS ==========
    
    # Patient management (for nutritionists)
    path('patients/my-patients/', views.get_my_patients, name='my-patients'),
    path('patients/add/', views.add_patient, name='add-patient'),
    path('patients/remove/<int:patient_id>/', views.remove_patient, name='remove-patient'),
    path('patients/details/<int:patient_id>/', views.get_patient_details, name='patient-details'),
    path('patients/history/<int:patient_id>/', views.get_patient_history, name='patient-history'),
    
    # Admin endpoints
    path('admin/users/', views.get_all_users, name='all-users'),
    path('admin/users/<int:user_id>/role/', views.update_user_role, name='update-role'),
]