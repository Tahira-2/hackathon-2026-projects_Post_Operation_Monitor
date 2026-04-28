from __future__ import annotations

import random
from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from appointments.models import Appointment, AppointmentReport, AppointmentSlot
from doctors.models import DoctorProfile
from medicines.models import Medicine
from orders.models import Order, OrderItem


SPECIALIZATIONS = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Orthopedic Surgeon",
    "Gynecologist",
    "ENT Specialist",
    "Psychiatrist",
    "Ophthalmologist",
    "Dentist",
    "Urologist",
]

HOSPITALS = [
    "Neuraliosis Central Hospital",
    "Sunrise Medical Center",
    "CityCare Clinic",
    "Harmony Health Institute",
    "BlueCross Multispecialty",
    "Green Valley Hospital",
    "Metro Health Center",
    "Royal Medical Institute",
]

APPOINTMENT_REASONS = [
    "Routine check-up",
    "Fever and fatigue",
    "Skin allergy consultation",
    "Back pain and posture issues",
    "Follow-up for blood pressure",
    "Migraine assessment",
    "Pediatric vaccination review",
    "Diabetes management",
    "Eye checkup",
    "Dental pain",
    "Chest pain consultation",
    "Sleep disorder",
    "Anxiety and stress",
    "Joint pain",
    "Headache and dizziness",
    "Respiratory infection",
    "Stomach pain",
    "High fever",
]

DOCTOR_FIRST_NAMES = [
    "Rajesh", "Sunita", "Amit", "Priya", "Vikram",
    "Anita", "Sanjay", "Meera", "Rohit", "Kavita",
    "Deepak", "Pooja", "Arun", "Nisha", "Suresh",
    "Rekha", "Manish", "Divya", "Ramesh", "Geeta",
]

DOCTOR_LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Gupta", "Kumar",
    "Verma", "Mehta", "Shah", "Joshi", "Rao",
    "Nair", "Reddy", "Iyer", "Mishra", "Pandey",
]

PATIENT_FIRST_NAMES = [
    "Aarav", "Ishaan", "Vihaan", "Aditi", "Ananya",
    "Riya", "Arjun", "Kabir", "Siya", "Rehan",
    "Pooja", "Rahul", "Sneha", "Karan", "Priya",
    "Rohan", "Nisha", "Amit", "Neha", "Vijay",
    "Sunita", "Deepak", "Kavya", "Suresh", "Meena",
]

PATIENT_LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Gupta", "Kumar",
    "Verma", "Mehta", "Shah", "Joshi", "Rao",
    "Nair", "Reddy", "Iyer", "Mishra", "Pandey",
]

MEDICINE_FIXTURES = [
    {
        "name": "Paracetamol 650mg",
        "description": "Used for fever and mild to moderate pain relief.",
        "category": "Pain Relief",
        "price": Decimal("3.50"),
        "stock": 320,
        "requires_prescription": False,
    },
    {
        "name": "Amoxicillin 500mg",
        "description": "Broad-spectrum antibiotic for bacterial infections.",
        "category": "Antibiotic",
        "price": Decimal("8.40"),
        "stock": 180,
        "requires_prescription": True,
    },
    {
        "name": "Cetirizine 10mg",
        "description": "Antihistamine for allergy symptom management.",
        "category": "Allergy",
        "price": Decimal("2.90"),
        "stock": 250,
        "requires_prescription": False,
    },
    {
        "name": "Metformin 500mg",
        "description": "Oral diabetes medicine that helps control blood sugar.",
        "category": "Diabetes",
        "price": Decimal("6.25"),
        "stock": 140,
        "requires_prescription": True,
    },
    {
        "name": "Amlodipine 5mg",
        "description": "Calcium channel blocker used to treat hypertension.",
        "category": "Cardiology",
        "price": Decimal("5.10"),
        "stock": 165,
        "requires_prescription": True,
    },
    {
        "name": "Omeprazole 20mg",
        "description": "Reduces stomach acid and treats reflux symptoms.",
        "category": "Gastro",
        "price": Decimal("4.75"),
        "stock": 210,
        "requires_prescription": False,
    },
    {
        "name": "Ibuprofen 400mg",
        "description": "Nonsteroidal anti-inflammatory drug for pain and inflammation.",
        "category": "Pain Relief",
        "price": Decimal("3.95"),
        "stock": 275,
        "requires_prescription": False,
    },
    {
        "name": "Vitamin D3",
        "description": "Supplement for bone and immune health support.",
        "category": "Supplements",
        "price": Decimal("7.20"),
        "stock": 230,
        "requires_prescription": False,
    },
    {
        "name": "Azithromycin 500mg",
        "description": "Antibiotic used to treat a wide variety of bacterial infections.",
        "category": "Antibiotic",
        "price": Decimal("12.50"),
        "stock": 120,
        "requires_prescription": True,
    },
    {
        "name": "Loratadine 10mg",
        "description": "Antihistamine for hay fever and allergy symptoms.",
        "category": "Allergy",
        "price": Decimal("3.20"),
        "stock": 200,
        "requires_prescription": False,
    },
    {
        "name": "Aspirin 75mg",
        "description": "Blood thinner used to prevent heart attacks and strokes.",
        "category": "Cardiology",
        "price": Decimal("2.50"),
        "stock": 300,
        "requires_prescription": False,
    },
    {
        "name": "Vitamin C 1000mg",
        "description": "Immune system booster and antioxidant supplement.",
        "category": "Supplements",
        "price": Decimal("5.80"),
        "stock": 280,
        "requires_prescription": False,
    },
]

