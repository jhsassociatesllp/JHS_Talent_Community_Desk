# # whatsapp_routes.py

# from fastapi import APIRouter, Request, HTTPException
# from database.db import *
# import requests, os, json
# from datetime import datetime, timedelta
# from dotenv import load_dotenv
# from database.auth import *

# load_dotenv()

# whatsapp_router = APIRouter()

# INFOBIP_API_KEY = os.getenv("INFOBIP_API_KEY")
# INFOBIP_BASE_URL = os.getenv("INFOBIP_BASE_URL")
# WHATSAPP_SENDER = os.getenv("WHATSAPP_SENDER")
# PRE_INTERVIEW_FORM_URL = os.getenv("PRE_INTERVIEW_FORM_URL")


# # ----------------------------- Helper -----------------------------
# def send_to_infobip(endpoint, payload):
#     url = f"{INFOBIP_BASE_URL}{endpoint}"
#     headers = {
#         "Authorization": INFOBIP_API_KEY,
#         "Content-Type": "application/json",
#         "Accept": "application/json"
#     }
#     res = requests.post(url, data=json.dumps(payload), headers=headers)
#     print(f"\n=== Request to {endpoint} ===")
#     print(json.dumps(payload, indent=2))
#     print("Response:", res.status_code, res.text)
#     return res


# # ----------------------------- Infobip Templates -----------------------------
# def send_shortlist_template(to_number, name, role):
#     to_number = "91" + to_number
#     payload = {
#         "messages": [{
#             "from": WHATSAPP_SENDER,
#             "to": to_number,
#             "content": {
#                 "templateName": "shortlist_notification_template",
#                 "language": "en_US",
#                 "templateData": {
#                     "body": {"placeholders": [name, role]},
#                     "buttons": [
#                         {"type": "QUICK_REPLY", "parameter": "Yes"},
#                         {"type": "QUICK_REPLY", "parameter": "No"}
#                     ]
#                 }
#             }
#         }]
#     }
#     send_to_infobip("/whatsapp/1/message/template", payload)

# def send_date_selection_list(to_number, name, company, available_dates):
#     to_number = "91" + to_number
#     rows = [
#         {"id": f"date_{date}", "title": date, "description": f"Interview available on {date}"}
#         for date in available_dates[:5]
#     ]
#     payload = {
#         "from": WHATSAPP_SENDER,
#         "to": to_number,
#         "messageId": f"date-{os.urandom(4).hex()}",
#         "content": {
#             "body": {"text": f"Hi {name} 👋\nPlease select your preferred *interview date* with {company}."},
#             "action": {"title": "Select Date", "sections": [{"title": "Available Dates", "rows": rows}]},
#             "footer": {"text": "JHS Connect Bot"}
#         }
#     }
#     send_to_infobip("/whatsapp/1/message/interactive/list", payload)

# def send_shift_selection_template(to_number, name, selected_date):
#     to_number = "91" + to_number
#     payload = {
#         "messages": [{
#             "from": WHATSAPP_SENDER,
#             "to": to_number,
#             "content": {
#                 "templateName": "interview_shift_selection",
#                 "language": "en_US",
#                 "templateData": {
#                     "body": {"placeholders": [name, selected_date]},
#                     "buttons": [
#                         {"type": "QUICK_REPLY", "parameter": "Morning"},
#                         {"type": "QUICK_REPLY", "parameter": "Afternoon"}
#                     ]
#                 }
#             }
#         }]
#     }
#     send_to_infobip("/whatsapp/1/message/template", payload)

