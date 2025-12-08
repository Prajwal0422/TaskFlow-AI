<p align="center">
  
![Status](https://img.shields.io/badge/Project%20Status-Active-brightgreen)
![AI](https://img.shields.io/badge/AI-Smart%20Engine-red)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-purple)
![License](https://img.shields.io/badge/License-MIT-lightgray)

</p>

# 🚀 TaskFlow-AI — Intelligent Productivity System

TaskFlow-AI is an **AI-powered productivity assistant** that goes beyond traditional to-do list apps.  
It **learns your behavior**, organizes tasks intelligently, and helps you execute work efficiently with:

- AI categorization  
- Smart scheduling  
- Prioritization scoring  
- Time-awareness  
- Mood-based productivity recommendations  
- Smart task breakdowns  

---

## 🌟 Why TaskFlow-AI?

Most tools store tasks — **TaskFlow-AI thinks.**

It predicts **when and how** you should work based on:

| Factor | Considered by System? |
|--------|------------------------|
| Task urgency | ✔ |
| Difficulty level | ✔ |
| Deadlines | ✔ |
| Estimated effort | ✔ |
| User mood & fatigue | ✔ |
| Past behavior patterns | ✔ |

---

## 🧠 Features

| Category | Function |
|----------|----------|
| ✨ AI Task Classification | NLP-based task understanding |
| ⏳ Smart Scheduling | Suggests when to do tasks |
| 🎯 Priority Score | Calculates importance + urgency |
| 🧠 Task Breakdown | Converts big tasks → micro tasks |
| 📝 Natural Language Input | e.g., "Submit report by Tuesday" |
| 🔔 Notifications & Reminders | Coming soon |
| 📦 Export / Backup Tasks | JSON or PDF format |

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI |
| AI/NLP | spaCy / Sentence-Transformers (optional) |
| Task Ranking Model | Custom scoring algorithm + optional ML |
| Storage | JSON / SQLite / MongoDB (configurable) |
| Interface | CLI / Web UI (future extension) |

---

## 📁 Folder Structure



# 🚀 HoloTask AI — Intelligent Productivity System  

> AI-powered task manager with smart scheduling, automatic prioritization, and a futuristic interface designed to help you stay productive without overwhelm.

---

## 🌟 Overview  

HoloTask AI is an advanced productivity assistant that learns from your behavior and helps you manage tasks intelligently.  
It doesn't just store tasks — it **thinks**, **predicts**, and **guides** you toward completing them using:

- AI categorization  
- Smart scheduling  
- Priority scoring  
- Semantic search  
- Personalized optimization  

Designed with a **modern futuristic UI**, HoloTask AI combines aesthetics and intelligence into a seamless workflow experience.

---

## 🧠 Key Features  

| Feature | Description |
|--------|------------|
| 🤖 AI Task Assistant | Categorizes tasks, assigns priority & suggests next steps |
| ⏳ Smart Auto-Scheduler | Automatically plans your day based on urgency & free time |
| 🔍 Natural Language Input | Add tasks like `"Meeting with John tomorrow at 5pm"` |
| 📊 Insights Dashboard | Charts showing productivity trends |
| 🧱 Workflow Board (Kanban+) | Drag-and-drop pipeline for task stages |
| 🔔 Push Reminders | Notifications via push, email, or schedule |
| 🗣 Voice Task Input | Speech-to-task support |
| 📅 Calendar Mode | Full time-block planning |
| 🧬 Personalization Engine | Learns your patterns & adapts priority logic |
| ☀️🌙 Light/Dark Theme | Theme remembers preference automatically |
| 📶 Offline Mode | Works even without internet (sync when reconnecting) |

---

## 🖼️ Screenshots  
_(Add once ready)_  
📌 dashboard.png
📌 workflow-board.png
📌 ai-assistant.png


---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), TailwindCSS, Framer Motion, Headless UI |
| Backend | FastAPI (Python), OpenAI API, APScheduler |
| Database | MongoDB |
| AI | OpenAI + Sentence Transformers (BERT embeddings) |
| Notifications | Web Push, Email (SendGrid/SMTP) |
| Dev Tools | npm, pip, Postman, Vercel/Netlify, Docker (optional) |

---

## 📂 Project Structure



HoloTask-AI/
│
├── holotask-backend/
│ ├── main.py
│ ├── routes/
│ ├── scheduler/
│ ├── models/
│ ├── utils/
│ ├── requirements.txt
│ └── .env.example
│
├── holotask-frontend/
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── vite.config.js
│
├── README.md
└── LICENSE


---

## ⚙️ Setup and Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/YOUR_USERNAME/HoloTask-AI.git
cd HoloTask-AI

2️⃣ Backend Setup (FastAPI)
cd holotask-backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt


Create .env file:

OPENAI_API_KEY=your_key_here
MONGO_URI=your_mongodb_uri
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
SENDGRID_API_KEY=


Run backend:

uvicorn main:app --reload --host 0.0.0.0 --port 8000

3️⃣ Frontend Setup
cd holotask-frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev

🔌 API Endpoints Summary
Method	Endpoint	Description
GET	/tasks	Fetch all tasks
POST	/add-task	Create new task
PATCH	/edit-task	Edit existing task
DELETE	/delete-task/:id	Delete task
POST	/ai-suggest	AI classification, scheduling & priority
GET	/insights	Fetch productivity analytics
🧪 Testing
pytest

🌍 Deployment

Frontend: Vercel / Netlify

Backend: Render / Railway / AWS / Azure

Database: MongoDB Atlas

🧭 Roadmap

 AI Habit Builder

 Multi-user collaboration

 Mobile app

 Spotify / Calendar / Email integrations

🤝 Contributing

Contributions are welcome!

Steps:

Fork repo

Create feature branch

Make changes

Submit pull request

📄 License

MIT License © 2025 — HoloTask AI

👨‍💻 Developer

Prajwal Y Jain
💬 Always learning. Always building.


---

---

# 🎁 BONUS: Requirements.txt (Backend)

```txt
fastapi
uvicorn
pymongo
python-dotenv
openai
sentence-transformers
numpy
scikit-learn
apscheduler
pywebpush
sendgrid
pydantic
passlib
requests
