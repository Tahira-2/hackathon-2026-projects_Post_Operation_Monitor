# VitalsFlow — Frontend Tasks
# Feed CONVENTIONS.md + API_CONTRACT.md + this file
# to your AI assistant to generate any frontend file.

---

## Setup Commands (run once)

```bash
cd projects/vitalsflow/src
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
npx shadcn@latest init
# Choose: Default style, Slate base color, yes to CSS variables
npx shadcn@latest add card badge button input skeleton table separator
npm install recharts lucide-react
```

Create `frontend/.env.local` (never commit):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run locally:
```bash
npm run dev
```

App: `http://localhost:3000`

---

## TASK F1 — lib/api.ts

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and API_CONTRACT.md for rules and exact interface definitions.

Create: projects/vitalsflow/src/frontend/lib/api.ts

Use the exact TypeScript interfaces from API_CONTRACT.md:
Patient, VitalsPayload, TriageResult, PatientSummary

Also export:
DEFAULT_VITALS: VitalsPayload — use the high-risk demo values from API_CONTRACT.md

Implement these typed async functions:

1. searchPatients(name: string, count?: number): Promise<Patient[]>
   GET {BASE_URL}/patients/search?name={name}&count={count}

2. getPatientSummary(patientId: string): Promise<PatientSummary>
   GET {BASE_URL}/patients/{patientId}/summary

3. runTriage(patientId: string, vitals: VitalsPayload): Promise<TriageResult>
   POST {BASE_URL}/triage/{patientId}
   Body: vitals as JSON

4. healthCheck(): Promise<boolean>
   GET {BASE_URL}/health
   Return true if status 200, false otherwise (never throw)

Use the apiFetch wrapper from API_CONTRACT.md error handling section.
BASE_URL from process.env.NEXT_PUBLIC_API_URL.
Follow CONVENTIONS.md import order.
Add JSDoc comment on each function.
No "use client" — this is a utility module.
Generate the complete file.
```

---

## TASK F2 — components/RiskBadge.tsx

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md for styling rules. No custom CSS — Tailwind only.

Create: projects/vitalsflow/src/frontend/components/RiskBadge.tsx

Props interface RiskBadgeProps:
- tier: string
- score: number
- news2Score: number
- size?: "sm" | "lg" (default "sm")

Use Shadcn Badge with variant="outline"

Tier colour mapping (Tailwind classes):
- "critical" → bg-red-950 text-red-300 border-red-800
- "urgent"   → bg-amber-950 text-amber-300 border-amber-800
- "routine"  → bg-green-950 text-green-300 border-green-800
- "unknown"  → bg-slate-800 text-slate-400 border-slate-700

Display:
- A filled circle dot (●) coloured to match tier
- Tier label (capitalised)
- "·" separator
- score/10 (e.g. "8/10")
- "·" separator
- "NEWS2: {news2Score}"
- When score is 0: show "Pending analysis" instead of the score info

Size "lg": larger padding, text-base
Size "sm": default padding, text-xs

Named export RiskBadge.
"use client" at top.
Generate the complete TypeScript file.
```

---

## TASK F3 — components/ActionCenter.tsx

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md for rules. Dark theme. Tailwind only. Shadcn UI primitives.

Create: projects/vitalsflow/src/frontend/components/ActionCenter.tsx

Props interface ActionCenterProps:
- actions: string[]
- justification: string
- news2Score: number
- riskScore: number
- tier: string

State (useState):
- approved: Set<number>
- dismissed: Set<number>

Layout (Shadcn Card):
Header:
  - Left: Activity icon (lucide) + "Action Center" title
  - Right: small muted text "NEWS2: {news2Score}"

Body:
  - Justification paragraph (text-slate-400 text-sm, italic)
  - Separator
  - List of action rows

Each action row:
  - Container: flex justify-between items-center p-3 rounded-lg border
  - Default state: border-slate-700 bg-slate-800/50
  - Approved state: border-green-800 bg-green-950/50 — text turns green
    Show CheckCircle icon (green) on left instead of buttons
  - Dismissed state: opacity-30 — text stays, no buttons
  - Buttons (only shown in default state):
    Approve: small, outline, green colors (border-green-700 text-green-400)
    Dismiss: small, ghost, muted (text-slate-500)

If actions is empty:
  Show centered muted text: "No actions suggested for this patient"

If tier is "critical" AND action is NOT approved/dismissed:
  Add subtle ring: ring-1 ring-red-900

