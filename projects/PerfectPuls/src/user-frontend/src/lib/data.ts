export const MONTHS = ["January", "February", "March", "April"] as const;
export type Month = (typeof MONTHS)[number];

export type Category = {
  name: string;
  type: string;
  sessionsUsed: number;
  sessionsTotal: number;
  allowanceUsed: number;
  allowanceTotal: number;
  saved: number;
};

export type Activity = {
  date: string;
  provider: string;
  service: string;
  saved: number;
};

export const monthlyData: Record<
  Month,
  { totalSaved: number; outOfPocketAvoided: number; categories: Category[]; recentActivity: Activity[] }
> = {
  January: {
    totalSaved: 520,
    outOfPocketAvoided: 180,
    categories: [
      { name: "Physiotherapy", type: "Medical", sessionsUsed: 2, sessionsTotal: 10, allowanceUsed: 120, allowanceTotal: 600, saved: 120 },
      { name: "Acupuncture", type: "Wellness", sessionsUsed: 1, sessionsTotal: 8, allowanceUsed: 80, allowanceTotal: 500, saved: 80 },
      { name: "Nutrition", type: "Wellness", sessionsUsed: 1, sessionsTotal: 6, allowanceUsed: 60, allowanceTotal: 400, saved: 60 },
      { name: "Mental Health", type: "Mental Health", sessionsUsed: 2, sessionsTotal: 12, allowanceUsed: 120, allowanceTotal: 1200, saved: 120 },
      { name: "Dental", type: "Medical", sessionsUsed: 1, sessionsTotal: 4, allowanceUsed: 80, allowanceTotal: 800, saved: 80 },
      { name: "Vision", type: "Medical", sessionsUsed: 0, sessionsTotal: 2, allowanceUsed: 0, allowanceTotal: 400, saved: 0 },
    ],
    recentActivity: [
      { date: "2026-01-28", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
      { date: "2026-01-22", provider: "Zen Wellness", service: "Acupuncture", saved: 80 },
      { date: "2026-01-18", provider: "Smile Dental", service: "Dental", saved: 80 },
      { date: "2026-01-15", provider: "MindCare", service: "Mental Health", saved: 60 },
      { date: "2026-01-08", provider: "Healthy Eats", service: "Nutrition", saved: 60 },
    ],
  },
  February: {
    totalSaved: 680,
    outOfPocketAvoided: 210,
    categories: [
      { name: "Physiotherapy", type: "Medical", sessionsUsed: 3, sessionsTotal: 10, allowanceUsed: 180, allowanceTotal: 600, saved: 180 },
      { name: "Acupuncture", type: "Wellness", sessionsUsed: 2, sessionsTotal: 8, allowanceUsed: 160, allowanceTotal: 500, saved: 140 },
      { name: "Nutrition", type: "Wellness", sessionsUsed: 1, sessionsTotal: 6, allowanceUsed: 60, allowanceTotal: 400, saved: 60 },
      { name: "Mental Health", type: "Mental Health", sessionsUsed: 3, sessionsTotal: 12, allowanceUsed: 180, allowanceTotal: 1200, saved: 180 },
      { name: "Dental", type: "Medical", sessionsUsed: 1, sessionsTotal: 4, allowanceUsed: 80, allowanceTotal: 800, saved: 80 },
      { name: "Vision", type: "Medical", sessionsUsed: 0, sessionsTotal: 2, allowanceUsed: 0, allowanceTotal: 400, saved: 0 },
    ],
    recentActivity: [
      { date: "2026-02-25", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
      { date: "2026-02-20", provider: "Zen Wellness", service: "Acupuncture", saved: 70 },
      { date: "2026-02-16", provider: "MindCare", service: "Mental Health", saved: 60 },
      { date: "2026-02-11", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
      { date: "2026-02-05", provider: "Healthy Eats", service: "Nutrition", saved: 60 },
    ],
  },
  March: {
    totalSaved: 940,
    outOfPocketAvoided: 340,
    categories: [
      { name: "Physiotherapy", type: "Medical", sessionsUsed: 4, sessionsTotal: 10, allowanceUsed: 240, allowanceTotal: 600, saved: 240 },
      { name: "Acupuncture", type: "Wellness", sessionsUsed: 2, sessionsTotal: 8, allowanceUsed: 160, allowanceTotal: 500, saved: 160 },
      { name: "Nutrition", type: "Wellness", sessionsUsed: 2, sessionsTotal: 6, allowanceUsed: 120, allowanceTotal: 400, saved: 120 },
      { name: "Mental Health", type: "Mental Health", sessionsUsed: 4, sessionsTotal: 12, allowanceUsed: 240, allowanceTotal: 1200, saved: 240 },
      { name: "Dental", type: "Medical", sessionsUsed: 1, sessionsTotal: 4, allowanceUsed: 100, allowanceTotal: 800, saved: 100 },
      { name: "Vision", type: "Medical", sessionsUsed: 1, sessionsTotal: 2, allowanceUsed: 200, allowanceTotal: 400, saved: 200 },
    ],
    recentActivity: [
      { date: "2026-03-28", provider: "ClearView Optometry", service: "Vision", saved: 200 },
      { date: "2026-03-22", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
      { date: "2026-03-18", provider: "MindCare", service: "Mental Health", saved: 60 },
      { date: "2026-03-14", provider: "Zen Wellness", service: "Acupuncture", saved: 80 },
      { date: "2026-03-08", provider: "Smile Dental", service: "Dental", saved: 100 },
    ],
  },
  April: {
    totalSaved: 1280,
    outOfPocketAvoided: 550,
    categories: [
      { name: "Physiotherapy", type: "Medical", sessionsUsed: 5, sessionsTotal: 10, allowanceUsed: 300, allowanceTotal: 600, saved: 300 },
      { name: "Acupuncture", type: "Wellness", sessionsUsed: 3, sessionsTotal: 8, allowanceUsed: 240, allowanceTotal: 500, saved: 220 },
      { name: "Nutrition", type: "Wellness", sessionsUsed: 2, sessionsTotal: 6, allowanceUsed: 120, allowanceTotal: 400, saved: 120 },
      { name: "Mental Health", type: "Mental Health", sessionsUsed: 4, sessionsTotal: 12, allowanceUsed: 240, allowanceTotal: 1200, saved: 240 },
      { name: "Dental", type: "Medical", sessionsUsed: 2, sessionsTotal: 4, allowanceUsed: 200, allowanceTotal: 800, saved: 200 },
      { name: "Vision", type: "Medical", sessionsUsed: 1, sessionsTotal: 2, allowanceUsed: 200, allowanceTotal: 400, saved: 200 },
    ],
    recentActivity: [
      { date: "2026-04-22", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
      { date: "2026-04-18", provider: "Zen Wellness", service: "Acupuncture", saved: 80 },
      { date: "2026-04-14", provider: "Smile Dental", service: "Dental", saved: 100 },
      { date: "2026-04-10", provider: "MindCare", service: "Mental Health", saved: 60 },
      { date: "2026-04-05", provider: "ClearView Optometry", service: "Vision", saved: 200 },
    ],
  },
};

export const yearData = {
  totalSaved: 3420,
  outOfPocketAvoided: 1280,
  categories: [
    { name: "Physiotherapy", type: "Medical", sessionsUsed: 14, sessionsTotal: 40, allowanceUsed: 840, allowanceTotal: 2400, saved: 840 },
    { name: "Acupuncture", type: "Wellness", sessionsUsed: 8, sessionsTotal: 32, allowanceUsed: 640, allowanceTotal: 2000, saved: 600 },
    { name: "Nutrition", type: "Wellness", sessionsUsed: 6, sessionsTotal: 24, allowanceUsed: 360, allowanceTotal: 1600, saved: 360 },
    { name: "Mental Health", type: "Mental Health", sessionsUsed: 13, sessionsTotal: 48, allowanceUsed: 780, allowanceTotal: 4800, saved: 780 },
    { name: "Dental", type: "Medical", sessionsUsed: 5, sessionsTotal: 16, allowanceUsed: 460, allowanceTotal: 3200, saved: 460 },
    { name: "Vision", type: "Medical", sessionsUsed: 2, sessionsTotal: 8, allowanceUsed: 400, allowanceTotal: 1600, saved: 380 },
  ] as Category[],
  recentActivity: [
    { date: "2026-04-22", provider: "City Physio Clinic", service: "Physiotherapy", saved: 60 },
    { date: "2026-04-18", provider: "Zen Wellness", service: "Acupuncture", saved: 80 },
    { date: "2026-04-14", provider: "Smile Dental", service: "Dental", saved: 100 },
    { date: "2026-04-10", provider: "MindCare", service: "Mental Health", saved: 60 },
    { date: "2026-04-05", provider: "ClearView Optometry", service: "Vision", saved: 200 },
  ] as Activity[],
};
