# MedRoute

AI-powered medical triage assistant. Describe your symptoms in plain language and get an urgency assessment (Emergency / Urgent / Semi-Urgent / Non-Urgent / Self-Care) with a recommended next step — no account or API key required.

Built for the CareDevi AI Innovation Hackathon 2026.

**Team Byte Beasts** — Fidel, Eladio

---

## How it works

MedRoute conducts a short conversational interview, asks focused follow-up questions, then returns a structured triage assessment with a care recommendation. It uses Groq's `llama-3.3-70b-versatile` model running through a server-side proxy so the API key never touches the browser.

---

## Tech stack

- **Frontend** — React + Vite
- **Backend** — Node.js + Express (proxies Groq API)
- **AI** — Groq API (`llama-3.3-70b-versatile`)

---

## Setup

**Prerequisites:** Node.js 18+, a free Groq API key from [console.groq.com](https://console.groq.com)

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env

# 3. Start the Express backend (port 3001)
node server.js

# 4. In a second terminal, start the Vite dev server (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build   # outputs to dist/
node server.js  # serves frontend + API on port 3001
```

---

## Project structure

```
├── server.js          # Express backend — proxies /api/chat to Groq
├── src/
│   ├── pages/
│   │   ├── Triage.jsx # Main chat UI and triage logic
│   │   ├── Home.jsx   # Landing page
│   │   └── History.jsx# Session history
│   └── App.jsx        # Router and state
├── vite.config.js     # Dev proxy: /api → localhost:3001
└── .env               # GROQ_API_KEY (never committed)
```
