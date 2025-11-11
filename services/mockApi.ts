import { User, Appointment, Dentist, Service, ClinicSettings, TimeSlot, ReportData, AppointmentStatus, UserRole } from '../types';
import { MOCK_USERS, MOCK_APPOINTMENTS, MOCK_DENTISTS, MOCK_SERVICES, MOCK_CLINIC_SETTINGS } from '../constants';
import { parse, set, getDay, format, addMinutes, isWithinInterval, isSameDay } from 'date-fns';

// --- FAKE IN-MEMORY DATABASE ---
let users: User[] = [...MOCK_USERS];
let appointments: Appointment[] = [...MOCK_APPOINTMENTS];
let dentists: Dentist[] = [...MOCK_DENTISTS];
let services: Service[] = [...MOCK_SERVICES];
let clinicSettings: ClinicSettings = { ...MOCK_CLINIC_SETTINGS };

// --- SIMULATED SESSION ---
// This is a workaround for not having a real backend session.
let currentUserId: string | null = null;

const simulateDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 500));
};

// --- AUTH ---
export const login = (email: string, password: string): Promise<User | null> => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUserId = user.id;
    return simulateDelay(user);
  }
  return simulateDelay(null);
};

export const register = (details: Omit<User, 'id' | 'role' | 'password'> & { password_reg: string }): Promise<{ user: User | null; error?: string }> => {
  const { email, password_reg, name, phone, age, gender } = details;

  if (users.find(u => u.email === email)) {
    return simulateDelay({ user: null, error: "An account with this email already exists." });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password: password_reg,
    name,
    phone,
    age,
    gender,
    role: UserRole.Patient,
  };

  users.push(newUser);
  currentUserId = newUser.id; // Log in the new user immediately
  return simulateDelay({ user: newUser });
};


export const getCurrentUser = (): User | null => {
  if (!currentUserId) return null;
  return users.find(u => u.id === currentUserId) || null;
}

export const logout = (): void => {
  currentUserId = null;
};

// --- DATA FETCHING ---
export const getAppointmentsForUser = (userId: string): Promise<Appointment[]> => {
  const userAppointments = appointments.filter(a => a.patientId === userId);
  return simulateDelay(userAppointments);
};

export const getAllAppointments = (): Promise<Appointment[]> => simulateDelay(appointments);
export const getAllPatients = (): Promise<User[]> => simulateDelay(users.filter(u => u.role === 'patient'));
export const getDentists = (): Promise<Dentist[]> => simulateDelay(dentists);
export const getServices = (): Promise<Service[]> => simulateDelay(services);
export const getClinicSettings = (): Promise<ClinicSettings> => simulateDelay(clinicSettings);

// --- COMPLEX LOGIC (Availability) ---
export const getAvailableTimeSlots = (date: Date, dentistId: string, serviceId: string): Promise<TimeSlot[]> => {
  const dayOfWeek = getDay(date);
  const workingHours = clinicSettings.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
  const service = services.find(s => s.id === serviceId);

  if (!workingHours || !workingHours.isOpen || !service) {
    return simulateDelay([]);
  }

  const dayString = format(date, 'yyyy-MM-dd');
  if(clinicSettings.holidays.includes(dayString)) {
      return simulateDelay([]);
  }

  const startTime = parse(workingHours.start, 'HH:mm', date);
  const endTime = parse(workingHours.end, 'HH:mm', date);
  
  const dentistAppointments = appointments.filter(a => a.dentistId === dentistId && isSameDay(a.start, date) && a.status === AppointmentStatus.Scheduled);

  const allSlots: TimeSlot[] = [];
  let currentTime = startTime;

  while(currentTime < endTime) {
    const slotEnd = addMinutes(currentTime, service.durationMinutes);
    if (slotEnd > endTime) break;
    
    const isBooked = dentistAppointments.some(appt => 
      isWithinInterval(currentTime, { start: appt.start, end: appt.end }) ||
      isWithinInterval(slotEnd, { start: appt.start, end: appt.end }) ||
      isWithinInterval(appt.start, { start: currentTime, end: slotEnd })
    );

    allSlots.push({ time: new Date(currentTime.getTime()), isAvailable: !isBooked });
    currentTime = addMinutes(currentTime, clinicSettings.slotDurationMinutes);
  }
  
  return simulateDelay(allSlots);
};

// --- DATA MUTATION ---
export const bookAppointment = (details: { patientId: string, dentistId: string, serviceId: string, start: Date }): Promise<Appointment> => {
  const service = services.find(s => s.id === details.serviceId);
  if (!service) throw new Error("Service not found");

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    ...details,
    end: addMinutes(details.start, service.durationMinutes),
    status: AppointmentStatus.Scheduled,
    createdAt: new Date(),
  };

  appointments.push(newAppointment);
  return simulateDelay(newAppointment);
};

export const cancelAppointment = (appointmentId: string): Promise<Appointment> => {
  const appointment = appointments.find(a => a.id === appointmentId);
  if (!appointment) throw new Error("Appointment not found");
  appointment.status = AppointmentStatus.Cancelled;
  return simulateDelay(appointment);
};

export const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
  const appointment = appointments.find(a => a.id === appointmentId);
  if (!appointment) throw new Error("Appointment not found");
  appointment.status = status;
  return simulateDelay(appointment);
};


// --- REPORTS ---
export const getReportData = (): Promise<ReportData> => {
    const total = appointments.length;
    const noShows = appointments.filter(a => a.status === AppointmentStatus.NoShow).length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.Completed).length;

    const appointmentsByService = services.reduce((acc, service) => {
        acc[service.name] = appointments.filter(a => a.serviceId === service.id).length;
        return acc;
    }, {} as { [serviceName: string]: number });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const busiestDays = appointments.reduce((acc, appt) => {
        const day = dayNames[getDay(appt.start)];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as { [day: string]: number });

    const report: ReportData = {
        totalAppointments: total,
        noShowRate: total > 0 ? (noShows / total) * 100 : 0,
        attendanceRate: total > 0 ? (completed / total) * 100 : 0,
        appointmentsByService,
        busiestDays
    };
    return simulateDelay(report);
};