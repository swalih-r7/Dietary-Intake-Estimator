"""
Dietary Intake Estimator - Model Training Script
Run this file directly in VS Code to train the food recognition model
"""

# ============================================
# SECTION 1: INSTALL DEPENDENCIES (First time only)
# ============================================

import subprocess
import sys

def install_packages():
    """Install required packages if not already installed"""
    required_packages = [
        'tensorflow', 'pandas', 'numpy', 'scikit-learn', 'pillow',
        'matplotlib', 'seaborn', 'opencv-python', 'tqdm', 'joblib', 'openpyxl'
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Uncomment the line below to auto-install packages (run once)
# install_packages()

# ============================================
# SECTION 2: IMPORTS
# ============================================

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, applications
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import cv2
from tqdm import tqdm
import joblib
import pickle
import json
import warnings
import shutil

warnings.filterwarnings("ignore")

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

print("="*60)
print("DIETARY INTAKE ESTIMATOR - MODEL TRAINING")
print("="*60)
print(f"TensorFlow version: {tf.__version__}")
print(f"Python version: {sys.version}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")
print("="*60)

# ============================================
# SECTION 3: CONFIGURATION - UPDATE THESE PATHS
# ============================================

# IMPORTANT: Update these paths to match your system
IMAGE_DATASET_PATH = r"C:\Users\ABDUL\Downloads\Data_MA"
NUTRITION_CSV_PATH = r"C:\Users\ABDUL\Downloads\nutrition.csv"

# Output directories
OUTPUT_DIR = "dietary_model"
MODELS_DIR = os.path.join(OUTPUT_DIR, "models")
BACKEND_ML_MODELS = r"C:\Users\ABDUL\Desktop\Dietary Intake Estimator\Backend\ml_models"

# Create directories
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BACKEND_ML_MODELS, exist_ok=True)

print("\n📁 Configuration:")
print(f"   Image Dataset: {IMAGE_DATASET_PATH}")
print(f"   Nutrition CSV: {NUTRITION_CSV_PATH}")
print(f"   Output Directory: {OUTPUT_DIR}")
print(f"   Backend ML Models: {BACKEND_ML_MODELS}")

# Verify paths exist
if not os.path.exists(IMAGE_DATASET_PATH):
    print(f"\n❌ ERROR: Image dataset not found at {IMAGE_DATASET_PATH}")
    print("   Please update IMAGE_DATASET_PATH to the correct location")
    sys.exit(1)

if not os.path.exists(NUTRITION_CSV_PATH):
    print(f"\n❌ ERROR: Nutrition CSV not found at {NUTRITION_CSV_PATH}")
    print("   Please update NUTRITION_CSV_PATH to the correct location")
    sys.exit(1)

print("\n✅ All paths verified!")

# ============================================
# SECTION 4: LOAD NUTRITION DATA
# ============================================

print("\n" + "="*60)
print("LOADING NUTRITION DATA")
print("="*60)

nutrition_df = pd.read_csv(NUTRITION_CSV_PATH)

print(f"Shape: {nutrition_df.shape}")
print(f"Columns: {nutrition_df.columns.tolist()}")
print("\nFirst 5 rows:")
print(nutrition_df.head())

# Get unique food labels
unique_foods = nutrition_df['label'].unique()
print(f"\n🍕 Unique Food Categories in CSV: {len(unique_foods)}")

# Create nutrition lookup dictionary (per 100g)
nutrition_dict = {}

for food in unique_foods:
    food_data = nutrition_df[nutrition_df['label'] == food]
    
    nutrition_dict[food] = {
        'calories': round((food_data['calories'] / food_data['weight'] * 100).mean(), 1),
        'protein': round((food_data['protein'] / food_data['weight'] * 100).mean(), 1),
        'carbs': round((food_data['carbohydrates'] / food_data['weight'] * 100).mean(), 1),
        'fat': round((food_data['fats'] / food_data['weight'] * 100).mean(), 1),
        'fiber': round((food_data['fiber'] / food_data['weight'] * 100).mean(), 1),
        'sugars': round((food_data['sugars'] / food_data['weight'] * 100).mean(), 1),
        'sodium': round((food_data['sodium'] / food_data['weight'] * 100).mean(), 1)
    }

print(f"✅ Created nutrition lookup for {len(nutrition_dict)} foods")

# ============================================
# SECTION 5: EXPLORE IMAGE DATASET
# ============================================

print("\n" + "="*60)
print("EXPLORING IMAGE DATASET")
print("="*60)

