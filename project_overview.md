# StyleSync Project Overview & Structure

This document provides a clean, comprehensive description of the **StyleSync** full-stack visual recommendation project structure, tech stack, and component hierarchy. It is structured for easy sharing with other AI coding assistants.

---

## 📌 Project Summary
**StyleSync** is a visual clothing recommendation application. It contains two main components:
1. **Next.js Web Client (`my-app/`)**: A modern web interface using Next.js, React, Tailwind CSS v4, and Cloudinary for photo uploads.
2. **FastAPI ML Server (`ml-server/`)**: A Python-based backend that uses `MobileNetV2` (via Keras/TensorFlow) to perform image feature extraction, comparing uploaded query images against a database of clothes using `cosine_similarity` (scikit-learn).

---

## 📁 Project Directory Tree
```text
├── ml-server/
│   ├── .gitignore
│   ├── JALAJ.py
│   ├── app.py
│   ├── generate_embeddings.py
│   └── requirements.txt
└── my-app/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts
    │   │   │   └── signup/
    │   │   │       └── route.ts
    │   │   ├── health/
    │   │   │   └── route.ts
    │   │   ├── upload/
    │   │   │   └── route.ts
    │   │   └── user/
    │   │       └── route.ts
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── profile/
    │   │   └── page.tsx
    │   ├── signup/
    │   │   └── page.tsx
    │   ├── upload/
    │   │   └── page.tsx
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── auth/
    │   │   ├── AuthButton.tsx
    │   │   ├── LoginForm.tsx
    │   │   └── SignupForm.tsx
    │   ├── shared/
    │   │   ├── EmptyState.tsx
    │   │   ├── Loader.tsx
    │   │   └── PageContainer.tsx
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   └── theme-toggle.tsx
    │   ├── upload/
    │   │   ├── ImagePreview.tsx
    │   │   ├── ResultCard.tsx
    │   │   ├── UploadBox.tsx
    │   │   └── UploadButton.tsx
    │   └── web/
    │       └── navbar/
    │           ├── Navbar.tsx
    │           ├── logo.tsx
    │           └── theme-provider.tsx
    ├── constants/
    │   └── index.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useUpload.ts
    ├── lib/
    │   ├── auth.ts
    │   ├── cloudinary.ts
    │   ├── db.ts
    │   ├── utils.ts
    │   └── validations.ts
    ├── models/
    │   ├── Upload.ts
    │   └── User.ts
    ├── providers/
    │   └── ThemeProvider.tsx
    ├── public/
    │   ├── icons/
    │   ├── images/
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    ├── services/
    │   ├── auth.service.ts
    │   ├── upload.service.ts
    │   └── user.service.ts
    ├── styles/
    │   └── animations.css
    ├── types/
    │   ├── auth.types.ts
    │   ├── upload.types.ts
    │   └── user.types.ts
    ├── .env.local
    ├── .gitignore
    ├── AGENTS.md
    ├── CLAUDE.md
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## ⚙️ Tech Stack & Dependencies

### 1. Frontend Web Client (`my-app/`)
* **Framework**: Next.js 16.2.6 (App Router configuration)
* **Core Libraries**: React 19.2.4, TypeScript 5.x
* **Styling**: Tailwind CSS v4, Lucide Icons, Shadcn components, custom animations CSS
* **Key Dependencies**:
  * `cloudinary`: For handling cloud image uploads and hosting.
  * `next-themes`: Theme switching provider.
  * `class-variance-authority` & `tailwind-merge`: Utility tools for managing dynamic Tailwind classes.
  * `radix-ui` primitives: Headless UI components.

### 2. ML Recommendation Server (`ml-server/`)
* **API Framework**: FastAPI, Uvicorn (port 8000)
* **Machine Learning**: 
  * `TensorFlow` & `Keras`: Uses the pre-trained `MobileNetV2` model (excluding classification top layers, average pooling) for neural network feature extraction.
  * `scikit-learn`: Uses `cosine_similarity` to find nearest neighbors.
* **Other Libraries**: Pillow (Image processing), Numpy, Requests, Pickle (local database serialization in `embeddings.pkl`).

---

## 📂 Component & Module Architecture

### Frontend Application Layer
* **`/app`**: Contains all pages (dashboard, profile, login, signup, upload) and API endpoints (`api/auth/*`, `api/upload`, `api/user`, `api/health`).
* **`/components`**:
  * `auth/`: Forms and buttons for user authentication.
  * `upload/`: UI for selecting files, previewing, and showing recommendations.
  * `web/navbar/`: Site navigation elements.
  * `shared/` & `ui/`: Standard reusable page wrappers and basic UI components (buttons, dropdowns, loaders).
* **`/lib`**: Backend logic, Cloudinary connections, Mongoose db setups, validation schemas, and utility functions.
* **`/models`**: MongoDB schemas (`User`, `Upload`).
* **`/services`**: REST APIs client wrappers.

### Machine Learning Layer
* **`app.py`**: Launches FastAPI server. Serves `/recommend` endpoint that receives an image URL, downloads and processes it, runs MobileNetV2 prediction to extract high-dimensional features, and evaluates it against all stored item vectors.
* **`generate_embeddings.py`**: Reads images in the local dataset directory, extracts their MobileNetV2 feature vectors, and saves them to `embeddings.pkl` to optimize recommendations at query time.
