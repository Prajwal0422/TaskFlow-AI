from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import pytz
from datetime import datetime, timedelta
import urllib.parse
from bson.objectid import ObjectId
from database import tasks_collection, users_collection, reminders_collection, notifications_collection
import numpy as np
import json

# Scheduler setup
jobstores = {
    'default': MemoryJobStore()
}
executors = {
    'default': ThreadPoolExecutor(20)
}
scheduler = BackgroundScheduler(jobstores=jobstores, executors=executors, timezone=pytz.UTC)
scheduler.start()

def generate_calendar_url(title, description, start_time, end_time=None):
    """Generate a Google Calendar event URL"""
    # Format times for Google Calendar (ISO format without colons and dashes)
    start_formatted = start_time.strftime("%Y%m%dT%H%M%S")
    if end_time:
        end_formatted = end_time.strftime("%Y%m%dT%H%M%S")
    else:
        # Default to 1 hour duration
        end_time = start_time + timedelta(hours=1)
        end_formatted = end_time.strftime("%Y%m%dT%H%M%S")
    
    # Encode parameters
    title_encoded = urllib.parse.quote(title)
    description_encoded = urllib.parse.quote(description)
    
    # Google Calendar URL
    calendar_url = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={title_encoded}&details={description_encoded}&dates={start_formatted}/{end_formatted}"
    return calendar_url

def send_reminder(user_id, task_id, title, body):
    """Send a reminder to a user"""
    # This is where you would implement actual notification sending
    # For now, we'll just print to console and update the task status
    print(f"Reminder: {title} - {body} for user {user_id}")
    
    # Update task status to "reminded"
    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": "reminded"}}
    )
    
    # Store reminder in reminders collection
    reminder_doc = {
        "user_id": user_id,
        "task_id": task_id,
        "title": title,
        "body": body,
        "sent_at": datetime.utcnow().isoformat(),
        "method": "in-app"
    }
    reminders_collection.insert_one(reminder_doc)
    
    # Also store in notifications collection
    notification_doc = {
        "user_id": user_id,
        "title": title,
        "body": body,
        "type": "reminder",
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    }
    notifications_collection.insert_one(notification_doc)

def send_push_notification(user_id, title, body):
    """Send a push notification to a user"""
    print(f"Push notification: {title} - {body} for user {user_id}")
    
    # Store in notifications collection
    notification_doc = {
        "user_id": user_id,
        "title": title,
        "body": body,
        "type": "push",
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    }
    notifications_collection.insert_one(notification_doc)

def send_email_notification(user_id, title, body):
    """Send an email notification to a user"""
    print(f"Email notification: {title} - {body} for user {user_id}")
    
    # Store in notifications collection
    notification_doc = {
        "user_id": user_id,
        "title": title,
        "body": body,
        "type": "email",
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    }
    notifications_collection.insert_one(notification_doc)

def schedule_reminder(reminder_iso, user_id, task_id, title, body):
    """Schedule a reminder for a specific time"""
    try:
        # Parse the reminder time
        run_time = datetime.fromisoformat(reminder_iso.replace("Z", "+00:00"))
        
        # Add job to scheduler
        scheduler.add_job(
            send_reminder,
            'date',
            run_date=run_time,
            args=[user_id, task_id, title, body],
            id=f"reminder_{user_id}_{task_id}_{reminder_iso}"
        )
        
        # Generate calendar URL for this reminder
        calendar_url = generate_calendar_url(
            title, 
            body, 
            run_time
        )
        
        # Store calendar URL in reminders collection
        reminders_collection.update_one(
            {"user_id": user_id, "task_id": task_id},
            {"$set": {"calendar_url": calendar_url}},
            upsert=True
        )
        
        print(f"Scheduled reminder for {reminder_iso}")
        print(f"Calendar URL: {calendar_url}")
        return True
    except Exception as e:
        print(f"Error scheduling reminder: {e}")
        return False

def schedule_push_notification(notification_time_iso, user_id, title, body):
    """Schedule a push notification for a specific time"""
    try:
        # Parse the notification time
        run_time = datetime.fromisoformat(notification_time_iso.replace("Z", "+00:00"))
        
        # Add job to scheduler
        scheduler.add_job(
            send_push_notification,
            'date',
            run_date=run_time,
            args=[user_id, title, body],
            id=f"push_{user_id}_{notification_time_iso}"
        )
        
        print(f"Scheduled push notification for {notification_time_iso}")
        return True
    except Exception as e:
        print(f"Error scheduling push notification: {e}")
        return False

def schedule_email_notification(notification_time_iso, user_id, title, body):
    """Schedule an email notification for a specific time"""
    try:
        # Parse the notification time
        run_time = datetime.fromisoformat(notification_time_iso.replace("Z", "+00:00"))
        
        # Add job to scheduler
        scheduler.add_job(
            send_email_notification,
            'date',
            run_date=run_time,
            args=[user_id, title, body],
            id=f"email_{user_id}_{notification_time_iso}"
        )
        
        print(f"Scheduled email notification for {notification_time_iso}")
        return True
    except Exception as e:
        print(f"Error scheduling email notification: {e}")
        return False