# def send_slot_selection_list(to_number, name, selected_date, selected_shift, slots):
#     to_number = "91" + to_number
#     rows = [
#         {
#             "id": f"slot_{slot}_{selected_date}",
#             "title": slot[:24],  # Direct from DB, max 24 chars
#             "description": f"{selected_shift.title()} slot"
#         }
#         for slot in slots
#     ]
#     payload = {
#         "from": WHATSAPP_SENDER,
#         "to": to_number,
#         "messageId": f"slot-{os.urandom(4).hex()}",
#         "content": {
#             "body": {"text": f"Hi {name} 👋\nSelect your preferred *{selected_shift}* slot for *{selected_date}*:"},
#             "action": {"title": "Select Slot", "sections": [{"title": f"{selected_shift.title()} Slots", "rows": rows}]},
#             "footer": {"text": "JHS Connect Bot"}
#         }
#     }
#     send_to_infobip("/whatsapp/1/message/interactive/list", payload)

# def send_confirmation(to_number, name, role, selected_date, slot):
#     to_number = "91" + to_number
#     start_time = slot.split(' - ')[0]
#     end_time = slot.split(' - ')[1]
#     payload = {
#         "messages": [{
#             "from": WHATSAPP_SENDER,
#             "to": to_number,
#             "content": {
#                 "templateName": "interview_scheduled_message",
#                 "language": "en_US",
#                 "templateData": {
#                     "body": {"placeholders": [name, role, selected_date, start_time, end_time]}
#                 }
#             }
#         }]
#     }
#     send_to_infobip("/whatsapp/1/message/template", payload)
#     send_pre_interview_form(to_number)

# def send_pre_interview_form(to_number):
#     # to_number = "91" + to_number
#     payload = {
#         "from": WHATSAPP_SENDER,
#         "to": to_number,
#         "messageId": f"form-{os.urandom(4).hex()}",
#         "content": {
#             "body": {"text": "📋 Before attending your interview, please fill out this *Pre-Interview Form* 👇"},
#             "action": {"displayText": "Open Form", "url": PRE_INTERVIEW_FORM_URL}
#         }
#     }
#     send_to_infobip("/whatsapp/1/message/interactive/url-button", payload)

# # Helpers for global slots
# def get_current_available_dates(hr_email):
#     doc = slots_collection.find_one({"hr_email": hr_email})
#     if not doc:
#         return []
#     return [d["date"] for d in doc["available_dates"] if any(len(s) > 0 for s in d["shifts"].values())]

# def get_current_slots(hr_email, date, shift):
#     doc = slots_collection.find_one({"hr_email": hr_email})
#     if not doc:
#         return []
#     for d in doc["available_dates"]:
#         if d["date"] == date:
#             return d["shifts"].get(shift, [])
#     return []

# def remove_slot_from_global(hr_email, date, slot):
#     doc = slots_collection.find_one({"hr_email": hr_email})
#     if not doc:
#         return False
#     removed = False
#     for d in doc["available_dates"]:
#         if d["date"] == date:
#             for sh, sl in d["shifts"].items():
#                 if slot in sl:
#                     sl.remove(slot)
#                     removed = True
#                     break
#             if removed:
#                 break
#     if removed:
#         slots_collection.update_one({"hr_email": hr_email}, {"$set": {"available_dates": doc["available_dates"]}})
#     return removed

# # ----------------------------- APIs -----------------------------

# @whatsapp_router.post("/whatsapp/set-slots")
# def set_slots(data: dict, current_user: dict = Depends(get_current_user)):
#     hr_email = current_user["email"]
#     available_dates = data.get("available_dates")
#     if not available_dates:
#         raise HTTPException(status_code=400, detail="Available dates required")
#     slots_collection.update_one({"hr_email": hr_email}, {"$set": {"available_dates": available_dates}}, upsert=True)
#     return {"ok": True, "message": "Slots set successfully"}

# @whatsapp_router.get("/whatsapp/slots")
# def get_slots(current_user: dict = Depends(get_current_user)):
#     hr_email = current_user["email"]
#     doc = slots_collection.find_one({"hr_email": hr_email}, {"_id": False})
#     return {"available_dates": doc.get("available_dates", []) if doc else []}

# @whatsapp_router.post("/whatsapp/start-flow")
# def start_whatsapp_flow(data: dict, current_user: dict = Depends(get_current_user)):
#     hr_email = data.get("hr_email")
#     role = data.get("role")
#     candidates = data.get("candidates")
#     company = "JHS Connect"

