# integrations/creds_verification.py
# Purpose: Single place to handle all Google OAuth credentials.
# Both calendar.py and notifications.py import from here.
# Handles token refresh automatically so you don't need to
# re-authenticate every time.
# token.json is created automatically on first run.
# credentials.json must be downloaded from Google Cloud Console.

import os                                          # For file path operations
from google.oauth2.credentials import Credentials  # Loads saved credentials
from google_auth_oauthlib.flow import InstalledAppFlow  
# Runs the OAuth login flow in browser on first time

from google.auth.transport.requests import Request  # For refreshing expired tokens
from googleapiclient.discovery import build         # Builds the Google API client

# ── SCOPES ────────────────────────────────────────────────────────────
# Scopes define what permissions we are requesting from Google
# Calendar: create events on doctor's calendar
# Gmail: send email summaries to doctor
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send"
]

# ── FILE PATHS ────────────────────────────────────────────────────────
# Build absolute paths so these work regardless of where you run from
# __file__ is integrations/creds_verification.py
# going up one level (..) gets us to the project root
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_ROOT_DIR = os.path.join(_THIS_DIR)

# token.json — auto-generated after first login, stores access token
TOKEN_PATH = os.path.join(_ROOT_DIR, "token.json")

# credentials.json — downloaded from Google Cloud Console
# Must exist before running the app
CREDENTIALS_PATH = os.path.join(_ROOT_DIR, "credentials.json")

def get_google_services():
    """
    Handles Google OAuth flow and returns authenticated service clients.
    
    First run: Opens browser for Google login → saves token.json
    Later runs: Loads token.json, refreshes if expired automatically
    
    Returns: dict with calendar and gmail service clients
             or None if authentication fails
    """
    creds = None

    # ── STEP 1: Try loading existing token ────────────────────────────
    # token.json exists after the first successful login
    if os.path.exists(TOKEN_PATH):
        try:
            # Load saved credentials from token.json
            creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
            print("[creds] Loaded existing token.json")
        except Exception as e:
            print(f"[creds] Could not load token.json: {e}")
            creds = None

    # ── STEP 2: Refresh or re-authenticate ───────────────────────────
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                # Token expired but we have a refresh token
                # This happens silently without opening browser
                creds.refresh(Request())
                print("[creds] Token refreshed successfully")
            except Exception as e:
                print(f"[creds] Token refresh failed: {e}")
                creds = None

        if not creds:
            # No valid token — need fresh login
            # This opens a browser window for Google OAuth
            if not os.path.exists(CREDENTIALS_PATH):
                print(f"[creds] ERROR: credentials.json not found at {CREDENTIALS_PATH}")
                print("[creds] Download it from Google Cloud Console → APIs & Services → Credentials")
                return None

            try:
                # Run the OAuth login flow
                # Opens browser → user logs in → token saved
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_PATH,
                    SCOPES
                )
                # port=0 lets the OS pick an available port automatically
                creds = flow.run_local_server(port=0)
                print("[creds] Login successful!")
            except Exception as e:
                print(f"[creds] OAuth flow failed: {e}")
                return None

        # ── STEP 3: Save fresh token for next time ────────────────────
        try:
            with open(TOKEN_PATH, "w") as token_file:
                token_file.write(creds.to_json())
            print(f"[creds] Token saved to {TOKEN_PATH}")
        except Exception as e:
            print(f"[creds] Could not save token: {e}")

    # ── STEP 4: Build and return service clients ──────────────────────
    try:
        calendar_service = build("calendar", "v3", credentials=creds)
        gmail_service = build("gmail", "v1", credentials=creds)

        return {
            "calendar": calendar_service,  # Used by calendar.py
            "gmail": gmail_service          # Used by notifications.py
        }
    except Exception as e:
        print(f"[creds] Failed to build Google services: {e}")
        return None


def test_connection():
    """
    Quick test to verify Google credentials are working.
    Fetches next 3 calendar events as proof of connection.
    Call this from __main__ to verify setup.
    """
    services = get_google_services()

    if not services:
        print("[creds] TEST FAILED: Could not get Google services")
        return False

    try:
        # Fetch upcoming calendar events as a connection test
        now = __import__("datetime").datetime.utcnow().isoformat() + "Z"
        events_result = services["calendar"].events().list(
            calendarId="primary",
            timeMin=now,
            maxResults=3,
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        events = events_result.get("items", [])
        print(f"[creds] TEST PASSED: Connected to Google Calendar")
        print(f"[creds] Found {len(events)} upcoming events")
        for event in events:
            print(f"  - {event.get('summary', 'No title')}")
        return True

    except Exception as e:
        print(f"[creds] TEST FAILED: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Testing Google Credentials")
    print("=" * 50)
    test_connection()