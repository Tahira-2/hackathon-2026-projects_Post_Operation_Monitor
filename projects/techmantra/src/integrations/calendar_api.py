import sys
import os
from datetime import datetime, timedelta, timezone
import streamlit as st

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from integrations.creds_verification import get_google_services

def get_doctor_availability(doctor_email, days_ahead=3):
    """
    Checks the doctor's Google Calendar and returns 30-min slots 
    that are NOT currently busy between 9 AM and 5 PM.
    """
    services = get_google_services()
    if not services:
        return []

    calendar_service = services["calendar"]
    
    # Define the search window
    now = datetime.now(timezone.utc)
    search_end = now + timedelta(days=days_ahead)

    # 1. Query FreeBusy API
    body = {
        "timeMin": now.isoformat(),
        "timeMax": search_end.isoformat(),
        "items": [{"id": doctor_email}]
    }
    
    query = calendar_service.freebusy().query(body=body).execute()
    busy_slots = query.get('calendars', {}).get(doctor_email, {}).get('busy', [])

    # 2. Generate Potential Slots (9 AM to 5 PM)
    available_slots = []
    for day in range(days_ahead + 1):
        current_day = (now + timedelta(days=day)).replace(hour=9, minute=0, second=0, microsecond=0)
        
        # Check slots every 30 mins until 5 PM
        for _ in range(16): 
            slot_start = current_day
            slot_end = slot_start + timedelta(minutes=30)
            
            # Filter: Check if this slot overlaps with any 'busy' slot
            is_busy = False
            for busy in busy_slots:
                b_start = datetime.fromisoformat(busy['start'].replace('Z', '+00:00'))
                b_end = datetime.fromisoformat(busy['end'].replace('Z', '+00:00'))
                # Overlap logic
                if slot_start < b_end and slot_end > b_start:
                    is_busy = True
                    break
            
            if not is_busy and slot_start > now:
                available_slots.append(slot_start.isoformat())
            
            current_day += timedelta(minutes=30)
            
    return available_slots

def book_appointment(doctor_email, patient_email, patient_name, risk_summary, start_time_iso=None):
    """
    Modified to accept a specific start_time_iso from the UI.
    """
    services = get_google_services()
    if not services: return None
    calendar_service = services["calendar"]

    # Use selected time or default to 2 hours from now
    if start_time_iso:
        start_time = datetime.fromisoformat(start_time_iso)
    else:
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
    
    end_time = start_time + timedelta(minutes=30) # 30 min consult

    event = {
        "summary": f"AI Triage Appointment — {patient_name} ({risk_summary})",
        "description": f"Patient: {patient_name}\nRisk: {risk_summary}\n\nScheduled via CareDevi AI.",
        "start": {"dateTime": start_time.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_time.isoformat(), "timeZone": "UTC"},
        "attendees": [{"email": doctor_email}, {"email": patient_email}],
        "reminders": {
            "useDefault": False,
            "overrides": [{"method": "email", "minutes": 60}]
        }
    }

    try:
        created_event = calendar_service.events().insert(
            calendarId="primary", body=event, sendUpdates="all"
        ).execute()
        return created_event
    except Exception as e:
        print(f"Error: {e}")
        return None