#     # Check if slots are set
#     if not slots_collection.find_one({"hr_email": hr_email}):
#         raise HTTPException(status_code=400, detail="Please set slots first")

#     for c in candidates:
#         name = c["name"]
#         phone = c["phone"]
#         candidate_id = c.get("candidate_id")

#         send_shortlist_template(phone, name, role)

#         messaged_collection.insert_one({
#             "hr_email": hr_email,
#             "candidate_number": phone,
#             "candidate_name": name,
#             "candidate_id": candidate_id,
#             "reference_name": c.get("reference"),
#             "role": role,
#             "company": company,
#             "status": "Messaged",
#             "created_at": datetime.utcnow()
#         })

#         conversations_collection.insert_one({
#             "hr_email": hr_email,
#             "candidate_number": phone,
#             "candidate_name": name,
#             "candidate_id": candidate_id,
#             "reference_name": c.get("reference"),
#             "messages": [{
#                 "sender": "system",
#                 "content": f"Shortlist message sent for role {role}",
#                 "timestamp": datetime.utcnow()
#             }]
#         })

#     return {"ok": True, "message": "Messages sent and records created."}


# @whatsapp_router.post("/webhook")
# async def webhook(request: Request):
#     data = await request.json()
#     print("\n=== Incoming Webhook ===")
#     print(json.dumps(data, indent=2))

#     try:
#         result = data["results"][0]
#         from_number = result.get("from", "")
#         from_number = from_number[2:]  # Remove '91'
#         message = result.get("message", {})
#         msg_type = message.get("type", "").upper()

#         # Save candidate message
#         conv = conversations_collection.find_one({"candidate_number": from_number})
#         if conv:
#             conversations_collection.update_one(
#                 {"candidate_number": from_number},
#                 {"$push": {
#                     "messages": {
#                         "sender": "candidate",
#                         "content": str(message),
#                         "timestamp": datetime.utcnow()
#                     }
#                 }}
#             )

#         # --- 1. TEXT: Yes / No ---
#         if "text" in message:
#             txt = message["text"].strip().lower()
#             record = messaged_collection.find_one({"candidate_number": from_number})
#             if not record:
#                 return {"status": "no record"}

#             if txt == "yes":
#                 dates = get_current_available_dates(record["hr_email"])
#                 if not dates:
#                     send_to_infobip("/whatsapp/1/message/text", {
#                         "from": WHATSAPP_SENDER,
#                         "to": '91' + from_number,
#                         "content": {"text": "Sorry, no interview dates available at the moment."}
#                     })
#                     return {"status": "no dates"}

#                 send_date_selection_list(from_number, record["candidate_name"], record["company"], dates)
#                 messaged_collection.update_one({"candidate_number": from_number}, {"$set": {"status": "Replied"}})
#                 return {"status": "date list sent"}

#             elif txt == "no":
#                 send_to_infobip("/whatsapp/1/message/text", {
#                     "from": WHATSAPP_SENDER,
#                     "to": '91' + from_number,
#                     "content": {"text": "Thank you. Better luck next time!"}
#                 })
#                 messaged_collection.update_one({"candidate_number": from_number}, {"$set": {"status": "Replied"}})
#                 return {"status": "rejected"}

#         # --- 2. LIST REPLY: Date Selection ---
#         if msg_type == "INTERACTIVE_LIST_REPLY":
#             reply_id = message.get("id", "")
#             record = messaged_collection.find_one({"candidate_number": from_number})
#             if not record:
#                 return {"status": "no record"}

#             if reply_id.startswith("date_"):
#                 selected_date = reply_id.split("_", 1)[1]
#                 # STORE SELECTED DATE
#                 messaged_collection.update_one(
#                     {"candidate_number": from_number},
#                     {"$set": {"selected_date": selected_date}}
#                 )
#                 send_shift_selection_template(from_number, record["candidate_name"], selected_date)
#                 return {"status": "shift selection sent"}

