# 👔 Style Sync

Style Sync is an AI-powered fashion assistant that uses Computer Vision and Deep Learning to understand clothing items, classify them, find visually similar products, and recommend outfits based on different occasions.

## ✨ Features

- 🔍 Similar Clothing Recommendation using MobileNetV2 embeddings
- 🏷️ Clothing Classification with confidence scores
- 👔 Occasion-Based Outfit Recommendation (College, Casual, Date, Interview)
- ⚡ FastAPI backend for ML inference
- 🎨 Streamlit interface for quick interaction

## 🛠️ Tech Stack

- Python
- TensorFlow / Keras
- MobileNetV2
- FastAPI
- Streamlit
- NumPy
- Scikit-learn
- Pillow

## 📂 Project Structure

```
├── dataset/
├── embeddings.pkl
├── generate_embeddings.py
├── ML_Model.py
├── app.py
├── Project_streamlit.py
├── best_model.keras
└── README.md
```

## 🚀 Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd StyleSync
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Start the FastAPI server

```bash
uvicorn app:app --reload
```

4. Launch the Streamlit app

```bash
streamlit run Project_streamlit.py
```

## 🔮 Future Improvements

- Virtual Wardrobe
- AI Stylist
- Personalized Outfit Recommendations
- Weather-Based Suggestions
- Shopping Recommendations
- Outfit Ranking Engine

## 📌 Vision

Style Sync aims to become an AI-powered digital wardrobe that helps users make smarter fashion decisions through intelligent outfit recommendations and computer vision.
