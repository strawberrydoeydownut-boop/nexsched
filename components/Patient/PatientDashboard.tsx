
import React, { useState, useEffect, useCallback } from 'react';
import { User, Appointment, Service, Dentist, AppointmentStatus } from '../../types';
import { getAppointmentsForUser, getServices, getDentists, cancelAppointment } from '../../services/mockApi';
import Header from '../Layout/Header';
import Booking from './Booking';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, UserIcon } from '../Shared/Icons';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'appointments' | 'booking'>('appointments');

  const fetchPatientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userAppointments, allServices, allDentists] = await Promise.all([
        getAppointmentsForUser(user.id),
        getServices(),
        getDentists(),
      ]);
      setAppointments(userAppointments);
      setServices(allServices);
      setDentists(allDentists);
    } catch (error) {
      console.error("Failed to fetch patient data", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleBookingSuccess = () => {
    fetchPatientData(); // Refresh appointments list
    setView('appointments'); // Switch back to appointments view
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
        await cancelAppointment(appointmentId);
        fetchPatientData();
        // Here you would trigger an email notification in a real app
        alert("Appointment cancelled successfully. A confirmation has been simulated.");
    }
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === AppointmentStatus.Scheduled && new Date(a.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  const pastAppointments = appointments
    .filter(a => new Date(a.start) < new Date())
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());


  const renderAppointments = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Appointments</h2>
        <button 
            onClick={() => setView('booking')}
            className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition duration-150"
        >
            Book New Appointment
        </button>
      </div>

      {isLoading ? (
        <p>Loading appointments...</p>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Upcoming</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map(app => {
                const dentist = dentists.find(d => d.id === app.dentistId);
                const service = services.find(s => s.id === app.serviceId);
                return (
                  <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <p className="font-bold text-brand-blue-dark text-lg">{service?.name}</p>
                      <div className="text-gray-600 mt-2 space-y-1 text-sm">
                        <p className="flex items-center"><UserIcon className="w-4 h-4 mr-2 text-brand-blue"/> {dentist?.name}</p>
                        <p className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-brand-blue"/> {format(new Date(app.start), 'eeee, MMMM d, yyyy')}</p>
                        <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-brand-blue"/> {format(new Date(app.start), 'h:mm a')} - {format(new Date(app.end), 'h:mm a')}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <button onClick={() => handleCancelAppointment(app.id)} className="text-sm px-4 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200">Cancel</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border-dashed border-2 border-gray-300">
                <p className="text-gray-500">You have no upcoming appointments.</p>
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">History</h3>
          {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                 {pastAppointments.map(app => {
                  const dentist = dentists.find(d => d.id === app.dentistId);
                  const service = services.find(s => s.id === app.serviceId);
                  const statusColors = {
                    [AppointmentStatus.Completed]: 'text-green-700 bg-green-100',
                    [AppointmentStatus.Cancelled]: 'text-gray-700 bg-gray-100',
                    [AppointmentStatus.NoShow]: 'text-red-700 bg-red-100',
                    [AppointmentStatus.Scheduled]: 'text-blue-700 bg-blue-100',
                  }
                  return (
                    <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-70">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="font-bold text-gray-700 text-lg">{service?.name}</p>
                            <p className="text-sm text-gray-500">{dentist?.name}</p>
                            <p className="text-sm text-gray-500">{format(new Date(app.start), 'MMMM d, yyyy')}</p>
                         </div>
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[app.status]}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )
                 })}
              </div>
          ): (
            <div className="text-center py-8 bg-white rounded-lg border-dashed border-2 border-gray-300">
                <p className="text-gray-500">No appointment history.</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'appointments' ? (
          renderAppointments()
        ) : (
          <Booking 
            user={user} 
            dentists={dentists}
            services={services}
            onBookingSuccess={handleBookingSuccess}
            onBack={() => setView('appointments')}
          />
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
   