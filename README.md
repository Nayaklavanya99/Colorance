# Colorance 🎨  
*AI-Powered Black & White Image Colorization*



## ✨ Overview

**Colorance** brings old memories to life by transforming black & white images into vibrant color using state-of-the-art deep learning. Upload your grayscale photo and let AI do the magic!

---

## 🚀 Features

- ⚡ Fast, automatic colorization of B&W images
- 🖼️ Side-by-side comparison of original and colorized results
- ⬇️ Download your colorized images instantly
- 🌐 Modern, responsive web interface
- 🔒 No sign-up required (optional: add authentication if enabled)

---

## 🛠️ Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:5000` by default.

---

## 🖥️ Usage

1. **Upload** a black & white image via the web interface.
2. **Wait** for the AI to process and colorize your image.
3. **Compare** the original and colorized images side-by-side.
4. **Download** the colorized result with a single click.

---

## 📁 Project Structure

```
backend/
  app.py
  requirements.txt
  makeitcolor/
    configuration.json
    pytorch_model.pt
    README.md
  uploads/
frontend/
  package.json
  public/
  src/
    App.js
    components/
```

---

## 🧠 Model

- The colorization model is a PyTorch neural network stored at  
  `backend/makeitcolor/pytorch_model.pt`.
- See [`backend/makeitcolor/README.md`](backend/makeitcolor/README.md) for model details.

---

## 📦 Requirements

- Python 3.8+
- Node.js 14+
- See [`backend/requirements.txt`](backend/requirements.txt) and [`frontend/package.json`](frontend/package.json) for dependencies.

---

## 📝 License

This project is licensed under the [Apache 2.0 License](backend/makeitcolor/README.md).

---

## 🙏 Credits

- Model and code by [Your Name/Team]
- Powered by PyTorch, React, and HuggingFace

---

## 📬 Contact

For questions or feedback, open an issue or email:  
**your.email@example.com**

---

*Bring your memories to life with Colorance!*