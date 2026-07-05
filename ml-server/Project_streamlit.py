import streamlit as st
import requests
from PIL import Image

# Page Config
st.set_page_config(
    page_title="DressUp AI",
    page_icon="👕",
    layout="wide"
)

st.title("👠 Style Sync")
st.subheader("AI-Powered Clothing Recommendation System")

# Upload Image
uploaded_file = st.file_uploader(
    "Upload a clothing image",
    type=["jpg", "jpeg", "png", "webp"]
)

if uploaded_file is not None:

    # Show uploaded image
    image = Image.open(uploaded_file)

    col1, col2 = st.columns([1, 2])

    with col1:
        st.image(
            image,
            caption="Uploaded Image",
            use_container_width=True
        )

    with col2:

        if st.button("Get Recommendations"):

            with st.spinner("Finding similar clothes..."):

                try:

                    files = {
                        "file": (
                            uploaded_file.name,
                            uploaded_file.getvalue(),
                            uploaded_file.type
                        )
                    }

                    response = requests.post(
                        "http://127.0.0.1:8000/recommend",
                        files=files
                    )

                    if response.status_code == 200:

                        data = response.json()

                        st.success("Recommendations Generated!")

                        matches = data["matches"]

                        st.subheader("Top Similar Items")

                        cols = st.columns(len(matches))

                        for idx, item in enumerate(matches):

                            with cols[idx]:

                                st.image(
                                    item["image"],
                                    use_container_width=True
                                )

                                st.metric(
                                    "Similarity",
                                    f"{item['score']:.2f}"
                                )
                                st.caption(f"{item['gender']} • {item['category']} • {item['subcategory']}")

                    else:

                        st.error(
                            f"Server Error: {response.text}"
                        )

                except Exception as e:

                    st.error(str(e))