def schedule_recurring_reminder(start_time_iso, user_id, task_id, title, body, recurrence_pattern):
    """Schedule a recurring reminder based on pattern (daily, weekly, monthly)"""
    try:
        # Parse the start time
        start_time = datetime.fromisoformat(start_time_iso.replace("Z", "+00:00"))
        
        # Determine the recurrence pattern
        if recurrence_pattern == "daily":
            scheduler.add_job(
                send_reminder,
                'interval',
                days=1,
                start_date=start_time,
                args=[user_id, task_id, title, body],
                id=f"recurring_daily_{user_id}_{task_id}_{start_time_iso}"
            )
        elif recurrence_pattern == "weekly":
            scheduler.add_job(
                send_reminder,
                'interval',
                weeks=1,
                start_date=start_time,
                args=[user_id, task_id, title, body],
                id=f"recurring_weekly_{user_id}_{task_id}_{start_time_iso}"
            )
        elif recurrence_pattern == "monthly":
            scheduler.add_job(
                send_reminder,
                'interval',
                days=30,
                start_date=start_time,
                args=[user_id, task_id, title, body],
                id=f"recurring_monthly_{user_id}_{task_id}_{start_time_iso}"
            )
        
        # Generate calendar URL for recurring event
        calendar_url = generate_calendar_url(
            title, 
            body, 
            start_time
        )
        
        # Store calendar URL in reminders collection
        reminders_collection.update_one(
            {"user_id": user_id, "task_id": task_id},
            {"$set": {"calendar_url": calendar_url, "recurrence": recurrence_pattern}},
            upsert=True
        )
        
        print(f"Scheduled recurring reminder ({recurrence_pattern}) starting at {start_time_iso}")
        print(f"Calendar URL: {calendar_url}")
        return True
    except Exception as e:
        print(f"Error scheduling recurring reminder: {e}")
        return False

def cancel_reminder(reminder_id):
    """Cancel a scheduled reminder"""
    try:
        scheduler.remove_job(reminder_id)
        print(f"Cancelled reminder {reminder_id}")
        return True
    except Exception as e:
        print(f"Error cancelling reminder: {e}")
        return False

def get_scheduled_reminders(user_id):
    """Get all scheduled reminders for a user"""
    try:
        jobs = scheduler.get_jobs()
        user_reminders = []
        for job in jobs:
            if f"user_{user_id}" in job.id:
                user_reminders.append({
                    "id": job.id,
                    "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                    "args": job.args
                })
        return user_reminders
    except Exception as e:
        print(f"Error getting scheduled reminders: {e}")
        return []

def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors"""
    if not a or not b:
        return 0
    try:
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)
    except:
        return 0

def update_user_embedding(user_id, task_embedding):
    """Update user embedding with new task embedding for personalization"""
    try:
        # Get current user embedding
        user_doc = users_collection.find_one({"_id": user_id})
        if not user_doc:
            # Create new user if doesn't exist
            users_collection.insert_one({
                "_id": user_id,
                "name": f"User {user_id}",
                "timezone": "UTC",
                "notification_methods": {"webpush": True, "email": True},
                "behavior_stats": {},
                "user_embedding": task_embedding,
                "created_at": datetime.utcnow().isoformat()
            })
            return
        
        # Update existing user embedding as running average
        current_embedding = user_doc.get("user_embedding", [])
        if current_embedding:
            # Compute running average
            alpha = 0.1  # Learning rate
            new_embedding = [
                (1 - alpha) * current + alpha * new 
                for current, new in zip(current_embedding, task_embedding)
            ]
        else:
            new_embedding = task_embedding
        
        users_collection.update_one(
            {"_id": user_id},
            {"$set": {"user_embedding": new_embedding}}
        )
    except Exception as e:
        print(f"Error updating user embedding: {e}")

def compute_task_score(task, user_profile):
    """Compute personalized score for a task based on user profile"""
    try:
        # due urgency: 1 if due within 24h, 0.5 if within 3 days, else 0
        due_score = 0
        if task.get("due_date"):
            due_date = datetime.fromisoformat(task["due_date"].replace("Z", "+00:00"))
            delta_hours = (due_date - datetime.utcnow()).total_seconds() / 3600
            due_score = max(0, 1 - delta_hours/72)  # decays over 72 hours
        
        # similarity to user embedding
        user_embedding = user_profile.get("user_embedding", [])
        task_embedding = task.get("bert_vector", [])
        similarity = cosine_similarity(user_embedding, task_embedding)
        
        # estimated time factor (prefer shorter tasks)
        est = min(1, 30/task.get("estimated_minutes", 30)) if task.get("estimated_minutes") else 0.5
        
        # historical priority adjustment
        hist_adj = user_profile.get("priority_adjustment", 0)  # [-0.2..0.2]
        
        # weighted score
        score = 0.45*due_score + 0.25*similarity + 0.2*est + 0.1*hist_adj
        return score
    except Exception as e:
        print(f"Error computing task score: {e}")
        return 0.5

def schedule_ai_reminders(ai_reminder_recs, user_id):
    """Schedule all AI-recommended reminders"""
    scheduled_count = 0
    for reminder in ai_reminder_recs:
        success = schedule_reminder(
            reminder["reminder_iso"], 
            user_id, 
            reminder.get("task_id", "default"), 
            reminder.get("task", "Reminder"), 
            f"Reminder for: {reminder.get('task', 'Task')}"
        )
        if success:
            scheduled_count += 1
    
    return scheduled_count