#             # SLOT SELECTION
#             elif reply_id.startswith("slot_"):
#                 parts = reply_id.split("_", 2)
#                 if len(parts) != 3:
#                     return {"status": "invalid slot id"}
#                 _, slot, selected_date = parts

#                 if remove_slot_from_global(record["hr_email"], selected_date, slot):
#                     send_confirmation(
#                         from_number,
#                         record["candidate_name"],
#                         record["role"],
#                         selected_date,
#                         slot
#                     )

#                     scheduled_collection.insert_one({
#                         "hr_email": record["hr_email"],
#                         "candidate_number": from_number,
#                         "candidate_name": record["candidate_name"],
#                         "candidate_id": record.get("candidate_id"),
#                         "role": record["role"],
#                         "date": selected_date,
#                         "slot": slot,
#                         "status": "Scheduled",
#                         "scheduled_at": datetime.utcnow()
#                     })

#                     # Delete from messaged
#                     messaged_collection.delete_one({"candidate_number": from_number})

#                     return {"status": "interview scheduled"}
#                 else:
#                     send_to_infobip("/whatsapp/1/message/text", {
#                         "from": WHATSAPP_SENDER,
#                         "to": '91' + from_number,
#                         "content": {"text": "Sorry, the selected slot is no longer available. Please choose another."}
#                     })
#                     # Resend shift selection
#                     send_shift_selection_template(from_number, record["candidate_name"], selected_date)
#                     return {"status": "slot taken"}

#         # --- 3. BUTTON REPLY: Morning / Afternoon ---
#         if msg_type == "BUTTON":
#             payload_text = message.get("payload", "").strip()
#             print("Payload:", payload_text)

#             if payload_text in ["Morning", "Afternoon"]:
#                 record = messaged_collection.find_one({"candidate_number": from_number})
#                 if not record:
#                     return {"status": "no record"}

#                 selected_date = record.get("selected_date")
#                 if not selected_date:
#                     send_to_infobip("/whatsapp/1/message/text", {
#                         "from": WHATSAPP_SENDER,
#                         "to": '91' + from_number,
#                         "content": {"text": "Please select a date first."}
#                     })
#                     return {"status": "no date selected"}

#                 selected_shift = payload_text.lower()
#                 slots = get_current_slots(record["hr_email"], selected_date, selected_shift)

#                 if not slots:
#                     send_to_infobip("/whatsapp/1/message/text", {
#                         "from": WHATSAPP_SENDER,
#                         "to": '91' + from_number,
#                         "content": {"text": f"No {selected_shift} slots available for {selected_date}."}
#                     })
#                     return {"status": "no slots"}

#                 send_slot_selection_list(
#                     from_number,
#                     record["candidate_name"],
#                     selected_date,
#                     selected_shift,
#                     slots
#                 )
#                 return {"status": "slot list sent"}

#     except Exception as e:
#         print("Webhook Error:", e)
#         return {"error": str(e)}

#     return {"status": "ignored"}

# # New endpoints to fetch messaged and scheduled candidates
# @whatsapp_router.get("/messaged")
# def get_messaged(current_user: dict = Depends(get_current_user)):
#     messaged = list(messaged_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
#     return {"messaged": messaged}

# @whatsapp_router.get("/scheduled")
# def get_scheduled(current_user: dict = Depends(get_current_user)):
#     scheduled = list(scheduled_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
#     return {"scheduled": scheduled}



# whatsapp_routes.py

from fastapi import APIRouter, Request, HTTPException
from database.db import *
import requests, os, json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from database.auth import *

load_dotenv()

whatsapp_router = APIRouter()

INFOBIP_API_KEY = os.getenv("INFOBIP_API_KEY")
INFOBIP_BASE_URL = os.getenv("INFOBIP_BASE_URL")
WHATSAPP_SENDER = os.getenv("WHATSAPP_SENDER")
PRE_INTERVIEW_FORM_URL = os.getenv("PRE_INTERVIEW_FORM_URL")


