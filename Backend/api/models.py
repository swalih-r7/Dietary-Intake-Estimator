from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class FoodAnalysis(models.Model):
    """
    Model to store food analysis history for each user
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_analyses')
    image = models.ImageField(upload_to='uploads/%Y/%m/%d/')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Prediction results
    predicted_food = models.CharField(max_length=100)
    confidence = models.FloatField()
    
    # Nutritional values (per 100g)
    calories_per_100g = models.FloatField()
    protein_per_100g = models.FloatField()
    carbs_per_100g = models.FloatField()
    fat_per_100g = models.FloatField()
    
    # Estimated values (based on default portion)
    estimated_portion_g = models.FloatField(default=100)
    estimated_calories = models.FloatField()
    estimated_protein = models.FloatField()
    estimated_carbs = models.FloatField()
    estimated_fat = models.FloatField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Food Analyses'
    
    def __str__(self):
        return f"{self.user.username} - {self.predicted_food} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Calculate estimated values based on portion
        self.estimated_calories = (self.calories_per_100g * self.estimated_portion_g) / 100
        self.estimated_protein = (self.protein_per_100g * self.estimated_portion_g) / 100
        self.estimated_carbs = (self.carbs_per_100g * self.estimated_portion_g) / 100
        self.estimated_fat = (self.fat_per_100g * self.estimated_portion_g) / 100
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    """
    Extended user profile
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    daily_calorie_goal = models.IntegerField(default=2000)
    daily_protein_goal = models.FloatField(default=50)
    daily_carbs_goal = models.FloatField(default=250)
    daily_fat_goal = models.FloatField(default=70)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"