from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from io import BytesIO
from ML_Model import classify_image, recommend_outfit
import os
import requests

from pydantic import BaseModel



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

# async def recommend_similar(
#     file: UploadFile = File(...)
# ):

#     try:

#         # Read uploaded image
#         contents = await file.read()

#         img = Image.open(
#             BytesIO(contents)
#         )

#         top_matches = find_similar(img)



#         response = []

#         for item in top_matches:

#             image_url = (
#                 "http://127.0.0.1:8000/"
#                 + item["path"].replace("\\", "/")
#             )

#             response.append({
#                 "image": image_url,
#                 "score": round(item["score"], 2),
#                 "category": item["category"],
#                 "gender": item["gender"],
#                 "subcategory": item["subcategory"]
#             })

#         return {
#             "success": True,
#             "matches": response
#         }
#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


class ClassifyRequest(BaseModel):
    imageUrl: str

@app.post("/classify")
async def classify(req: ClassifyRequest):
    try:
        response = requests.get(req.imageUrl, timeout=10)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        result = classify_image(img)
        return {
            "success": True,
            "articleType": result["articleType"],
            "confidence": result["confidence"]
        }
    except requests.RequestException:
        raise HTTPException(
            status_code=400,
            detail="Unable to download image."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
# @app.post("/recommend-outfit")
# async def recommend_outfit_endpoint(
#     occasion: str,
#     files: list[UploadFile] = File(default = [])
# ):
#     try:
#         wardrobe = []
#         for f in files:
#             contents = await f.read()
#             img = Image.open(BytesIO(contents))
#             wardrobe.append({
#                 "image": img })
        
#         result = recommend_outfit(wardrobe, occasion)
        
#         return {
#             "success": True,
#             "occasion": result["occasion"],
#             "outfit": {
#                 slot: {
#                     "articleType": item["articleType"],
                    
                    
#                 } if item else None
#                 for slot, item in result["outfit"].items()
#             }
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

class OutfitRequest(BaseModel):
    occasion: str
    wardrobe: list

@app.post("/recommend-outfit")
async def recommend_outfit_endpoint(req: OutfitRequest):
    try:
        result = recommend_outfit(
            req.wardrobe,
            req.occasion
        )

        return {
            "success": True,
            "occasion": result["occasion"],
            "outfit": result["outfit"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