# ----------------------------- Helper -----------------------------
def send_to_infobip(endpoint, payload):
    url = f"{INFOBIP_BASE_URL}{endpoint}"
    headers = {
        "Authorization": INFOBIP_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    res = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"\n=== Request to {endpoint} ===")
    print(json.dumps(payload, indent=2))
    print("Response:", res.status_code, res.text)
    return res


# ----------------------------- Infobip Templates -----------------------------
def send_shortlist_template(to_number, name, role):
    to_number = "91" + to_number
    payload = {
        "messages": [{
            "from": WHATSAPP_SENDER,
            "to": to_number,
            "content": {
                "templateName": "shortlist_notification_template",
                "language": "en_US",
                "templateData": {
                    "body": {"placeholders": [name, role]},
                    "buttons": [
                        {"type": "QUICK_REPLY", "parameter": "Yes"},
                        {"type": "QUICK_REPLY", "parameter": "No"}
                    ]
                }
            }
        }]
    }
    send_to_infobip("/whatsapp/1/message/template", payload)

def send_date_selection_list(to_number, name, company, available_dates):
    to_number = "91" + to_number
    rows = [
        {"id": f"date_{date}", "title": date, "description": f"Interview available on {date}"}
        for date in available_dates[:5]
    ]
    payload = {
        "from": WHATSAPP_SENDER,
        "to": to_number,
        "messageId": f"date-{os.urandom(4).hex()}",
        "content": {
            "body": {"text": f"Hi {name} 👋\nPlease select your preferred *interview date* with {company}."},
            "action": {"title": "Select Date", "sections": [{"title": "Available Dates", "rows": rows}]},
            "footer": {"text": "JHS Connect Bot"}
        }
    }
    send_to_infobip("/whatsapp/1/message/interactive/list", payload)

def send_shift_selection_template(to_number, name, selected_date):
    to_number = "91" + to_number
    payload = {
        "messages": [{
            "from": WHATSAPP_SENDER,
            "to": to_number,
            "content": {
                "templateName": "interview_shift_selection",
                "language": "en_US",
                "templateData": {
                    "body": {"placeholders": [name, selected_date]},
                    "buttons": [
                        {"type": "QUICK_REPLY", "parameter": "Morning"},
                        {"type": "QUICK_REPLY", "parameter": "Afternoon"}
                    ]
                }
            }
        }]
    }
    send_to_infobip("/whatsapp/1/message/template", payload)

def send_slot_selection_list(to_number, name, selected_date, selected_shift, slots):
    to_number = "91" + to_number
    rows = [
        {
            "id": f"slot_{slot}_{selected_date}",
            "title": slot[:24],  # Direct from DB, max 24 chars
            "description": f"{selected_shift.title()} slot"
        }
        for slot in slots
    ]
    payload = {
        "from": WHATSAPP_SENDER,
        "to": to_number,
        "messageId": f"slot-{os.urandom(4).hex()}",
        "content": {
            "body": {"text": f"Hi {name} 👋\nSelect your preferred *{selected_shift}* slot for *{selected_date}*:"},
            "action": {"title": "Select Slot", "sections": [{"title": f"{selected_shift.title()} Slots", "rows": rows}]},
            "footer": {"text": "JHS Connect Bot"}
        }
    }
    send_to_infobip("/whatsapp/1/message/interactive/list", payload)

def send_confirmation(to_number, name, role, selected_date, slot):
    to_number = "91" + to_number
    start_time = slot.split(' - ')[0]
    end_time = slot.split(' - ')[1]
    payload = {
        "messages": [{
            "from": WHATSAPP_SENDER,
            "to": to_number,
            "content": {
                "templateName": "interview_scheduled_message",
                "language": "en_US",
                "templateData": {
                    "body": {"placeholders": [name, role, selected_date, start_time, end_time]}
                }
            }
        }]
    }
    send_to_infobip("/whatsapp/1/message/template", payload)
    send_pre_interview_form(to_number)

