from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv  

load_dotenv()

# MongoDB setup
# client = MongoClient(os.getenv("MONGO_CONNECTION_STRING"))
client = MongoClient("mongodb://localhost:27017/")  # Local MongoDB for development
db = client["automated_recruitment_system"]
resumes_collection = db["resumes"]
matched_resumes_collection = db["matched_resumes"]
interviews_collection = db["interviews"]
messaged_collection = db["Messaged"]
scheduled_collection = db["Scheduled"]
users_collection = db["users"]
availability_collection = db["availability"]
conversations_collection = db["Conversations"]
slots_collection = db['Slots']
selected_collection = db['Selected']
rejected_collection = db['Rejected']    