Named export ActionCenter.
"use client" at top.
Generate the complete TypeScript file.
```

---

## TASK F4 — components/VitalsTrend.tsx

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md for rules. Dark theme. Tailwind only.

Create: projects/vitalsflow/src/frontend/components/VitalsTrend.tsx

Props interface VitalsTrendProps:
- currentHR: number
- currentSpO2: number

Generate mock trend data (5 points ending at current values):
- Time labels: ["08:00", "10:00", "12:00", "14:00", "Now"]
- Heart rate: start 10-15 below current, drift up to currentHR
- SpO2: start 3-4 above current, drift down to currentSpO2
- Values should look like gradual clinical deterioration
- Calculate programmatically — not hardcoded

Use Recharts:
- ResponsiveContainer width="100%" height={150}
- LineChart with this data
- CartesianGrid: strokeDasharray="3 3" stroke="#1e293b"
- XAxis: tick fontSize 11, stroke "#475569"
- YAxis: tick fontSize 11, stroke "#475569", hide axis line
- Tooltip: dark background (#0f172a), border (#334155)
- Two Lines:
  Heart Rate: stroke="#ef4444" strokeWidth=2 dot=false name="HR (bpm)"
  SpO2: stroke="#3b82f6" strokeWidth=2 dot=false name="SpO2 (%)"

Shadcn Card wrapper:
  Header: "Vitals Trend" title with TrendingUp icon (lucide)
  Small legend below chart:
    Red dot + "Heart Rate" | Blue dot + "SpO2"

Named export VitalsTrend.
"use client" at top.
Generate the complete TypeScript file.
```

---

## TASK F5 — components/VitalsForm.tsx

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and API_CONTRACT.md for rules and field definitions.

Create: projects/vitalsflow/src/frontend/components/VitalsForm.tsx

Props interface VitalsFormProps:
- vitals: VitalsPayload
- onChange: (vitals: VitalsPayload) => void
- onSubmit: () => void
- isLoading: boolean
- patientName: string

Layout (Shadcn Card):
Header: "Current Vitals — {patientName}" with Thermometer icon (lucide)

Body:
3-column grid of inputs for these 6 fields:
  heart_rate     | label: "Heart Rate"      | unit: "bpm"  | hint: "Normal: 60–100"
  systolic_bp    | label: "Systolic BP"     | unit: "mmHg" | hint: "Normal: 90–140"
  diastolic_bp   | label: "Diastolic BP"    | unit: "mmHg" | hint: "Normal: 60–90"
  spo2           | label: "SpO₂"            | unit: "%"    | hint: "Normal: ≥96%"
  temperature    | label: "Temperature"     | unit: "°C"   | hint: "Normal: 36.1–38.0"
  respiratory_rate | label: "Resp. Rate"   | unit: "/min" | hint: "Normal: 12–20"

Each input cell:
  - Label text (text-xs text-slate-400 mb-1)
  - Shadcn Input (type="number", dark background)
  - Unit + hint below (text-xs text-slate-500)
  - Call onChange with updated vitals on every change

Below the grid:
  - Consciousness select (full width):
    Options: alert, voice, pain, unresponsive
    Label: "Consciousness (ACVPU)"
  - On supplemental O2 checkbox with label

Submit button (full width, bottom):
  - Text: "Run Triage" with Zap icon
  - Disabled and shows "Analysing..." with Loader2 spinning icon when isLoading
  - bg-blue-600 hover:bg-blue-700

Named export VitalsForm.
"use client" at top.
Generate the complete TypeScript file.
```

---

## TASK F6 — components/PatientCard.tsx

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md for rules. Dark theme. Tailwind only.

Create: projects/vitalsflow/src/frontend/components/PatientCard.tsx

Props interface PatientCardProps:
- patient: Patient
- isSelected: boolean
- onClick: () => void
- triageResult: TriageResult | null

Layout:
- Outer div: cursor-pointer, hover:bg-slate-800/70, transition-colors
- Border bottom: border-b border-slate-800
- Padding: p-4
- Selected state: border-l-4 border-l-blue-500 bg-slate-800/50 pl-3

Content:
- Top row: User icon (lucide, small, slate-400) + patient name (font-medium, text-slate-200)
  If triageResult exists: RiskBadge (size="sm") on the right
- Bottom row: text-xs text-slate-500
  "DOB: {dob} · {gender} · ID: {id}"
- If triageResult is null: very faint "Not assessed" badge on right
  (text-slate-600, text-xs)

onClick fires on the whole card div.

Import RiskBadge from "./RiskBadge"
Named export PatientCard.
"use client" at top.
Generate the complete TypeScript file.
```

---

## TASK F7 — app/page.tsx (Main Dashboard)

**Paste this prompt into your AI:**