FEATURED_PATIENT_EMAIL = "manjeyy@email.com"


class Command(BaseCommand):
    help = "Seeds sample data for users, doctors, appointments, medicines, and orders."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete previously seeded records before adding fresh sample data.",
        )
        parser.add_argument(
            "--patients",
            type=int,
            default=10,
            help="Number of patient users to seed (default: 10).",
        )
        parser.add_argument(
            "--doctors",
            type=int,
            default=5,
            help="Number of doctor users/profiles to seed (default: 5).",
        )
        parser.add_argument(
            "--days",
            type=int,
            default=5,
            help="How many upcoming days of appointment slots to create (default: 5).",
        )
        parser.add_argument(
            "--slots-per-day",
            type=int,
            default=4,
            help="How many slots to create per doctor per day (default: 4).",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="SeedPass@123",
            help="Password to set for all seeded users (default: SeedPass@123).",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=2026,
            help="Random seed for reproducible output (default: 2026).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        patients_count = max(1, options["patients"])
        doctors_count = max(1, options["doctors"])
        days = max(1, options["days"])
        slots_per_day = max(1, options["slots_per_day"])
        password = options["password"]

        random.seed(options["seed"])

        if options["reset"]:
            self._reset_seeded_data()

        self.stdout.write("Starting sample data seeding...")

        self._seed_admin(password=password)
        patients, created_patients = self._seed_patients(
            count=patients_count,
            password=password,
        )
        doctor_profiles, created_doctors = self._seed_doctors(
            count=doctors_count,
            password=password,
        )
        medicines, created_medicines = self._seed_medicines()
        slots, created_slots = self._seed_slots(
            doctor_profiles=doctor_profiles,
            days=days,
            slots_per_day=slots_per_day,
        )
        created_appointments = self._seed_appointments(
            patients=patients,
            slots=slots,
        )
        created_featured_appointments = self._seed_featured_patient_appointments(
            patients=patients,
            doctor_profiles=doctor_profiles,
        )
        created_reports = self._seed_reports()
        created_orders = self._seed_orders(
            patients=patients,
            medicines=medicines,
        )

        self.stdout.write(self.style.SUCCESS("Seeding completed successfully."))
        self.stdout.write(
            "\n".join(
                [
                    "Summary:",
                    f"  - Patients created   : {created_patients}",
                    f"  - Doctors created    : {created_doctors}",
                    f"  - Medicines created  : {created_medicines}",
                    f"  - Slots created      : {created_slots}",
                    f"  - Appointments created: {created_appointments}",
                    f"  - Featured patient appts: {created_featured_appointments}",
                    f"  - Reports created    : {created_reports}",
                    f"  - Orders created     : {created_orders}",
                    f"  - Login password     : {password}",
                    "",
                    "Sample logins:",
                    "  Admin   : seed-admin@neuraliosis.dev",
                    "  Patient : manjeyy@email.com",
                    "  Doctor  : doctor@email.com",
                ]
            )
        )

    def _seed_admin(self, password: str):
        user_model = get_user_model()
        admin_defaults = {
            "full_name": "Admin Neuraliosis",
            "role": user_model.Roles.ADMIN,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }

        admin, created = user_model.objects.get_or_create(
            email="seed-admin@neuraliosis.dev",
            defaults=admin_defaults,
        )

        if not created:
            for field_name, value in admin_defaults.items():
                setattr(admin, field_name, value)

        admin.set_password(password)
        admin.save()

    def _seed_patients(self, count: int, password: str):
        user_model = get_user_model()
        patients = []
        created_count = 0

        # Generate unique full names for patients
        used_names = set()
        names = []
        while len(names) < count:
            first = random.choice(PATIENT_FIRST_NAMES)
            last = random.choice(PATIENT_LAST_NAMES)
            full = f"{first} {last}"
            if full not in used_names:
                used_names.add(full)
                names.append(full)

        for index in range(1, count + 1):
            email = FEATURED_PATIENT_EMAIL if index == 1 else f"seed-patient-{index}@neuraliosis.dev"
            full_name = names[index - 1]
            defaults = {
                "full_name": full_name,
                "role": user_model.Roles.USER,
                "latitude": self._rand_latitude(),
                "longitude": self._rand_longitude(),
                "is_active": True,
            }

            user, created = user_model.objects.get_or_create(email=email, defaults=defaults)
            if created:
                created_count += 1
            else:
                for field_name, value in defaults.items():
                    setattr(user, field_name, value)

            user.set_password(password)
            user.save()
            patients.append(user)

        return patients, created_count

    def _seed_doctors(self, count: int, password: str):
        user_model = get_user_model()
        doctor_profiles = []
        created_doctors = 0

        # Generate unique full names for doctors
        used_names = set()
        names = []
        while len(names) < count:
            first = random.choice(DOCTOR_FIRST_NAMES)
            last = random.choice(DOCTOR_LAST_NAMES)
            full = f"Dr. {first} {last}"
            if full not in used_names:
                used_names.add(full)
                names.append(full)

        for index in range(1, count + 1):
            email = f"seed-doctor-{index}@neuraliosis.dev"
            full_name = names[index - 1]

            user_defaults = {
                "full_name": full_name,
                "role": user_model.Roles.DOCTOR,
                "latitude": self._rand_latitude(),
                "longitude": self._rand_longitude(),
                "is_active": True,
            }
            user, user_created = user_model.objects.get_or_create(
                email=email,
                defaults=user_defaults,
            )
            if not user_created:
                for field_name, value in user_defaults.items():
                    setattr(user, field_name, value)

            user.set_password(password)
            user.save()

            profile_defaults = {
                "specialization": SPECIALIZATIONS[(index - 1) % len(SPECIALIZATIONS)],
                "hospital_name": HOSPITALS[(index - 1) % len(HOSPITALS)],
                "latitude": self._rand_latitude(),
                "longitude": self._rand_longitude(),
                "available_from": time(hour=9, minute=0),
                "available_to": time(hour=18, minute=0),
                "phone_number": f"+9779800{index:04d}",
            }

            profile, profile_created = DoctorProfile.objects.get_or_create(
                user=user,
                defaults=profile_defaults,
            )
            if profile_created:
                created_doctors += 1
            else:
                for field_name, value in profile_defaults.items():
                    setattr(profile, field_name, value)
                profile.save()

            doctor_profiles.append(profile)

        return doctor_profiles, created_doctors

    def _seed_medicines(self):
        medicines = []
        created_count = 0

        for fixture in MEDICINE_FIXTURES:
            medicine, created = Medicine.objects.get_or_create(
                name=fixture["name"],
                defaults=fixture,
            )
            if created:
                created_count += 1
            else:
                for field_name, value in fixture.items():
                    setattr(medicine, field_name, value)
                medicine.save()
            medicines.append(medicine)

        return medicines, created_count

    def _seed_slots(self, doctor_profiles, days: int, slots_per_day: int):
        slots = []
        created_count = 0

        slot_windows = self._build_slot_windows(slots_per_day)
        if len(slot_windows) < slots_per_day:
            self.stdout.write(
                self.style.WARNING(
                    "slots-per-day capped at 10 to keep schedule within daytime hours."
                )
            )

        for profile in doctor_profiles:
            for day_offset in range(days):
                target_date = timezone.localdate() + timedelta(days=day_offset + 1)

                for start_time, end_time in slot_windows:
                    slot, created = AppointmentSlot.objects.get_or_create(
                        doctor=profile,
                        date=target_date,
                        start_time=start_time,
                        end_time=end_time,
                        defaults={"is_booked": False},
                    )
                    if created:
                        created_count += 1
                    slots.append(slot)

        return slots, created_count

    def _seed_appointments(self, patients, slots):
        available_slots = [
            slot
            for slot in slots
            if not slot.is_booked and not Appointment.objects.filter(slot=slot).exists()
        ]
        random.shuffle(available_slots)

        if not available_slots:
            return 0

        target_count = max(1, int(len(available_slots) * 0.55))
        selected_slots = available_slots[:target_count]

        created_count = 0
        for slot in selected_slots:
            scheduled_time = timezone.make_aware(
                datetime.combine(slot.date, slot.start_time),
                timezone.get_current_timezone(),
            )

            status = random.choices(
                [
                    Appointment.Status.CONFIRMED,
                    Appointment.Status.PENDING,
                    Appointment.Status.COMPLETED,
                ],
                weights=[0.45, 0.35, 0.20],
                k=1,
            )[0]

            Appointment.objects.create(
                user=random.choice(patients),
                doctor=slot.doctor,
                slot=slot,
                scheduled_time=scheduled_time,
                status=status,
                reason=random.choice(APPOINTMENT_REASONS),
            )

            slot.is_booked = True
            slot.save(update_fields=["is_booked"])
            created_count += 1

        return created_count

    def _seed_featured_patient_appointments(self, patients, doctor_profiles):
        featured_patient = next(
            (patient for patient in patients if patient.email == FEATURED_PATIENT_EMAIL),
            None,
        )
        if featured_patient is None or not doctor_profiles:
            return 0

        created_count = 0
        primary_doctor = doctor_profiles[0]

        live_slot_date = timezone.localdate() + timedelta(days=2)
        live_slot, _ = AppointmentSlot.objects.get_or_create(
            doctor=primary_doctor,
            date=live_slot_date,
            start_time=time(hour=17, minute=0),
            end_time=time(hour=18, minute=0),
            defaults={"is_booked": False},
        )
        live_scheduled_time = timezone.make_aware(
            datetime.combine(live_slot.date, live_slot.start_time),
            timezone.get_current_timezone(),
        )
        live_appointment, created = Appointment.objects.get_or_create(
            user=featured_patient,
            doctor=primary_doctor,
            slot=live_slot,
            defaults={
                "scheduled_time": live_scheduled_time,
                "status": Appointment.Status.CONFIRMED,
                "reason": "Follow-up consultation",
            },
        )
        if created:
            created_count += 1
        else:
            live_appointment.scheduled_time = live_scheduled_time
            live_appointment.status = Appointment.Status.CONFIRMED
            live_appointment.reason = "Follow-up consultation"
            live_appointment.doctor = primary_doctor
            live_appointment.user = featured_patient
            live_appointment.slot = live_slot
            live_appointment.save()
        live_slot.is_booked = True
        live_slot.save(update_fields=["is_booked"])

        history_specs = [
            (21, "Annual review", "Routine follow-up. Patient is recovering well."),
            (9, "Medication review", "Symptoms are improving. Continue current plan."),
        ]
        for days_ago, reason, diagnosis in history_specs:
            scheduled_time = timezone.make_aware(
                datetime.combine(
                    timezone.localdate() - timedelta(days=days_ago),
                    time(hour=10, minute=0),
                ),
                timezone.get_current_timezone(),
            )
            history_appointment, created = Appointment.objects.get_or_create(
                user=featured_patient,
                doctor=primary_doctor,
                scheduled_time=scheduled_time,
                defaults={
                    "slot": None,
                    "status": Appointment.Status.COMPLETED,
                    "reason": reason,
                },
            )
            if created:
                created_count += 1
            else:
                history_appointment.doctor = primary_doctor
                history_appointment.user = featured_patient
                history_appointment.slot = None
                history_appointment.status = Appointment.Status.COMPLETED
                history_appointment.reason = reason
                history_appointment.save()

            AppointmentReport.objects.update_or_create(
                appointment=history_appointment,
                defaults={
                    "diagnosis": diagnosis,
                    "notes": "Seeded history entry for the featured patient.",
                    "suggestions": "Continue rest, hydration, and follow-up if symptoms recur.",
                    "prescriptions": "As needed symptomatic treatment only.",
                },
            )

        return created_count

    def _seed_reports(self):
        completed_without_reports = Appointment.objects.filter(
            status=Appointment.Status.COMPLETED,
            report__isnull=True,
        )

        created_count = 0
        for appointment in completed_without_reports:
            _, created = AppointmentReport.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "diagnosis": "Condition stable. Continue medications and monitoring.",
                    "notes": "Patient responded well to the treatment plan.",
                    "suggestions": "Maintain hydration, balanced diet, and regular sleep.",
                    "prescriptions": "Paracetamol 650mg after meals as needed for 3 days.",
                },
            )
            if created:
                created_count += 1

        return created_count

    def _seed_orders(self, patients, medicines):
        created_count = 0
        if not medicines:
            return created_count

        for patient in patients:
            if patient.orders.exists():
                continue

            order = Order.objects.create(
                user=patient,
                status=random.choice(
                    [Order.Status.PENDING, Order.Status.CONFIRMED, Order.Status.CANCELLED]
                ),
                total=Decimal("0.00"),
            )

            selected_medicines = random.sample(medicines, k=min(3, len(medicines)))
            total = Decimal("0.00")

            for medicine in selected_medicines:
                quantity = random.randint(1, 3)
                OrderItem.objects.create(
                    order=order,
                    medicine=medicine,
                    quantity=quantity,
                    price=medicine.price,
                )
                total += medicine.price * quantity

            order.total = total.quantize(Decimal("0.01"))
            order.save(update_fields=["total"])
            created_count += 1

        return created_count

    def _reset_seeded_data(self):
        self.stdout.write(self.style.WARNING("Reset flag detected. Removing existing seeded data..."))

        user_model = get_user_model()
        seeded_users = user_model.objects.filter(
            Q(email="seed-admin@neuraliosis.dev")
            | Q(email=FEATURED_PATIENT_EMAIL)
            | Q(email__startswith="seed-patient-")
            | Q(email__startswith="seed-doctor-")
        )
        seeded_doctors = DoctorProfile.objects.filter(user__in=seeded_users)

        scoped_appointments = Appointment.objects.filter(
            Q(user__in=seeded_users) | Q(doctor__in=seeded_doctors)
        )
        AppointmentReport.objects.filter(appointment__in=scoped_appointments).delete()
        scoped_appointments.delete()

        AppointmentSlot.objects.filter(doctor__in=seeded_doctors).delete()
        Order.objects.filter(user__in=seeded_users).delete()
        DoctorProfile.objects.filter(user__in=seeded_users).delete()
        Medicine.objects.filter(
            name__in=[fixture["name"] for fixture in MEDICINE_FIXTURES]
        ).delete()
        seeded_users.delete()

        self.stdout.write(self.style.SUCCESS("Reset complete."))

    @staticmethod
    def _rand_latitude():
        return Decimal(str(round(random.uniform(22.0, 26.0), 6)))

    @staticmethod
    def _rand_longitude():
        return Decimal(str(round(random.uniform(88.0, 92.0), 6)))

    @staticmethod
    def _build_slot_windows(slots_per_day: int):
        max_slots = min(slots_per_day, 10)
        return [
            (time(hour=9 + idx, minute=0), time(hour=10 + idx, minute=0))
            for idx in range(max_slots)
        ]