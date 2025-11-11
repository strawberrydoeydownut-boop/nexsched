
import React, { useState, useMemo, useEffect } from 'react';
import { User, Dentist, Service, TimeSlot } from '../../types';
import { getAvailableTimeSlots, bookAppointment } from '../../services/mockApi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isBefore, startOfToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '../Shared/Icons';
import Modal from '../Shared/Modal';

interface BookingProps {
    user: User;
    dentists: Dentist[];
    services: Service[];
    onBookingSuccess: () => void;
    onBack: () => void;
}

const Booking: React.FC<BookingProps> = ({ user, dentists, services, onBookingSuccess, onBack }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDentist, setSelectedDentist] = useState<string>(dentists[0]?.id || '');
    const [selectedService, setSelectedService] = useState<string>(services[0]?.id || '');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const firstDayOfMonth = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
    const lastDayOfMonth = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
    const daysInMonth = useMemo(() => eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth }), [firstDayOfMonth, lastDayOfMonth]);
    const startingDayIndex = getDay(firstDayOfMonth);

    useEffect(() => {
        if (selectedDate && selectedDentist && selectedService) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                setTimeSlots([]);
                const slots = await getAvailableTimeSlots(selectedDate, selectedDentist, selectedService);
                setTimeSlots(slots);
                setIsLoadingSlots(false);
            };
            fetchSlots();
        }
    }, [selectedDate, selectedDentist, selectedService]);
    
    const handleDateClick = (day: Date) => {
        if (isBefore(day, startOfToday())) return;
        setSelectedDate(day);
        setSelectedTime(null);
    };

    const handleBookAppointment = async () => {
        if (!selectedTime || !selectedDentist || !selectedService || !user) return;
        
        setIsBooking(true);
        try {
            await bookAppointment({
                patientId: user.id,
                dentistId: selectedDentist,
                serviceId: selectedService,
                start: selectedTime
            });
            // In a real app, send email confirmation here
            alert("Appointment booked successfully! A confirmation has been simulated.");
            onBookingSuccess();
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to book appointment. Please try again.");
        } finally {
            setIsBooking(false);
            setIsConfirming(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Book an Appointment</h2>
                <button onClick={onBack} className="text-sm text-brand-blue hover:underline">Back to Dashboard</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 & 2: Service and Dentist Selection */}
                <div className="md:col-span-1 space-y-4">
                    <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
                        <select id="service" value={selectedService} onChange={e => setSelectedService(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dentist" className="block text-sm font-medium text-gray-700">Dentist</label>
                        <select id="dentist" value={selectedDentist} onChange={e => setSelectedDentist(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                            {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Step 3: Calendar Date Selection */}
                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(day => {
                            const isPast = isBefore(day, startOfToday());
                            const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                                <div key={day.toString()} className="flex justify-center items-center">
                                    <button 
                                        onClick={() => handleDateClick(day)}
                                        disabled={isPast}
                                        className={`w-10 h-10 rounded-full transition-colors duration-200 ${
                                            isPast ? 'text-gray-400 cursor-not-allowed' : 
                                            isSelected ? 'bg-brand-blue text-white' :
                                            isToday(day) ? 'text-brand-blue font-bold' : 'hover:bg-brand-blue-light'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step 4: Time Slot Selection */}
            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Available Slots for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                    {isLoadingSlots ? <p>Loading slots...</p> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {timeSlots.filter(s => s.isAvailable).length > 0 ? timeSlots.filter(s => s.isAvailable).map(slot => (
                                <button
                                    key={slot.time.toISOString()}
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`p-2 rounded-md text-sm border ${selectedTime?.getTime() === slot.time.getTime() ? 'bg-brand-blue text-white' : 'bg-gray-50 hover:bg-brand-blue-light'}`}
                                >
                                    {format(slot.time, 'h:mm a')}
                                </button>
                            )) : <p className="col-span-full text-gray-500">No available slots for this day with the selected service/dentist. Please try another day or provider.</p>}
                        </div>
                    )}
                </div>
            )}

            {selectedTime && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => setIsConfirming(true)} className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600">
                        Confirm Booking
                    </button>
                </div>
            )}

            <Modal isOpen={isConfirming} onClose={() => setIsConfirming(false)} title="Confirm Your Appointment">
                <div>
                    <p className="mb-2"><strong>Service:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                    <p className="mb-2"><strong>Dentist:</strong> {dentists.find(d => d.id === selectedDentist)?.name}</p>
                    <p className="mb-2"><strong>Date:</strong> {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</p>
                    <p className="mb-4"><strong>Time:</strong> {selectedTime && format(selectedTime, 'h:mm a')}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsConfirming(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button onClick={handleBookAppointment} disabled={isBooking} className="px-4 py-2 bg-brand-blue text-white rounded-md disabled:bg-gray-400">
                            {isBooking ? 'Booking...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Booking;
   