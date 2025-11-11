
export enum UserRole {
  Patient = 'patient',
  Admin = 'admin',
}

export interface User {
  id: string;
  email: string;
  password?: string; // Not sent to client in real app
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  role: UserRole;
}

export interface Dentist {
  id: string;
  name:string;
  specialty: string;
  color: string; // Hex color for calendar events
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
}

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no-show',
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  createdAt: Date;
}

export interface ClinicWorkingHours {
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  isOpen: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface ClinicSettings {
  workingHours: ClinicWorkingHours[];
  slotDurationMinutes: number;
  holidays: string[]; // "YYYY-MM-DD"
}

// For patient booking calendar
export interface TimeSlot {
  time: Date;
  isAvailable: boolean;
}

// For Admin reports
export interface ReportData {
  totalAppointments: number;
  noShowRate: number;
  attendanceRate: number;
  appointmentsByService: { [serviceName: string]: number };
  busiestDays: { [day: string]: number };
}
   