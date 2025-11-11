
import { User, Dentist, Service, Appointment, ClinicSettings, UserRole, AppointmentStatus } from './types';
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

// --- MOCK DATABASE ---
// In a real application, this data would come from a database.

export const MOCK_USERS: User[] = [
  { id: 'user-1', email: 'patient@nexsched.com', password: 'password123', name: 'John Doe', phone: '123-456-7890', age: 34, gender: 'Male', role: UserRole.Patient },
  { id: 'user-2', email: 'admin@nexsched.com', password: 'admin123', name: 'Dr. Admin', phone: '987-654-3210', age: 45, gender: 'Female', role: UserRole.Admin },
  { id: 'user-3', email: 'jane.smith@email.com', password: 'password123', name: 'Jane Smith', phone: '555-123-4567', age: 28, gender: 'Female', role: UserRole.Patient },
];

export const MOCK_DENTISTS: Dentist[] = [
  { id: 'dentist-1', name: 'Dr. Evelyn Reed', specialty: 'General Dentistry', color: '#3182CE' }, // Blue
  { id: 'dentist-2', name: 'Dr. Marcus Chen', specialty: 'Orthodontics', color: '#38A169' }, // Green
  { id: 'dentist-3', name: 'Dr. Sofia Garcia', specialty: 'Periodontics', color: '#805AD5' }, // Purple
];

export const MOCK_SERVICES: Service[] = [
  { id: 'service-1', name: 'Routine Checkup', durationMinutes: 45 },
  { id: 'service-2', name: 'Teeth Cleaning', durationMinutes: 60 },
  { id: 'service-3', name: 'Filling', durationMinutes: 60 },
  { id: 'service-4', name: 'Extraction', durationMinutes: 90 },
  { id: 'service-5', name: 'Orthodontic Consultation', durationMinutes: 30 },
];

const today = new Date();
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt-1', patientId: 'user-1', dentistId: 'dentist-1', serviceId: 'service-2', start: setSeconds(setMinutes(setHours(tomorrow, 9), 0), 0), end: setSeconds(setMinutes(setHours(tomorrow, 10), 0), 0), status: AppointmentStatus.Scheduled, createdAt: new Date() },
  { id: 'apt-2', patientId: 'user-3', dentistId: 'dentist-2', serviceId: 'service-5', start: setSeconds(setMinutes(setHours(tomorrow, 11), 30), 0), end: setSeconds(setMinutes(setHours(tomorrow, 12), 0), 0), status: AppointmentStatus.Scheduled, createdAt: new Date() },
  { id: 'apt-3', patientId: 'user-1', dentistId: 'dentist-1', serviceId: 'service-1', start: setSeconds(setMinutes(setHours(addDays(today, -10), 14), 0), 0), end: setSeconds(setMinutes(setHours(addDays(today, -10), 14), 45), 0), status: AppointmentStatus.Completed, createdAt: addDays(today, -12) },
  { id: 'apt-4', patientId: 'user-3', dentistId: 'dentist-3', serviceId: 'service-3', start: setSeconds(setMinutes(setHours(nextWeek, 10), 0), 0), end: setSeconds(setMinutes(setHours(nextWeek, 11), 0), 0), status: AppointmentStatus.Scheduled, createdAt: new Date() },
  { id: 'apt-5', patientId: 'user-1', dentistId: 'dentist-1', serviceId: 'service-2', start: setSeconds(setMinutes(setHours(addDays(today, -5), 10), 0), 0), end: setSeconds(setMinutes(setHours(addDays(today, -5), 11), 0), 0), status: AppointmentStatus.Cancelled, createdAt: addDays(today, -6) },
  { id: 'apt-6', patientId: 'user-3', dentistId: 'dentist-2', serviceId: 'service-5', start: setSeconds(setMinutes(setHours(addDays(today, -3), 15), 0), 0), end: setSeconds(setMinutes(setHours(addDays(today, -3), 15), 30), 0), status: AppointmentStatus.NoShow, createdAt: addDays(today, -4) },
];

export const MOCK_CLINIC_SETTINGS: ClinicSettings = {
  workingHours: [
    { dayOfWeek: 0, isOpen: false, start: "09:00", end: "17:00" }, // Sunday
    { dayOfWeek: 1, isOpen: true, start: "09:00", end: "17:00" }, // Monday
    { dayOfWeek: 2, isOpen: true, start: "09:00", end: "17:00" }, // Tuesday
    { dayOfWeek: 3, isOpen: true, start: "09:00", end: "17:00" }, // Wednesday
    { dayOfWeek: 4, isOpen: true, start: "09:00", end: "18:00" }, // Thursday
    { dayOfWeek: 5, isOpen: true, start: "09:00", end: "16:00" }, // Friday
    { dayOfWeek: 6, isOpen: false, start: "09:00", end: "17:00" }, // Saturday
  ],
  slotDurationMinutes: 30,
  holidays: ["2024-12-25", "2025-01-01"],
};

export const TIMEZONE = "Asia/Manila";
   