```
You are building the VitalsFlow Next.js frontend for the CareDevi AI Hackathon.
Read CONVENTIONS.md, API_CONTRACT.md for all rules and interfaces.

Create: projects/vitalsflow/src/frontend/app/page.tsx

This is the complete main dashboard — the only page in the app.

IMPORTS needed:
- React: useState, useCallback, useEffect
- Components: RiskBadge, ActionCenter, VitalsTrend, PatientCard, VitalsForm
- API: searchPatients, runTriage, healthCheck, Patient, VitalsPayload,
  TriageResult, DEFAULT_VITALS
- Shadcn: Input, Button, Skeleton, Separator
- Lucide: Stethoscope, Search, AlertCircle, Wifi, WifiOff

STATE:
- searchQuery: string ("")
- patients: Patient[] ([])
- selectedPatient: Patient | null (null)
- vitals: VitalsPayload (DEFAULT_VITALS)
- triageResult: TriageResult | null (null)
- isSearching: boolean (false)
- isTriaging: boolean (false)
- error: string | null (null)
- backendOnline: boolean | null (null) — null = checking

EFFECTS:
- On mount: call healthCheck(), set backendOnline

FUNCTIONS:
handleSearch:
  - Set isSearching true, clear error
  - Call searchPatients(searchQuery)
  - Set patients, set isSearching false
  - On error: set error message

handlePatientSelect(patient):
  - Set selectedPatient
  - Clear triageResult
  - Clear error

handleTriageSubmit:
  - Guard: if no selectedPatient return
  - Set isTriaging true, clear error
  - Call runTriage(selectedPatient.id, vitals)
  - Set triageResult, set isTriaging false
  - On error: set error message

LAYOUT:
Full screen dark: className="min-h-screen bg-slate-950 text-slate-100"

HEADER (sticky top, border-b border-slate-800 bg-slate-950/90 backdrop-blur):
  Left: Stethoscope icon (blue-500) + "VitalsFlow" h1 + "AI Triage · NEWS2 Protocol" subtitle
  Right: backend status indicator
    - null: "Connecting..." (slate, pulsing)
    - true: Wifi icon + "FHIR Connected" (green)
    - false: WifiOff icon + "Backend offline" (red)

ERROR BANNER (show if error !== null):
  Red banner below header: AlertCircle icon + error text + X button to dismiss

MAIN CONTENT (flex, full height below header):

LEFT SIDEBAR (w-80, border-r border-slate-800, flex-shrink-0):
  Search section (p-4):
    - "Patient Search" label
    - Input + Search button row
    - Enter key triggers search
  Patient list (overflow-y-auto):
    - If isSearching: 3 skeleton cards (h-16 each)
    - If patients empty and searched: "No patients found" centered muted text
    - If patients empty and not searched: "Search to find patients" hint
    - PatientCard for each patient, pass triageResult if selectedPatient matches

RIGHT MAIN PANEL (flex-1, overflow-y-auto, p-6):
  If no selectedPatient:
    Centered empty state:
      Large Stethoscope icon (slate-700)
      "Select a patient to begin triage"
      "Search for a patient on the left to get started"

  If selectedPatient:
    Patient info header:
      Name (text-xl font-semibold) + gender + DOB + ID (muted)

    VitalsForm (pass vitals, onChange, onSubmit=handleTriageSubmit, isLoading, name)

    If isTriaging: loading skeleton (h-32, animate-pulse)

    If triageResult and not isTriaging:
      RiskBadge size="lg" + spacing

      2-column grid (gap-4):
        Left: ActionCenter
        Right: VitalsTrend (pass currentHR, currentSpO2 from vitals)

"use client" at top.
Default export Dashboard.
Generate the complete TypeScript file.
```

---

## TASK F8 — app/layout.tsx

**Paste this prompt into your AI:**

```
Create: projects/vitalsflow/src/frontend/app/layout.tsx

Requirements:
- Import Inter from next/font/google — apply to body
- Metadata:
  title: "VitalsFlow — AI Triage"
  description: "AI-powered clinical triage using HL7 FHIR and NEWS2 protocol"
- Body: className combines inter.className + "bg-slate-950 antialiased"
- Keep minimal — just metadata, font, body wrapper
- No "use client"

Generate the complete file.
```

---

## TASK F9 — Render Keepalive (add to page.tsx)

**Paste this prompt into your AI:**

```
The VitalsFlow backend is on Render free tier which sleeps after 15 min.
Add a keepalive ping to projects/vitalsflow/src/frontend/app/page.tsx

Requirements:
- useEffect that runs on mount (empty dependency array)
- Calls healthCheck() from lib/api every 10 minutes
- Uses setInterval with 600000ms interval
- Clears interval on unmount (return cleanup function)
- Logs "keepalive ping sent" to console (not visible to user)
- Does NOT show any UI for this — completely silent

Show me just the useEffect block to add, and where to add it in page.tsx.
```

---

## Quick Shadcn Component Reference

```typescript
// Card
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Badge
import { Badge } from "@/components/ui/badge"

// Button
import { Button } from "@/components/ui/button"

// Input
import { Input } from "@/components/ui/input"

// Skeleton
import { Skeleton } from "@/components/ui/skeleton"

// Separator
import { Separator } from "@/components/ui/separator"
```

## Quick Lucide Icon Reference

```typescript
import {
  Stethoscope,    // app header logo
  Activity,       // ActionCenter header
  TrendingUp,     // VitalsTrend header
  Thermometer,    // VitalsForm header
  User,           // PatientCard
  Search,         // search button
  AlertCircle,    // error banner
  CheckCircle,    // approved action
  XCircle,        // dismiss action
  Zap,            // run triage button
  Loader2,        // loading spinner (animate-spin)
  Wifi,           // backend online
  WifiOff,        // backend offline
} from "lucide-react"
```
