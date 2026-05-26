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
    Extended user profile with role-based access
    """
    USER_ROLES = (
        ('patient', 'Patient'),
        ('nutritionist', 'Nutritionist'),
        ('admin', 'Admin'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=USER_ROLES, default='patient')
    
    # Patient-specific fields
    daily_calorie_goal = models.IntegerField(default=2000)
    daily_protein_goal = models.FloatField(default=50)
    daily_carbs_goal = models.FloatField(default=250)
    daily_fat_goal = models.FloatField(default=70)
    
    # Physical stats (optional)
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    
    # Nutritionist-specific fields
    license_number = models.CharField(max_length=50, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    hospital_affiliation = models.CharField(max_length=200, blank=True, null=True)
    
    # Relationship: Nutritionist can have many patients
    patients = models.ManyToManyField('self', symmetrical=False, blank=True, 
                                      related_name='nutritionists')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    def is_patient(self):
        return self.role == 'patient'
    
    def is_nutritionist(self):
        return self.role == 'nutritionist'
    
    def is_admin(self):
        return self.role == 'admin'