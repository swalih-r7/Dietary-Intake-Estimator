from django.contrib import admin
from .models import FoodAnalysis, UserProfile

@admin.register(FoodAnalysis)
class FoodAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'predicted_food', 'confidence', 'estimated_calories', 'created_at']
    list_filter = ['predicted_food', 'created_at']
    search_fields = ['user__username', 'predicted_food']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'daily_calorie_goal', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'license_number']
    filter_horizontal = ['patients']