# Get all category folders
image_categories = [
    d for d in os.listdir(IMAGE_DATASET_PATH)
    if os.path.isdir(os.path.join(IMAGE_DATASET_PATH, d))
    and not d.startswith('.')
]

print(f"Found {len(image_categories)} food categories:\n")

for i, category in enumerate(image_categories):
    category_path = os.path.join(IMAGE_DATASET_PATH, category)
    image_count = len([f for f in os.listdir(category_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    print(f"{i+1}. {category}: {image_count} images")

# ============================================
# SECTION 6: MATCH CATEGORIES WITH NUTRITION DATA
# ============================================

print("\n" + "="*60)
print("MATCHING CATEGORIES WITH NUTRITION DATA")
print("="*60)

TRAIN_CATEGORIES = []
category_mapping = {}

# Default nutrition for fallback
DEFAULT_NUTRITION = {
    'calories': 200.0, 'protein': 10.0, 'carbs': 20.0, 'fat': 8.0,
    'fiber': 2.0, 'sugars': 5.0, 'sodium': 200.0
}

for img_cat in image_categories:
    if img_cat in nutrition_dict:
        TRAIN_CATEGORIES.append(img_cat)
        category_mapping[img_cat] = img_cat
        print(f"✅ Match found: {img_cat}")
    else:
        TRAIN_CATEGORIES.append(img_cat)
        category_mapping[img_cat] = img_cat
        nutrition_dict[img_cat] = DEFAULT_NUTRITION.copy()
        print(f"⚠️ Added fallback for: {img_cat}")

print(f"\n📊 Total training categories: {len(TRAIN_CATEGORIES)}")
print(f"Categories: {TRAIN_CATEGORIES}")

# ============================================
# SECTION 7: LOAD IMAGES
# ============================================

print("\n" + "="*60)
print("LOADING IMAGES")
print("="*60)

def load_images_from_folders(base_path, categories, max_images_per_category=500):
    """Load images from category folders"""
    images = []
    labels = []
    
    for category in tqdm(categories, desc="Loading categories"):
        category_path = os.path.join(base_path, category)
        
        if not os.path.exists(category_path):
            print(f"⚠️ Folder not found: {category_path}")
            continue
        
        image_files = [f for f in os.listdir(category_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img_file in image_files[:max_images_per_category]:
            img_path = os.path.join(category_path, img_file)
            img = cv2.imread(img_path)
            
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (224, 224))
                images.append(img)
                labels.append(category)
    
    return np.array(images), np.array(labels)

# Load images
X, y = load_images_from_folders(IMAGE_DATASET_PATH, TRAIN_CATEGORIES, max_images_per_category=500)

print(f"\n✅ Loaded {len(X)} images from {len(np.unique(y))} categories")
print(f"   Image shape: {X[0].shape if len(X) > 0 else 'No images'}")

if len(X) == 0:
    print("\n❌ No images loaded. Please check your dataset path.")
    sys.exit(1)

# ============================================
# SECTION 8: DATA SPLITTING
# ============================================

print("\n" + "="*60)
print("DATA PREPROCESSING")
print("="*60)

# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
num_classes = len(label_encoder.classes_)

print(f"Number of classes: {num_classes}")
print(f"Classes: {label_encoder.classes_.tolist()}")

# Save label encoder
joblib.dump(label_encoder, os.path.join(OUTPUT_DIR, "label_encoder.pkl"))
print("✅ Label encoder saved")

# Train/validation/test split (70/15/15)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_encoded, test_size=0.3, random_state=42, stratify=y_encoded
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)

print(f"\n📊 Data Split:")
print(f"   Training: {len(X_train)} images")
print(f"   Validation: {len(X_val)} images")
print(f"   Test: {len(X_test)} images")

# Compute class weights for imbalance
class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = dict(enumerate(class_weights))

print(f"\n⚖️ Class Weights:")
for i, (class_name, weight) in enumerate(zip(label_encoder.classes_, class_weights)):
    print(f"   {class_name}: {weight:.4f}")

# ============================================
# SECTION 9: DATA AUGMENTATION
# ============================================

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.3,
    height_shift_range=0.3,
    horizontal_flip=True,
    zoom_range=0.3,
    shear_range=0.2,
    fill_mode='nearest'
)

val_test_datagen = ImageDataGenerator(rescale=1./255)

# Create generators
train_generator = train_datagen.flow(X_train, y_train, batch_size=32, shuffle=True)
val_generator = val_test_datagen.flow(X_val, y_val, batch_size=32, shuffle=False)
test_generator = val_test_datagen.flow(X_test, y_test, batch_size=32, shuffle=False)

print("✅ Data generators created")

# ============================================
# SECTION 10: BUILD MODEL
# ============================================

print("\n" + "="*60)
print("BUILDING MODEL")
print("="*60)

def build_model(num_classes):
    """Build MobileNetV2 model for food classification"""
    base_model = applications.MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    base_model.trainable = False
    
    model = models.Sequential([
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
    
    return model

# Build model
model = build_model(num_classes)

# Compile
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()
print(f"\n✅ Model built with {num_classes} output classes")

# ============================================
# SECTION 11: TRAIN MODEL - PHASE 1
# ============================================

print("\n" + "="*60)
print("PHASE 1: TRAINING FROZEN BASE MODEL")
print("="*60)

callbacks = [
    EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, min_lr=1e-7, verbose=1),
    ModelCheckpoint(
        os.path.join(MODELS_DIR, 'best_model.h5'),
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
]

history_phase1 = model.fit(
    train_generator,
    epochs=30,
    validation_data=val_generator,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    verbose=1
)

print("\n✅ Phase 1 completed!")

# ============================================
# SECTION 12: TRAIN MODEL - PHASE 2 (FINE-TUNING)
# ============================================

print("\n" + "="*60)
print("PHASE 2: FINE-TUNING")
print("="*60)

# Unfreeze top layers
model.layers[0].trainable = True

# Freeze first 100 layers
for layer in model.layers[0].layers[:100]:
    layer.trainable = False

# Recompile with lower learning rate
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-6),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history_phase2 = model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    verbose=1
)

print("\n✅ Phase 2 completed!")

# ============================================
# SECTION 13: EVALUATE MODEL
# ============================================

print("\n" + "="*60)
print("EVALUATING MODEL")
print("="*60)

# Load best model
best_model_path = os.path.join(MODELS_DIR, 'best_model.h5')
if os.path.exists(best_model_path):
    model = keras.models.load_model(best_model_path)
    print("✅ Loaded best model checkpoint")

# Evaluate on test set
test_loss, test_acc = model.evaluate(test_generator, verbose=1)
print(f"\n📈 Test Results:")
print(f"   Accuracy: {test_acc:.4f}")
print(f"   Loss: {test_loss:.4f}")

# Generate predictions
y_pred = []
y_true = []
for i in range(len(test_generator)):
    x_batch, y_batch = test_generator[i]
    pred_batch = model.predict(x_batch, verbose=0)
    y_pred.extend(np.argmax(pred_batch, axis=1))
    y_true.extend(y_batch)

y_pred = np.array(y_pred)
y_true = np.array(y_true)

# Classification report
print("\n📋 Classification Report:")
print(classification_report(y_true, y_pred, target_names=label_encoder.classes_))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=label_encoder.classes_,
            yticklabels=label_encoder.classes_)
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'confusion_matrix.png'), dpi=150)
plt.show()

