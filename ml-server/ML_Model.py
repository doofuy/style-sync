# from ML_Model import embeddings_data
# from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
# from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import numpy as np
# import pickle

import random

# Load MobileNet model
# print("Loading MobileNetV2 model...")
# model = MobileNetV2(
#     weights='imagenet',
#     include_top=False,
#     pooling='avg'
# )
# print("MobileNetV2 loaded successfully.")

# Load classifier model
print("Loading classifier model...")
classifier = load_model("best_model.keras")
print("Classifier loaded successfully.")

# Class labels
CLASS_LABELS = [
    'Casual Shoes', 'Flip Flops', 'Formal Shoes', 'Heels',
    'Jeans', 'Kurtas', 'Leggings', 'Sandals', 'Shirts',
    'Shorts', 'Sports Shoes', 'Tops', 'Track Pants',
    'Trousers', 'Tshirts'
]

# Load embeddings
# print("Loading embeddings...")
# with open("embeddings.pkl", "rb") as f:
#     embeddings_data = pickle.load(f)
# print(f"Loaded {len(embeddings_data)} embeddings.")

# Feature extraction function
# def extract_features(img: Image.Image):
#     img = img.resize((224, 224))
#     if img.mode != "RGB":
#         img = img.convert("RGB")
#     img_array = image.img_to_array(img)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = preprocess_input(img_array)
#     features = model.predict(img_array, verbose=0)
#     return features.flatten()

# Similarity search function
# def find_similar(img: Image.Image, top_k: int = 5):

#     print("Loading embeddings...")
#     with open("embeddings.pkl", "rb") as f:
#         embeddings_data = pickle.load(f)
#     print(f"Loaded {len(embeddings_data)} embeddings.")

#     query_features = extract_features(img)
#     results = []
#     for item in embeddings_data:
#         score = cosine_similarity(
#             [query_features],
#             [item["features"]]
#         )[0][0]
#         results.append({
#             "path": item["path"],
#             "score": float(score),
#             "category": item["category"],
#             "gender": item["gender"],
#             "subcategory": item["subcategory"]
#         })
#     results = sorted(results, key=lambda x: x["score"], reverse=True)
#     return results[:top_k]

# Classify image function
def classify_image(img: Image.Image):
    img_resized = img.resize((224, 224))
    if img_resized.mode != "RGB":
        img_resized = img_resized.convert("RGB")
    img_array = image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    predictions = classifier.predict(img_array, verbose=0)
    predicted_index = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_index])
    return {
        "articleType": CLASS_LABELS[predicted_index],
        "confidence": round(confidence, 2)
    }

# Occasion rules
OCCASION_RULES = {
    "college": {
        "topwear": ["Tshirts", "Shirts", "Tops"],
        "bottomwear": ["Jeans", "Trousers", "Track Pants"],
        "footwear": ["Casual Shoes", "Sports Shoes"]
    },
    "date": {
        "topwear": ["Shirts", "Tops"],
        "bottomwear": ["Jeans", "Trousers"],
        "footwear": ["Casual Shoes", "Formal Shoes", "Heels", "Sandals"]
    },
    "interview": {
        "topwear": ["Shirts"],
        "bottomwear": ["Trousers", "Jeans"],
        "footwear": ["Formal Shoes", "Casual Shoes"]
    },
    "casual": {
        "topwear": ["Tshirts", "Shirts", "Tops"],
        "bottomwear": ["Jeans", "Shorts", "Track Pants", "Leggings"],
        "footwear": ["Casual Shoes", "Sports Shoes", "Flip Flops", "Sandals"]
    }
}

# Recommend outfit function
# def recommend_outfit(wardrobe: list, occasion: str):
#     occasion = occasion.lower()
    
#     if occasion not in OCCASION_RULES:
#         return {"error": f"Occasion '{occasion}' not supported. Use: college, date, interview, casual"}
    
#     rules = OCCASION_RULES[occasion]
    
#     # Classify all wardrobe items
#     classified = []
#     for item in wardrobe:
#         result = classify_image(item["image"])
#         classified.append({
#             "articleType": result["articleType"],
#             "confidence": result["confidence"],
#             "image": item["image"]
#         })
    
#     # Pick best item for each slot
#     outfit = {}
    
#     for slot, allowed_types in rules.items():
#         best = None
#         best_score = 0
#         for item in classified:
#             if item["articleType"] in allowed_types and item["confidence"] > best_score:
#                 best = item
#                 best_score = item["confidence"]
#         outfit[slot] = best
    
#     return {
#         "occasion": occasion,
#         "outfit": outfit
#     }

def recommend_outfit(wardrobe: list, occasion: str):
    occasion = occasion.lower()

    if occasion not in OCCASION_RULES:
        raise ValueError(
                f"Occasion '{occasion}' not supported."
            )

    occasion_rules = OCCASION_RULES[occasion]

    outfit = {}

    for slot, allowed_types in occasion_rules.items():

        candidates = [
            item
            for item in wardrobe
            if item["articleType"] in allowed_types
        ]

        if candidates:
            outfit[slot] = random.choice(candidates)
        else:
            outfit[slot] = None

    return {
        "occasion": occasion,
        "outfit": outfit
    }