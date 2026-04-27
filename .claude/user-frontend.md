# 🏥 Insurance Savings Dashboard (React + Tailwind + Recharts)

This guide provides everything you need to build a clean, modern insurance savings dashboard with realistic dummy data and interactive UI.

---

## ✨ Features

* Hero stat: total money saved this year
* Sessions used vs. remaining per category
* Annual allowance usage (progress bars)
* Estimated out-of-pocket cost avoided
* Recent activity feed
* Category filtering (All / Medical / Wellness / Mental Health)
* Toggle between "This Month" and "This Year"
* Savings chart (bar or donut)
* Hover tooltips on cards

---

## 🧱 Tech Stack

* React
* Tailwind CSS
* Recharts

---

## 📦 Installation

```bash
npx create-react-app insurance-dashboard
cd insurance-dashboard
npm install recharts
```

Setup Tailwind (if not already):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to `tailwind.config.js`:

```js
content: ["./src/**/*.{js,jsx,ts,tsx}"],
```

In `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📊 Dummy Data

```js
export const data = {
  totalSavedYear: 340,
  totalSavedMonth: 120,
  categories: [
    {
      name: "Physiotherapy",
      type: "Medical",
      sessionsUsed: 5,
      sessionsTotal: 10,
      allowanceUsed: 300,
      allowanceTotal: 600,
      saved: 150,
    },
    {
      name: "Acupuncture",
      type: "Wellness",
      sessionsUsed: 3,
      sessionsTotal: 8,
      allowanceUsed: 200,
      allowanceTotal: 500,
      saved: 100,
    },
    {
      name: "Nutrition",
      type: "Wellness",
      sessionsUsed: 2,
      sessionsTotal: 6,
      allowanceUsed: 120,
      allowanceTotal: 400,
      saved: 60,
    },
    {
      name: "Therapy",
      type: "Mental Health",
      sessionsUsed: 4,
      sessionsTotal: 12,
      allowanceUsed: 240,
      allowanceTotal: 1200,
      saved: 200,
    },
  ],
  recentActivity: [
    {
      date: "2026-04-20",
      provider: "City Physio Clinic",
      service: "Physiotherapy",
      saved: 40,
    },
    {
      date: "2026-04-18",
      provider: "Zen Wellness",
      service: "Acupuncture",
      saved: 35,
    },
    {
      date: "2026-04-15",
      provider: "Healthy Eats",
      service: "Nutrition",
      saved: 20,
    },
    {
      date: "2026-04-10",
      provider: "MindCare",
      service: "Therapy",
      saved: 50,
    },
    {
      date: "2026-04-05",
      provider: "City Physio Clinic",
      service: "Physiotherapy",
      saved: 30,
    },
  ],
};
```

---

## 🧩 Main Dashboard Component

```jsx
import { useState } from "react";
import { data } from "./data";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0d9488", "#14b8a6", "#5eead4", "#99f6e4"];

export default function Dashboard() {
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("year");

  const filtered = data.categories.filter(c =>
    filter === "All" ? true : c.type === filter
  );

  const totalSaved = view === "year" ? data.totalSavedYear : data.totalSavedMonth;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h1 className="text-gray-500">You've saved</h1>
        <p className="text-4xl font-bold text-teal-600">
          ${totalSaved}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {["All", "Medical", "Wellness", "Mental Health"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 bg-white shadow rounded-lg"
          >
            {f}
          </button>
        ))}

        <button onClick={() => setView("month")}>This Month</button>
        <button onClick={() => setView("year")}>This Year</button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {filtered.map(cat => (
          <div key={cat.name} className="bg-white p-4 rounded-xl shadow hover:shadow-lg">
            <h2 className="font-semibold">{cat.name}</h2>

            <p className="text-sm text-gray-500">
              Sessions: {cat.sessionsUsed}/{cat.sessionsTotal}
            </p>

            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-teal-500 h-2 rounded"
                style={{ width: `${(cat.allowanceUsed / cat.allowanceTotal) * 100}%` }}
              />
            </div>

            <p className="text-sm mt-2">
              ${cat.allowanceUsed} / ${cat.allowanceTotal}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <PieChart width={300} height={300}>
          <Pie
            data={filtered}
            dataKey="saved"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {filtered.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* Activity Feed */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        {data.recentActivity.map((item, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <div>
              <p className="text-sm">{item.service}</p>
              <p className="text-xs text-gray-400">{item.provider}</p>
            </div>
            <div className="text-teal-600 font-medium">
              +${item.saved}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 Styling Notes

* Use soft shadows: `shadow`, `hover:shadow-lg`
* Rounded cards: `rounded-2xl`
* Accent color: `teal-500`, `teal-600`
* Background: `bg-gray-50`

---

## 🚀 Future Enhancements

* Add animations (Framer Motion)
* Replace dummy data with API
* Add authentication
* Export savings report


