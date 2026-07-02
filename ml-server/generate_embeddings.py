import os
import pickle
import numpy as np
from PIL import Image
from keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from keras.preprocessing import image

# Load model
print("Loading MobileNetV2 model...")
model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
print("MobileNetV2 loaded successfully.")

def extract_local_features(img_path):
    try:
        img = Image.open(img_path)
        img = img.resize((224, 224))
        if img.mode != "RGB":
            img = img.convert("RGB")
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        features = model.predict(img_array)
        return features.flatten()
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return None

def extract_category_from_path(file_path, dataset_dir):
    relative = os.path.relpath(file_path, dataset_dir)
    parts = relative.replace("\\", "/").split("/")
    gender = parts[0] if len(parts) > 1 else "Unknown"
    category = parts[1] if len(parts) > 2 else parts[0]
    subcategory = parts[2] if len(parts) > 3 else None
    return {"gender": gender, "category": category, "subcategory": subcategory}

def main():
    dataset_dir = "../dataset"
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        print(f"Created '{dataset_dir}' directory.")
        print("Please add some fashion/clothing images into the 'dataset' directory and run this script again!")
        return

    embeddings = []
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
    
    print(f"Scanning '{dataset_dir}' for images...")
    for root, _, files in os.walk(dataset_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in allowed_extensions:
                full_path = os.path.join(root, file)
                print(f"Extracting features for: {full_path}")
                features = extract_local_features(full_path)
                if features is not None:
                    cat = extract_category_from_path(full_path, dataset_dir)
                    embeddings.append({
                        "path": full_path,
                        "features": features,
                        "gender": cat["gender"],
                        "category": cat["category"],
                        "subcategory": cat["subcategory"]
                    })

    if embeddings:
        with open("embeddings.pkl", "wb") as f:
            pickle.dump(embeddings, f)
        print(f"Successfully generated embeddings.pkl with {len(embeddings)} items!")
        from collections import Counter
        cats = Counter(e["category"] for e in embeddings)
        print("\nCategory breakdown:")
        for cat, count in cats.most_common():
            print(f"  {cat}: {count} images")
    else:
        print("No images found or processed in the dataset directory. Add some fashion images and run again.")

if __name__ == "__main__":
    main()
