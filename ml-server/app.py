from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from keras.preprocessing import image
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.staticfiles import StaticFiles
from PIL import Image
from io import BytesIO
import numpy as np
import pickle
import os

app = FastAPI(
    title="DressUp AI ML Recommendation Server",
    description="MobileNetV2 based feature extraction and visual similarity recommendation",
    version="1.0.0"
)

# Enable CORS so Next.js frontend/backend can communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Dataset path
DATASET_DIR = "../dataset"

# Ensure dataset directory exists
if not os.path.exists(DATASET_DIR):
    os.makedirs(DATASET_DIR)

app.mount(
    "/dataset",
    StaticFiles(directory=DATASET_DIR),
    name="dataset"
)


# Load MobileNet model
print("Loading MobileNetV2 model...")
model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    pooling='avg'
)
print("MobileNetV2 loaded successfully.")

# Path to embeddings file
EMBEDDINGS_FILE = "embeddings.pkl"

# Load embeddings once at startup
print("Loading embeddings...")
with open(EMBEDDINGS_FILE, "rb") as f:
    embeddings_data = pickle.load(f)
print(f"Loaded {len(embeddings_data)} embeddings.")

# Feature extraction function
def extract_features_from_image(img):

    img = img.resize((224, 224))

    if img.mode != "RGB":

        img = img.convert("RGB")

    img_array = image.img_to_array(img)

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    img_array = preprocess_input(
        img_array
    )

    features = model.predict(
        img_array
    )

    return features.flatten()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "DressUp AI ML Recommendation Server is running!",
        "total_embeddings": len(embeddings_data)
    }

@app.post("/recommend")

async def recommend_similar(
    file: UploadFile = File(...)
):

    try:

        # Read uploaded image
        contents = await file.read()

        img = Image.open(
            BytesIO(contents)
        )

        # Extract features
        query_features = extract_features_from_image(img)

        results = []

        for item in embeddings_data:

            similarity = cosine_similarity(
                [query_features],
                [item["features"]]
            )[0][0]

            results.append({
                "path": item["path"],
                "score": float(similarity),
                "category": item["category"],
                "gender": item["gender"],
                "subcategory": item["subcategory"]
            })

        results = sorted(
            results,
            key=lambda x: x["score"],
            reverse=True
        )

        top_matches = results[:5]

        response = []

        for item in top_matches:

            image_url = (
                "http://127.0.0.1:8000/"
                + item["path"].replace("\\", "/")
            )

            response.append({
                "image": image_url,
                "score": round(item["score"], 2),
                "category": item["category"],
                "gender": item["gender"],
                "subcategory": item["subcategory"]
            })

        return {
            "success": True,
            "matches": response
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
