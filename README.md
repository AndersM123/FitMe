# 🧥 FitMe — Your Virtual Wardrobe

**FitMe** is a modern web app that lets users digitize their clothing, organize outfits, and try them on virtually.  
Built with **Angular (frontend)** and a **Node/Python backend**, it combines AI background removal and an interactive drag-and-drop mannequin to make outfit planning simple and fun.

---

## ✨ Features

- **📸 Upload Your Clothes**  
  Take or upload photos of your clothes directly from your phone or computer.

- **🧠 AI-Powered Background Removal**  
  Automatically removes image backgrounds using a **Hugging Face model** for clean, transparent cutouts.

- **🧍 Virtual Mannequin**  
  Drag and drop clothing items onto a mannequin to visualize outfit combinations.

- **👕 Organized Wardrobe**  
  Store, categorize, and preview all your items in a personalized digital wardrobe.

- **⚡ Progressive Web App (PWA)**  
  Works on both desktop and mobile — installable like a native iPhone app.

---

## 🛠️ Tech Stack

| Area | Technology |
|------|-------------|
| Frontend | **Angular**, TypeScript, SCSS |
| Backend | **Node.js / Express**, **Python** (for AI model integration) |
| AI / ML | **Hugging Face** `Trendyol/background-removal` |
| Storage | Local uploads (S3 or Cloudinary ready) |
| Version Control | Git + GitHub |
| Architecture | Modular monorepo (`FitmeFrontend` + `FitmeBackend`) |

---

## 🚀 Project Structure

| Folder | Description |
|---------|--------------|
| **FitmeFrontend/** | Angular Progressive Web App (PWA) |
| ├── **src/app/** | Core components, pages, and services |
| ├── **assets/** | Static assets (icons, mock images, etc.) |
| └── ... | Other Angular configuration files |
| **FitmeBackend/** | Node.js + Express backend API |
| ├── **server.js** | Main server entry point (routes to Python) |
| ├── **python_backend/** | Python-based AI integration layer |
| │ └── **background-removal/** | Trendyol IS-Net background removal model |
| │     ├── `server.py` | FastAPI model endpoint |
| │     ├── `model.onnx` | ONNX model weights |
| │     ├── `utils.py` | Image preprocessing utilities |
| │     └── `requirements.txt` | Python dependencies |
| └── ... | Other backend support files |
| **README.md** | Project overview, setup instructions, and documentation |

---

🧩 Setup Guide
1. Clone the repo
 - git clone https://github.com/AndersM123/FitMe.git
 - cd FitMe

2. Frontend setup
 - cd FitmeFrontend
 - npm install
 - ng serve

The app will start on http://localhost:4200

3. The backend setup
 - cd ../FitmeBackend
 - node server.js

4. The backend setup for the ai model
 - cd python_backend/background-removal
 - pip install -r requirements.txt
 - pip install fastapi uvicorn
 - python -m uvicorn server:app --port 7000

 - Test the python backend (optional)
 -   curl -X POST http://localhost:7000/remove-background --data-binary "@sample.jpg" -o result.png



🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to add or modify.

🧠 Inspiration

This project was created to explore how AI + fashion + PWA can make digital wardrobes both practical and fun.
Whether you're planning outfits, organizing your closet, or testing how things fit together — FitMe gives you a smart, visual way to manage your style.

📸 Demo Preview (coming soon)

A short demo video or screenshots of the virtual wardrobe will be added here.

📄 License

MIT © 2025 Anders M.
