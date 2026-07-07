import streamlit as st
import requests
from PIL import Image

# Page Config
st.set_page_config(
    page_title="Style Sync",
    page_icon="👕",
    layout="wide"
)

st.title("👠 Style Sync")
st.subheader("AI-Powered Personal Stylist")

# Tabs
tab1, tab2, tab3 = st.tabs(["🔍 Similar Items", "🏷️ Classify", "👔 Outfit Recommender"])

# ── Tab 1: Similar Items ──
with tab1:
    uploaded_file = st.file_uploader(
        "Upload a clothing image",
        type=["jpg", "jpeg", "png", "webp"],
        key="recommend"
    )

    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        col1, col2 = st.columns([1, 2])

        with col1:
            st.image(image, caption="Uploaded Image", use_container_width=True)

        with col2:
            if st.button("Get Similar Items"):
                with st.spinner("Finding similar clothes..."):
                    try:
                        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                        response = requests.post("http://127.0.0.1:8000/recommend", files=files)

                        if response.status_code == 200:
                            data = response.json()
                            st.success("Recommendations Generated!")
                            matches = data["matches"]
                            st.subheader("Top Similar Items")
                            cols = st.columns(len(matches))
                            for idx, item in enumerate(matches):
                                with cols[idx]:
                                    st.image(item["image"], use_container_width=True)
                                    st.metric("Similarity", f"{item['score']:.2f}")
                                    st.caption(f"{item['gender']} • {item['category']} • {item['subcategory']}")
                        else:
                            st.error(f"Server Error: {response.text}")

                    except Exception as e:
                        st.error(str(e))

# ── Tab 2: Classify ──
with tab2:
    uploaded_file2 = st.file_uploader(
        "Upload a clothing image to classify",
        type=["jpg", "jpeg", "png", "webp"],
        key="classify"
    )

    if uploaded_file2 is not None:
        uploaded_file2.seek(0)
        image2 = Image.open(uploaded_file2)
        image2.load()   # Force PIL to read the image completely
        col1, col2 = st.columns([1, 2])

        with col1:
            st.image(image2, caption="Uploaded Image", use_container_width=True)

        with col2:
            if st.button("Classify This Item"):
                with st.spinner("Classifying..."):
                    try:
                        files = {"file": (uploaded_file2.name, uploaded_file2.getvalue(), uploaded_file2.type)}
                        response = requests.post("http://127.0.0.1:8000/classify", files=files)

                        if response.status_code == 200:
                            data = response.json()
                            st.success("Classification Done!")
                            st.metric("Article Type", data["articleType"])
                            st.metric("Confidence", f"{data['confidence'] * 100:.0f}%")
                        else:
                            st.error(f"Server Error: {response.text}")

                    except Exception as e:
                        st.error(str(e))

# ── Tab 3: Outfit Recommender ──
with tab3:
    st.subheader("Upload your wardrobe & get outfit suggestions")

    occasion = st.selectbox(
        "Select Occasion",
        ["college", "date", "interview", "casual"]
    )

    wardrobe_files = st.file_uploader(
        "Upload your wardrobe images (multiple)",
        type=["jpg", "jpeg", "png", "webp"],
        accept_multiple_files=True,
        key="outfit"
    )

    if wardrobe_files:
        st.write(f"{len(wardrobe_files)} items uploaded")

        cols = st.columns(len(wardrobe_files))
        for idx, f in enumerate(wardrobe_files):
            with cols[idx]:
                f.seek(0)
                img = Image.open(f)
                img.load()
                st.image(img, use_container_width=True)
                st.caption(f.name)

        if st.button("Get Outfit Recommendation"):
            with st.spinner("AI is styling your outfit..."):
                try:
                    files = [("files", (f.name, f.getvalue(), f.type)) for f in wardrobe_files]
                    response = requests.post(
                        "http://127.0.0.1:8000/recommend-outfit",
                        params={"occasion": occasion},
                        files=files
                    )

                    if response.status_code == 200:
                        data = response.json()
                        st.success(f"Outfit for {occasion.capitalize()} Ready!")

                        outfit = data["outfit"]
                        col1, col2, col3 = st.columns(3)

                        with col1:
                            st.subheader("👕 Topwear")
                            if outfit["topwear"]:
                                st.metric("Item", outfit["topwear"]["articleType"])
                                
                            else:
                                st.warning("No suitable topwear found")

                        with col2:
                            st.subheader("👖 Bottomwear")
                            if outfit["bottomwear"]:
                                st.metric("Item", outfit["bottomwear"]["articleType"])
                                
                            else:
                                st.warning("No suitable bottomwear found")

                        with col3:
                            st.subheader("👟 Footwear")
                            if outfit["footwear"]:
                                st.metric("Item", outfit["footwear"]["articleType"])
                               
                            else:
                                st.warning("No suitable footwear found")

                    else:
                        st.error(f"Server Error: {response.text}")

                except Exception as e:
                    st.error(str(e))