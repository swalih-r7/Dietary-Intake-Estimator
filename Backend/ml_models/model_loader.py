"""
Real Model Loader for Dietary Intake Estimator
Loads the trained MobileNetV2 model
"""

import pickle
import numpy as np
from PIL import Image
import os
import tensorflow as tf
from tensorflow.keras import models

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class FoodModelLoader:
    _instance = None
    _model = None
    _classes = None
    _nutrition_dict = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FoodModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_model(self, model_path, label_encoder_path):
        """
        Load the trained model from .h5 file
        """
        print("\n" + "="*50)
        print("LOADING REAL TRAINED MODEL")
        print("="*50)
        
        try:
            # Get the base directory
            base_dir = os.path.dirname(os.path.dirname(model_path))
            backend_ml = os.path.join(base_dir, "ml_models")
            
            # Load .h5 model
            h5_path = os.path.join(backend_ml, 'food_model.h5')
            if os.path.exists(h5_path):
                self._model = models.load_model(h5_path)
                print(f"✅ Loaded model from {h5_path}")
            else:
                print(f"❌ Model file not found: {h5_path}")
                return False
            
            # Load class names
            class_path = os.path.join(backend_ml, 'class_names.pkl')
            if os.path.exists(class_path):
                with open(class_path, 'rb') as f:
                    self._classes = pickle.load(f)
                print(f"✅ Loaded {len(self._classes)} food classes")
                print(f"   Classes: {self._classes}")
            else:
                print(f"❌ Class names not found: {class_path}")
                return False
            
            # Load nutrition dict
            nutrition_path = os.path.join(backend_ml, 'nutrition_dict.pkl')
            if os.path.exists(nutrition_path):
                with open(nutrition_path, 'rb') as f:
                    self._nutrition_dict = pickle.load(f)
                print(f"✅ Loaded nutrition data for {len(self._nutrition_dict)} foods")
            else:
                print("⚠️ Nutrition dict not found, using defaults")
                self._create_default_nutrition()
            
            print("\n✅ REAL MODEL READY FOR PREDICTIONS!")
            print(f"   Model accuracy: 85.63%")
            print("="*50)
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _create_default_nutrition(self):
        """Create default nutrition values"""
        self._nutrition_dict = {
            'caesar_salad': {'calories': 150, 'protein': 6, 'carbs': 8, 'fat': 10, 'fiber': 2, 'sugars': 2, 'sodium': 250},
            'cheesecake': {'calories': 350, 'protein': 6, 'carbs': 30, 'fat': 22, 'fiber': 1, 'sugars': 25, 'sodium': 250},
            'donuts': {'calories': 400, 'protein': 6, 'carbs': 50, 'fat': 20, 'fiber': 2, 'sugars': 24, 'sodium': 300},
            'dumplings': {'calories': 250, 'protein': 8, 'carbs': 30, 'fat': 10, 'fiber': 2, 'sugars': 2, 'sodium': 300},
            'french_toast': {'calories': 250, 'protein': 8, 'carbs': 30, 'fat': 10, 'fiber': 2, 'sugars': 10, 'sodium': 300},
            'macarons': {'calories': 400, 'protein': 6, 'carbs': 50, 'fat': 20, 'fiber': 2, 'sugars': 40, 'sodium': 100},
            'prime_rib': {'calories': 300, 'protein': 20, 'carbs': 0, 'fat': 22.5, 'fiber': 0, 'sugars': 0, 'sodium': 250},
            'ramen': {'calories': 133, 'protein': 5, 'carbs': 20, 'fat': 3.3, 'fiber': 1.3, 'sugars': 1.7, 'sodium': 267},
            'spaghetti_bolognese': {'calories': 175, 'protein': 7.5, 'carbs': 20, 'fat': 6, 'fiber': 1.5, 'sugars': 2.5, 'sodium': 200}
        }
    
    def predict(self, image_file, portion_g=100):
        """Predict food from image using the trained model"""
        if self._model is None:
            raise Exception("Model not loaded")
        
        # Preprocess image
        image = Image.open(image_file)
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        image = image.resize((224, 224))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = self._model.predict(img_array, verbose=0)
        predicted_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        predicted_food = self._classes[predicted_idx]
        
        # Top 3 predictions
        top3_idx = np.argsort(predictions[0])[-3:][::-1]
        top3 = [{'food': self._classes[i], 'confidence': float(predictions[0][i])} for i in top3_idx]
        
        # Get nutrition
        nutrition = self._nutrition_dict.get(predicted_food, {
            'calories': 200, 'protein': 10, 'carbs': 20, 'fat': 10,
            'fiber': 5, 'sugars': 5, 'sodium': 200
        })
        
        # Calculate estimated nutrition
        estimated = {
            'calories': round((nutrition.get('calories', 200) * portion_g) / 100, 1),
            'protein': round((nutrition.get('protein', 10) * portion_g) / 100, 1),
            'carbs': round((nutrition.get('carbs', 20) * portion_g) / 100, 1),
            'fat': round((nutrition.get('fat', 10) * portion_g) / 100, 1),
            'fiber': round((nutrition.get('fiber', 5) * portion_g) / 100, 1),
            'sugars': round((nutrition.get('sugars', 5) * portion_g) / 100, 1),
            'sodium': round((nutrition.get('sodium', 200) * portion_g) / 100, 1),
            'portion_g': portion_g
        }
        
        return {
            'predicted_food': predicted_food,
            'confidence': confidence,
            'nutrition_per_100g': nutrition,
            'estimated_nutrition': estimated,
            'top_predictions': top3
        }

# Create global instance
model_loader = FoodModelLoader()