# Per-class accuracy
print("\n📊 Per-Class Accuracy:")
for i, class_name in enumerate(label_encoder.classes_):
    class_mask = (y_true == i)
    if np.sum(class_mask) > 0:
        class_acc = np.sum(y_pred[class_mask] == i) / np.sum(class_mask)
        status = "✅ Good" if class_acc > 0.7 else "⚠️ Needs work" if class_acc > 0.4 else "❌ Poor"
        print(f"   {class_name}: {class_acc:.4f} - {status}")

# ============================================
# SECTION 14: SAVE MODEL FILES
# ============================================

print("\n" + "="*60)
print("SAVING MODEL FILES")
print("="*60)

# Save model artifacts
model_artifacts = {
    'model_weights': model.get_weights(),
    'label_encoder': label_encoder,
    'nutrition_dict': nutrition_dict,
    'food_categories': TRAIN_CATEGORIES,
    'input_shape': (224, 224, 3),
    'test_accuracy': float(test_acc),
    'num_classes': num_classes,
    'class_names': label_encoder.classes_.tolist(),
    'model_version': '1.0',
    'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
}

# Save as .h5
model.save(os.path.join(MODELS_DIR, 'food_model.h5'))
print("✅ Saved food_model.h5")

# Save as .pkl
with open(os.path.join(MODELS_DIR, 'food_model.pkl'), 'wb') as f:
    pickle.dump(model_artifacts, f)
print("✅ Saved food_model.pkl")

# Save compressed version
joblib.dump(model_artifacts, os.path.join(MODELS_DIR, 'food_model_compressed.pkl'), compress=3)
print("✅ Saved compressed model")

