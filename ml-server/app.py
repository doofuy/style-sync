from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from io import BytesIO
from ML_Model import find_similar
import os

app = FastAPI(
    title="Style Sync ML Recommendation Server",
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Style Sync ML Recommendation Server is running!",
        
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

        top_matches = find_similar(img)



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
