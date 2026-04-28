from __future__ import annotations

import csv
from pathlib import Path


OUTPUT_FILE = Path("data/classifier/train.csv")


EXAMPLES = [
    ("I have been having severe headaches every morning.", "SYMPTOM_REPORT"),
    ("Patient reports dizziness when standing up quickly.", "SYMPTOM_REPORT"),
    ("I feel chest pain on the left side.", "SYMPTOM_REPORT"),
    ("She complains of fatigue and loss of appetite.", "SYMPTOM_REPORT"),
    ("I am prescribing Amlodipine 10mg once daily.", "PRESCRIPTION"),
    ("Take Losartan 50mg every evening.", "PRESCRIPTION"),
    ("I will add Metformin 500mg twice a day.", "PRESCRIPTION"),
    ("Reduce your salt intake significantly.", "ADVICE"),
    ("Walk for 30 minutes every day.", "ADVICE"),
    ("Monitor your blood pressure at home twice daily.", "ADVICE"),
    ("Avoid alcohol and smoking.", "ADVICE"),
    ("The patient had a bypass surgery in 2019.", "HISTORY"),
    ("She has a family history of diabetes.", "HISTORY"),
    ("Good afternoon, how are you feeling today?", "OTHER"),
    ("I understand, let me check your records.", "OTHER"),
]


def main() -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["sentence", "label"])
        writer.writerows(EXAMPLES)
    print(f"Saved classifier seed data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
