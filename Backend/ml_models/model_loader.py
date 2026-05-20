import os
import pickle
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import applications, layers, models
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FoodModelLoader:
    """
    Singleton class to load and manage the food recognition model
    """
    _instance = None
    _model = None
    _label_encoder = None
    _nutrition_dict = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FoodModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_model(self, model_path, label_encoder_path):
        """
        Load the trained model and label encoder
        """
        try:
            # Load model artifacts from .pkl file
            with open(model_path, 'rb') as f:
                model_artifacts = pickle.load(f)
            
            # Get number of classes
            num_classes = len(model_artifacts['class_names'])
            
            # Rebuild MobileNetV2 architecture (same as training)
            base_model = applications.MobileNetV2(
                weights='imagenet',
                include_top=False,
                input_shape=(224, 224, 3)
            )
            base_model.trainable = False
            
            self._model = models.Sequential([
                base_model,
                layers.GlobalAveragePooling2D(),
                layers.Dropout(0.5),
                layers.Dense(256, activation='relu'),
                layers.BatchNormalization(),
                layers.Dropout(0.3),
                layers.Dense(128, activation='relu'),
                layers.BatchNormalization(),
                layers.Dense(num_classes, activation='softmax')
            ])
            
            # Set the trained weights
            self._model.set_weights(model_artifacts['model_weights'])
            
            # Load label encoder and nutrition dict
            self._label_encoder = model_artifacts['label_encoder']
            self._nutrition_dict = model_artifacts.get('nutrition_dict', {})
            
            print(f"✅ Model loaded successfully! Classes: {num_classes}")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False
    
    def predict(self, image_file, portion_g=100):
        """
        Predict food from image and return nutritional information
        """
        if self._model is None:
            raise Exception("Model not loaded. Call load_model() first.")
        
        # Preprocess image
        image = Image.open(image_file)
        
        # Convert RGBA to RGB if needed
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        # Resize to 224x224
        image = image.resize((224, 224))
        
        # Convert to array and normalize
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = self._model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # Get food name
        predicted_food = self._label_encoder.inverse_transform([predicted_class_idx])[0]
        
        # Get nutritional info
        nutrition = self._nutrition_dict.get(predicted_food, {
            'calories': 200, 'protein': 10, 'carbs': 20, 'fat': 10,
            'fiber': 5, 'sugars': 5, 'sodium': 200
        })
        
        # Calculate estimated nutrition based on portion
        estimated_nutrition = {
            'calories': round((nutrition.get('calories', 200) * portion_g) / 100, 1),
            'protein': round((nutrition.get('protein', 10) * portion_g) / 100, 1),
            'carbs': round((nutrition.get('carbs', 20) * portion_g) / 100, 1),
            'fat': round((nutrition.get('fat', 10) * portion_g) / 100, 1),
            'fiber': round((nutrition.get('fiber', 5) * portion_g) / 100, 1),
            'sugars': round((nutrition.get('sugars', 5) * portion_g) / 100, 1),
            'sodium': round((nutrition.get('sodium', 200) * portion_g) / 100, 1),
            'portion_g': portion_g
        }
        
        # Get top 3 predictions
        top3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_predictions = []
        for idx in top3_idx:
            food_name = self._label_encoder.inverse_transform([idx])[0]
            top_predictions.append({
                'food': food_name,
                'confidence': float(predictions[0][idx])
            })
        
        return {
            'predicted_food': predicted_food,
            'confidence': confidence,
            'nutrition_per_100g': nutrition,
            'estimated_nutrition': estimated_nutrition,
            'top_predictions': top_predictions
        }


# Global instance
model_loader = FoodModelLoader()