def send_pre_interview_form(to_number):
    to_number = "91" + to_number
    payload = {
        "from": WHATSAPP_SENDER,
        "to": to_number,
        "messageId": f"form-{os.urandom(4).hex()}",
        "content": {
            "body": {"text": "📋 Before attending your interview, please fill out this *Pre-Interview Form* 👇"},
            "action": {"displayText": "Open Form", "url": PRE_INTERVIEW_FORM_URL}
        }
    }
    send_to_infobip("/whatsapp/1/message/interactive/url-button", payload)

def send_selected_message(to_number):
    to_number = "91" + to_number
    payload = {
        "from": WHATSAPP_SENDER,
        "to": to_number,
        "content": {"text": "You are selected for the role and you will get a phone call or email from one of HR team member."}
    }
    send_to_infobip("/whatsapp/1/message/text", payload)

def send_rejected_message(to_number, reason):
    to_number = "91" + to_number
    payload = {
        "from": WHATSAPP_SENDER,
        "to": to_number,
        "content": {"text": f'We regret to inform you that you have not been selected for the role. Reason: {reason}'}
    }
    send_to_infobip("/whatsapp/1/message/text", payload)

# Helpers for global slots
def get_current_available_dates(hr_email):
    doc = slots_collection.find_one({"hr_email": hr_email})
    if not doc:
        return []
    return [d["date"] for d in doc["available_dates"] if any(len(s) > 0 for s in d["shifts"].values())]

def get_current_slots(hr_email, date, shift):
    doc = slots_collection.find_one({"hr_email": hr_email})
    if not doc:
        return []
    for d in doc["available_dates"]:
        if d["date"] == date:
            return d["shifts"].get(shift, [])
    return []

def remove_slot_from_global(hr_email, date, slot):
    doc = slots_collection.find_one({"hr_email": hr_email})
    if not doc:
        return False
    removed = False
    for d in doc["available_dates"]:
        if d["date"] == date:
            for sh, sl in d["shifts"].items():
                if slot in sl:
                    sl.remove(slot)
                    removed = True
                    break
            if removed:
                break
    if removed:
        slots_collection.update_one({"hr_email": hr_email}, {"$set": {"available_dates": doc["available_dates"]}})
    return removed

# ----------------------------- APIs -----------------------------

@whatsapp_router.post("/whatsapp/set-slots")
def set_slots(data: dict, current_user: dict = Depends(get_current_user)):
    hr_email = current_user["email"]
    available_dates = data.get("available_dates")
    if not available_dates:
        raise HTTPException(status_code=400, detail="Available dates required")
    slots_collection.update_one({"hr_email": hr_email}, {"$set": {"available_dates": available_dates}}, upsert=True)
    return {"ok": True, "message": "Slots set successfully"}

@whatsapp_router.get("/whatsapp/slots")
def get_slots(current_user: dict = Depends(get_current_user)):
    hr_email = current_user["email"]
    doc = slots_collection.find_one({"hr_email": hr_email}, {"_id": False})
    return {"available_dates": doc.get("available_dates", []) if doc else []}

@whatsapp_router.post("/whatsapp/start-flow")
def start_whatsapp_flow(data: dict, current_user: dict = Depends(get_current_user)):
    hr_email = data.get("hr_email")
    role = data.get("role")
    candidates = data.get("candidates")
    print(candidates)
    company = "JHS Connect"

    # Check if slots are set
    if not slots_collection.find_one({"hr_email": hr_email}):
        raise HTTPException(status_code=400, detail="Please set slots first")

    for c in candidates:
        name = c["name"]
        phone = c["phone"]
        candidate_id = c.get("candidate_id")

        send_shortlist_template(phone, name, role)

        messaged_collection.insert_one({
            "hr_email": hr_email,
            "candidate_number": phone,
            "candidate_name": name,
            "candidate_id": candidate_id,
            "reference_name": c.get("reference"),
            "role": role,
            "company": company,
            "status": "Messaged",
            "created_at": datetime.utcnow()
        })

        conversations_collection.insert_one({
            "hr_email": hr_email,
            "candidate_number": phone,
            "candidate_name": name,
            "candidate_id": candidate_id,
            "reference_name": c.get("reference"),
            "messages": [{
                "sender": "system",
                "content": f"Shortlist message sent for role {role}",
                "timestamp": datetime.utcnow()
            }]
        })

    return {"ok": True, "message": "Messages sent and records created."}


