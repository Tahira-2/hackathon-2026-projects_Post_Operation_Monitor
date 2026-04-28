cd D:\caredevi-new\hackathon-2026-projects\projects\404\src\ml-api

# create venv if needed
python -m venv .venv

# activate
.venv\Scripts\Activate.ps1

# install deps
pip install -r requirements.txt

# start API
uvicorn src.api.app:app --reload --port 8000