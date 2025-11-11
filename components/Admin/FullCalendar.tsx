
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus, Dentist, Service, User } from '../../types';
import { getAllAppointments, getDentists, getServices, getAllPatients, updateAppointmentStatus } from '../../services/mockApi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, isSameDay, startOfDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '../Shared/Icons';
import Modal from '../Shared/Modal';

const statusColors: { [key in AppointmentStatus]: { bg: string, text: string, border: string } } = {
  [AppointmentStatus.Scheduled]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
  [AppointmentStatus.Completed]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  [AppointmentStatus.Cancelled]: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-400' },
  [AppointmentStatus.NoShow]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
};

const FullCalendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [patients, setPatients] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [apps, dens, servs, pats] = await Promise.all([
                getAllAppointments(),
                getDentists(),
                getServices(),
                getAllPatients()
            ]);
            setAppointments(apps);
            setDentists(dens);
            setServices(servs);
            setPatients(pats);
        } catch (error) {
            console.error("Failed to fetch calendar data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const firstDayOfMonth = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
    const lastDayOfMonth = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
    const daysInMonth = useMemo(() => eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth }), [firstDayOfMonth, lastDayOfMonth]);
    const startingDayIndex = getDay(firstDayOfMonth);

    const appointmentsByDay = useMemo(() => {
        return daysInMonth.reduce((acc, day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const appointmentsForDay = appointments
                .filter(app => isSameDay(app.start, day))
                .sort((a,b) => a.start.getTime() - b.start.getTime());
            if (appointmentsForDay.length > 0) {
                acc[dayKey] = appointmentsForDay;
            }
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [daysInMonth, appointments]);

    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;
        
        await updateAppointmentStatus(selectedAppointment.id, newStatus);
        setSelectedAppointment(null);
        fetchData();
        // Here you would trigger an email notification in a real app
        alert(`Appointment status updated to ${newStatus}. A notification has been simulated.`);
    };
    
    const selectedAppointmentDetails = useMemo(() => {
        if (!selectedAppointment) return null;
        const patient = patients.find(p => p.id === selectedAppointment.patientId);
        const dentist = dentists.find(d => d.id === selectedAppointment.dentistId);
        const service = services.find(s => s.id === selectedAppointment.serviceId);
        return { patient, dentist, service };
    }, [selectedAppointment, patients, dentists, services]);


    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-6 h-6" /></button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Today</button>
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</h2>
                {/* Filters could go here */}
            </div>

            <div className="grid grid-cols-7 border-t border-l border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 border-r border-b">{day}</div>
                )}
                
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} className="border-r border-b h-32"/>)}
                
                {daysInMonth.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayAppointments = appointmentsByDay[dayKey] || [];
                    return (
                        <div key={day.toString()} className={`relative p-1 border-r border-b h-32 md:h-40 overflow-y-auto ${isToday(day) ? 'bg-blue-50' : ''}`}>
                            <span className={`text-xs ${isToday(day) ? 'font-bold text-brand-blue' : 'text-gray-600'}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="mt-1 space-y-1">
                                {dayAppointments.map(app => {
                                    const service = services.find(s => s.id === app.serviceId);
                                    const dentist = dentists.find(d => d.id === app.dentistId);
                                    return (
                                        <button 
                                            key={app.id}
                                            onClick={() => setSelectedAppointment(app)}
                                            className={`w-full text-left p-1 rounded-md text-xs truncate cursor-pointer ${statusColors[app.status].bg} ${statusColors[app.status].text}`}
                                            style={{ borderLeft: `3px solid ${dentist?.color || '#A0AEC0'}`}}
                                        >
                                            <span className="font-semibold">{format(app.start, 'h:mma')}</span> {service?.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {selectedAppointment && selectedAppointmentDetails && (
                 <Modal isOpen={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} title="Appointment Details">
                    <div>
                        <p><strong>Patient:</strong> {selectedAppointmentDetails.patient?.name}</p>
                        <p><strong>Service:</strong> {selectedAppointmentDetails.service?.name}</p>
                        <p><strong>Dentist:</strong> {selectedAppointmentDetails.dentist?.name}</p>
                        <p><strong>Time:</strong> {format(selectedAppointment.start, 'MMM d, h:mm a')} - {format(selectedAppointment.end, 'h:mm a')}</p>
                        <p><strong>Status:</strong> <span className="font-semibold">{selectedAppointment.status}</span></p>

                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-700">Change Status:</label>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => handleStatusChange(AppointmentStatus.Completed)} className="flex-1 px-3 py-1 text-sm bg-green-200 text-green-800 rounded-md hover:bg-green-300">Completed</button>
                                <button onClick={() => handleStatusChange(AppointmentStatus.NoShow)} className="flex-1 px-3 py-1 text-sm bg-red-200 text-red-800 rounded-md hover:bg-red-300">No-Show</button>
                                <button onClick={() => handleStatusChange(AppointmentStatus.Cancelled)} className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelled</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FullCalendar;
   