@whatsapp_router.post("/webhook")
async def webhook(request: Request):
    data = await request.json()
    print("\n=== Incoming Webhook ===")
    print(json.dumps(data, indent=2))

    try:
        result = data["results"][0]
        from_number = result.get("from", "")
        from_number = from_number[2:]  # Remove '91'
        message = result.get("message", {})
        msg_type = message.get("type", "").upper()

        # Save candidate message
        conv = conversations_collection.find_one({"candidate_number": from_number})
        if conv:
            conversations_collection.update_one(
                {"candidate_number": from_number},
                {"$push": {
                    "messages": {
                        "sender": "candidate",
                        "content": str(message),
                        "timestamp": datetime.utcnow()
                    }
                }}
            )

        # --- 1. TEXT: Yes / No ---
        if "text" in message:
            txt = message["text"].strip().lower()
            record = messaged_collection.find_one({"candidate_number": from_number})
            if not record:
                return {"status": "no record"}

            if txt == "yes":
                dates = get_current_available_dates(record["hr_email"])
                if not dates:
                    send_to_infobip("/whatsapp/1/message/text", {
                        "from": WHATSAPP_SENDER,
                        "to": '91' + from_number,
                        "content": {"text": "Sorry, no interview dates available at the moment."}
                    })
                    return {"status": "no dates"}

                send_date_selection_list(from_number, record["candidate_name"], record["company"], dates)
                messaged_collection.update_one({"candidate_number": from_number}, {"$set": {"status": "Replied"}})
                return {"status": "date list sent"}

            elif txt == "no":
                send_to_infobip("/whatsapp/1/message/text", {
                    "from": WHATSAPP_SENDER,
                    "to": '91' + from_number,
                    "content": {"text": "Thank you. Better luck next time!"}
                })
                messaged_collection.update_one({"candidate_number": from_number}, {"$set": {"status": "Replied"}})
                return {"status": "rejected"}

        # --- 2. LIST REPLY: Date Selection ---
        if msg_type == "INTERACTIVE_LIST_REPLY":
            reply_id = message.get("id", "")
            record = messaged_collection.find_one({"candidate_number": from_number})
            if not record:
                return {"status": "no record"}

            if reply_id.startswith("date_"):
                selected_date = reply_id.split("_", 1)[1]
                # STORE SELECTED DATE
                messaged_collection.update_one(
                    {"candidate_number": from_number},
                    {"$set": {"selected_date": selected_date}}
                )
                send_shift_selection_template(from_number, record["candidate_name"], selected_date)
                return {"status": "shift selection sent"}

            # SLOT SELECTION
            elif reply_id.startswith("slot_"):
                parts = reply_id.split("_", 2)
                if len(parts) != 3:
                    return {"status": "invalid slot id"}
                _, slot, selected_date = parts

                if remove_slot_from_global(record["hr_email"], selected_date, slot):
                    send_confirmation(
                        from_number,
                        record["candidate_name"],
                        record["role"],
                        selected_date,
                        slot
                    )

                    scheduled_collection.insert_one({
                        "hr_email": record["hr_email"],
                        "candidate_number": from_number,
                        "candidate_name": record["candidate_name"],
                        "candidate_id": record.get("candidate_id"),
                        "role": record["role"],
                        "date": selected_date,
                        "slot": slot,
                        "status": "Scheduled",
                        "scheduled_at": datetime.utcnow()
                    })

                    # Delete from messaged
                    messaged_collection.delete_one({"candidate_number": from_number})

                    return {"status": "interview scheduled"}
                else:
                    send_to_infobip("/whatsapp/1/message/text", {
                        "from": WHATSAPP_SENDER,
                        "to": '91' + from_number,
                        "content": {"text": "Sorry, the selected slot is no longer available. Please choose another."}
                    })
                    # Resend shift selection
                    send_shift_selection_template(from_number, record["candidate_name"], selected_date)
                    return {"status": "slot taken"}

        # --- 3. BUTTON REPLY: Morning / Afternoon ---
        if msg_type == "BUTTON":
            payload_text = message.get("payload", "").strip()
            print("Payload:", payload_text)

            if payload_text in ["Morning", "Afternoon"]:
                record = messaged_collection.find_one({"candidate_number": from_number})
                if not record:
                    return {"status": "no record"}

                selected_date = record.get("selected_date")
                if not selected_date:
                    send_to_infobip("/whatsapp/1/message/text", {
                        "from": WHATSAPP_SENDER,
                        "to": '91' + from_number,
                        "content": {"text": "Please select a date first."}
                    })
                    return {"status": "no date selected"}

                selected_shift = payload_text.lower()
                slots = get_current_slots(record["hr_email"], selected_date, selected_shift)

                if not slots:
                    send_to_infobip("/whatsapp/1/message/text", {
                        "from": WHATSAPP_SENDER,
                        "to": '91' + from_number,
                        "content": {"text": f"No {selected_shift} slots available for {selected_date}."}
                    })
                    return {"status": "no slots"}

                send_slot_selection_list(
                    from_number,
                    record["candidate_name"],
                    selected_date,
                    selected_shift,
                    slots
                )
                return {"status": "slot list sent"}

    except Exception as e:
        print("Webhook Error:", e)
        return {"error": str(e)}

    return {"status": "ignored"}

