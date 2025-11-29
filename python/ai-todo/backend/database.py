from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from datetime import datetime

# Define MockCollection class
class MockCollection:
    def __init__(self):
        self._tasks = []
        self._id_counter = 1
    
    def find(self, query=None):
        return self._tasks
    
    def insert_one(self, task):
        from bson.objectid import ObjectId
        task["_id"] = ObjectId()
        self._tasks.append(task)
        return type('obj', (object,), {'inserted_id': task["_id"]})()
    
    def update_one(self, query, update):
        # Simple implementation for mock
        return type('obj', (object,), {'matched_count': 1})()
    
    def delete_one(self, query):
        # Simple implementation for mock
        return type('obj', (object,), {'deleted_count': 1})()
    
    def find_one(self, query):
        # Simple implementation for mock
        return self._tasks[0] if self._tasks else None

try:
    # Try to connect to MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Check if connection is successful
    client.admin.command('ping')
    db = client["taskflow_ai"]
    tasks_collection = db["tasks"]
    users_collection = db["users"]
    reminders_collection = db["reminders"]
    notifications_collection = db["notifications"]
    print("Connected to MongoDB successfully")
except ConnectionFailure:
    print("Failed to connect to MongoDB. Using in-memory storage instead.")
    tasks_collection = MockCollection()
    users_collection = MockCollection()
    reminders_collection = MockCollection()
    notifications_collection = MockCollection()
except Exception as e:
    print(f"Error connecting to MongoDB: {e}. Using in-memory storage instead.")
    tasks_collection = MockCollection()
    users_collection = MockCollection()
    reminders_collection = MockCollection()
    notifications_collection = MockCollection()