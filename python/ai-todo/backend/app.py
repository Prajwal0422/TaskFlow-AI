# import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# if GOOGLE_API_KEY:
#     # Use the correct configuration method
#     genai.configure(api_key=GOOGLE_API_KEY)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["taskflow_ai"]
tasks_collection = db["tasks"]
users_collection = db["users"]
reminders_collection = db["reminders"]
notifications_collection = db["notifications"]

# Create FastAPI app
app = FastAPI(title="TaskFlow AI Backend")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from routes.tasks.tasks import router as tasks_router
from routes.users.users import router as users_router
from routes.ai.ai import router as ai_router

# Include routers
app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])

@app.get("/")
def root():
    return {"message": "TaskFlow AI Backend running"}

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host="0.0.0.0", port=8004)
    except KeyboardInterrupt:
        print("Server shutdown complete")