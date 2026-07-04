from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import numpy as np
import pickle

# Load MobileNet model
print("Loading MobileNetV2 model...")
model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    pooling='avg'
)
print("MobileNetV2 loaded successfully.")

# Load embeddings
print("Loading embeddings...")
with open("embeddings.pkl", "rb") as f:
    embeddings_data = pickle.load(f)
print(f"Loaded {len(embeddings_data)} embeddings.")

# Feature extraction function
def extract_features(img: Image.Image):
    img = img.resize((224, 224))
    if img.mode != "RGB":
        img = img.convert("RGB")
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = model.predict(img_array, verbose=0)
    return features.flatten()

# Similarity search function
def find_similar(img: Image.Image, top_k: int = 5):
    query_features = extract_features(img)
    results = []
    for item in embeddings_data:
        score = cosine_similarity(
            [query_features],
            [item["features"]]
        )[0][0]
        results.append({
            "path": item["path"],
            "score": float(score),
            "category": item["category"],
            "gender": item["gender"],
            "subcategory": item["subcategory"]
        })
    results = sorted(results, key=lambda x: x["score"], reverse=True)
    return results[:top_k]