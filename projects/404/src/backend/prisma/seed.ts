import { PrismaClient, Role, WeekDay } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type SeedUser = {
  email: string;
  password: string;
  role: Role;
  fullName: string;
};

async function upsertUser({ email, password, role, fullName }: SeedUser) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { fullName, password: hashedPassword, role },
    create: { fullName, email, password: hashedPassword, role },
  });
}

const specializations = [
  { name: 'General Medicine', description: 'Primary care and general health issues' },
  { name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
  { name: 'Neurology', description: 'Brain, spinal cord, and nervous system' },
  { name: 'Pediatrics', description: 'Healthcare for children and adolescents' },
];

const doctorSeeds = [
  { email: 'doctor@gmail.com', fullName: 'Dr. Sarah Johnson', password: 'doctor@123', specialization: 'General Medicine' },
  { email: 'cardiologist@careflow.com', fullName: 'Dr. Michael Chen', password: 'doctor@123', specialization: 'Cardiology' },
  { email: 'dermatologist@careflow.com', fullName: 'Dr. Priya Sharma', password: 'doctor@123', specialization: 'Dermatology' },
  { email: 'neurologist@careflow.com', fullName: 'Dr. James Wilson', password: 'doctor@123', specialization: 'Neurology' },
  { email: 'pediatrician@careflow.com', fullName: 'Dr. Amina Osei', password: 'doctor@123', specialization: 'Pediatrics' },
];

const workingHourSlots = [
  { days: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY], start: '09:00', end: '17:00' },
  { days: [WeekDay.TUESDAY, WeekDay.THURSDAY], start: '10:00', end: '18:00' },
  { days: [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY, WeekDay.FRIDAY], start: '08:00', end: '16:00' },
  { days: [WeekDay.WEDNESDAY, WeekDay.FRIDAY], start: '11:00', end: '19:00' },
  { days: [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.THURSDAY, WeekDay.SATURDAY], start: '09:30', end: '17:30' },
];

async function main() {
  // Seed admin
  await upsertUser({ email: 'admin@gmail.com', password: 'admin123', role: Role.ADMIN, fullName: 'Admin User' });

  // Seed patient
  const patient = await upsertUser({ email: 'patient@gmail.com', password: 'patient123', role: Role.PATIENT, fullName: 'Patient User' });
  await prisma.patient.upsert({ where: { userId: patient.id }, update: {}, create: { userId: patient.id } });

  // Seed specializations
  const specMap = new Map<string, string>();
  for (const spec of specializations) {
    const s = await prisma.specialization.upsert({
      where: { name: spec.name },
      update: { description: spec.description },
      create: spec,
    });
    specMap.set(s.name, s.id);
  }

  // Seed doctors
  for (let i = 0; i < doctorSeeds.length; i++) {
    const ds = doctorSeeds[i];
    const slots = workingHourSlots[i % workingHourSlots.length];
    const doctorUser = await upsertUser({ ...ds, role: Role.DOCTOR });
    const specId = specMap.get(ds.specialization)!;

    const doctor = await prisma.doctor.upsert({
      where: { userId: doctorUser.id },
      update: { specializationId: specId },
      create: { userId: doctorUser.id, specializationId: specId },
    });

    for (const day of slots.days) {
      await prisma.workingHours.upsert({
        where: { doctorId_day: { doctorId: doctor.id, day } },
        update: { startTime: slots.start, endTime: slots.end },
        create: { doctorId: doctor.id, day, startTime: slots.start, endTime: slots.end },
      });
    }
  }

  console.log('✅ Seeded: 1 admin, 1 patient, 5 doctors across 5 specializations');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