# Save nutrition dict separately
with open(os.path.join(MODELS_DIR, 'nutrition_dict.pkl'), 'wb') as f:
    pickle.dump(nutrition_dict, f)
print("✅ Saved nutrition_dict.pkl")

# Save class names
with open(os.path.join(MODELS_DIR, 'class_names.pkl'), 'wb') as f:
    pickle.dump(label_encoder.classes_.tolist(), f)
print("✅ Saved class_names.pkl")

# Save model info
model_info = {
    'model_type': 'MobileNetV2',
    'num_classes': num_classes,
    'classes': label_encoder.classes_.tolist(),
    'test_accuracy': float(test_acc),
    'training_samples': len(X_train),
    'validation_samples': len(X_val),
    'test_samples': len(X_test),
    'epochs_phase1': len(history_phase1.history['loss']),
    'epochs_phase2': len(history_phase2.history['loss'])
}

with open(os.path.join(OUTPUT_DIR, 'model_info.json'), 'w') as f:
    json.dump(model_info, f, indent=2)
print("✅ Saved model_info.json")

# ============================================
# SECTION 15: COPY TO BACKEND
# ============================================

print("\n" + "="*60)
print("COPYING TO BACKEND")
print("="*60)

# Copy all model files to Backend/ml_models/
files_to_copy = [
    'food_model.h5',
    'food_model.pkl',
    'food_model_compressed.pkl',
    'nutrition_dict.pkl',
    'class_names.pkl'
]

for filename in files_to_copy:
    src = os.path.join(MODELS_DIR, filename)
    dst = os.path.join(BACKEND_ML_MODELS, filename)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"✅ Copied {filename} to Backend")
    else:
        print(f"⚠️ {filename} not found")

# Copy label encoder
label_src = os.path.join(OUTPUT_DIR, 'label_encoder.pkl')
label_dst = os.path.join(BACKEND_ML_MODELS, 'label_encoder.pkl')
if os.path.exists(label_src):
    shutil.copy2(label_src, label_dst)
    print("✅ Copied label_encoder.pkl to Backend")

print(f"\n📁 Files copied to: {BACKEND_ML_MODELS}")

# ============================================
# SECTION 16: PLOT TRAINING HISTORY
# ============================================

print("\n" + "="*60)
print("GENERATING TRAINING PLOTS")
print("="*60)

fig, axes = plt.subplots(1, 2, figsize=(15, 5))

# Combine histories
all_accuracy = history_phase1.history['accuracy'] + history_phase2.history['accuracy']
all_val_accuracy = history_phase1.history['val_accuracy'] + history_phase2.history['val_accuracy']
all_loss = history_phase1.history['loss'] + history_phase2.history['loss']
all_val_loss = history_phase1.history['val_loss'] + history_phase2.history['val_loss']

# Accuracy plot
axes[0].plot(all_accuracy, label='Train Accuracy', marker='o', markersize=3)
axes[0].plot(all_val_accuracy, label='Validation Accuracy', marker='s', markersize=3)
axes[0].axvline(x=len(history_phase1.history['accuracy']), color='r', linestyle='--', label='Fine-tuning start')
axes[0].set_title('Model Accuracy')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Accuracy')
axes[0].legend()
axes[0].grid(True)

# Loss plot
axes[1].plot(all_loss, label='Train Loss', marker='o', markersize=3)
axes[1].plot(all_val_loss, label='Validation Loss', marker='s', markersize=3)
axes[1].axvline(x=len(history_phase1.history['loss']), color='r', linestyle='--', label='Fine-tuning start')
axes[1].set_title('Model Loss')
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Loss')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'training_history.png'), dpi=150)
plt.show()

print("✅ Training history plot saved")

# ============================================
# SECTION 17: FINAL SUMMARY
# ============================================

print("\n" + "="*60)
print("🎉 TRAINING COMPLETE!")
print("="*60)
print(f"\n📊 Final Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
print(f"📁 Models saved in: {OUTPUT_DIR}/models/")
print(f"📁 Models copied to: {BACKEND_ML_MODELS}")
print("\nFiles created:")
print("   - food_model.h5 (Keras model)")
print("   - food_model.pkl (Pickle with weights)")
print("   - label_encoder.pkl (Class mapping)")
print("   - nutrition_dict.pkl (Nutrition data)")
print("   - class_names.pkl (Class list)")
print("   - model_info.json (Metadata)")
print("   - training_history.png (Accuracy/Loss plot)")
print("   - confusion_matrix.png (Confusion matrix)")
print("\n🚀 You can now run the Django backend:")
print("   cd Backend")
print("   python manage.py runserver")
print("="*60)