# New endpoints to fetch messaged and scheduled candidates
@whatsapp_router.get("/messaged")
def get_messaged(current_user: dict = Depends(get_current_user)):
    messaged = list(messaged_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
    return {"messaged": messaged}

@whatsapp_router.get("/scheduled")
def get_scheduled(current_user: dict = Depends(get_current_user)):
    scheduled = list(scheduled_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
    return {"scheduled": scheduled}

@whatsapp_router.get("/selected")
def get_selected(current_user: dict = Depends(get_current_user)):
    selected = list(selected_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
    return {"selected": selected}

@whatsapp_router.get("/rejected")
def get_rejected(current_user: dict = Depends(get_current_user)):
    rejected = list(rejected_collection.find({"hr_email": current_user["email"]}, {"_id": False}))
    return {"rejected": rejected}

@whatsapp_router.post("/select-candidate/{candidate_number}")
def select_candidate(candidate_number: str, current_user: dict = Depends(get_current_user)):
    hr_email = current_user["email"]
    doc = scheduled_collection.find_one({"hr_email": hr_email, "candidate_number": candidate_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidate not found in scheduled")

    send_selected_message(doc["candidate_number"])

    selected_collection.insert_one(doc)
    scheduled_collection.delete_one({"hr_email": hr_email, "candidate_number": candidate_number})

    return {"ok": True, "message": "Candidate selected and moved"}

@whatsapp_router.post("/reject-candidate/{candidate_number}")
def reject_candidate(candidate_number: str, data: dict, current_user: dict = Depends(get_current_user)):
    hr_email = current_user["email"]
    reason = data.get("reason")
    if not reason:
        raise HTTPException(status_code=400, detail="Reason required")

    doc = scheduled_collection.find_one({"hr_email": hr_email, "candidate_number": candidate_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidate not found in scheduled")

    send_rejected_message(doc["candidate_number"], reason)

    doc["reason"] = reason
    rejected_collection.insert_one(doc)
    scheduled_collection.delete_one({"hr_email": hr_email, "candidate_number": candidate_number})

    return {"ok": True, "message": "Candidate rejected and moved"}