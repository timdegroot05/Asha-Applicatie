import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaptops } from '../context/LaptopContext';
import { useReservations } from '../context/ReservationContext';
import { AlertCircle, CheckCircle2, Unlink, User, Phone, Mail } from 'lucide-react';

export default function LaptopAssignment() {
  const navigate = useNavigate();
  const { laptops, updateLaptop, checkAndUpdateLaptopStatuses } = useLaptops();
  const { reservations, assignLaptop, unassignLaptop } = useReservations();
  const [selectedLaptopId, setSelectedLaptopId] = React.useState<string | null>(null);

  useEffect(() => {
    checkAndUpdateLaptopStatuses();
  }, []);

  const approvedReservations = reservations.filter(res => res.status === 'approved');

  const handleAssignLaptop = (reservationId: string, laptopId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    if (reservation.assignedLaptops.length >= reservation.quantity) {
      alert('Het maximaal aantal laptops is al toegewezen aan deze reservering.');
      return;
    }

    const laptop = laptops.find(l => l.id === laptopId);
    if (!laptop) return;

    assignLaptop(reservationId, laptopId);
    updateLaptop({
      ...laptop,
      status: 'gereserveerd'
    });
    setSelectedLaptopId(null);
  };

  const handleUnassignLaptop = (laptopId: string) => {
    const assignedReservation = approvedReservations.find(
      res => res.assignedLaptops.includes(laptopId)
    );

    if (!assignedReservation) return;

    unassignLaptop(assignedReservation.id, laptopId);

    const laptop = laptops.find(l => l.id === laptopId);
    if (laptop) {
      updateLaptop({
        ...laptop,
        status: 'beschikbaar'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1c1c1c]">Laptops Toewijzen</h1>
        <button
          onClick={() => navigate('/reservations')}
          className="w-full sm:w-auto px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
        >
          Terug naar overzicht
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {laptops.map((laptop) => {
          const activeProblems = laptop.problems.filter(p => p.status === 'open');
          const resolvedProblems = laptop.problems.filter(p => p.status === 'resolved');
          const isAssigned = approvedReservations.some(res => 
            res.assignedLaptops.includes(laptop.id)
          );
          const isSelected = selectedLaptopId === laptop.id;
          
          return (
            <div 
              key={laptop.id} 
              className={`bg-white rounded-lg shadow-md p-4 ${
                isSelected ? 'ring-2 ring-[#07114d]' : ''
              }`}
              style={{ height: isSelected ? 'auto' : 'fit-content' }}
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-[#07114d] break-words">{laptop.computerName}</h2>
                <p className="break-words">CPU: {laptop.cpu}</p>
                <p className="break-words">RAM: {laptop.ram}</p>
                <p className="break-words">GPU: {laptop.gpu}</p>
                <p>Status: <span className={
                  laptop.status === 'storing' ? 'text-[#d73f3f]' :
                  laptop.status === 'Controleren' ? 'text-[#e4c76b]' :
                  laptop.status === 'beschikbaar' ? 'text-[#599651]' :
                  laptop.status === 'in behandeling' ? 'text-[#e4c76b]' :
                  laptop.status === 'gereserveerd' ? 'text-[#07114d]' :
                  'text-[#599651]'
                }>{laptop.status}</span></p>

                {activeProblems.length > 0 && (
                  <div className="flex items-center gap-1 text-[#d73f3f]">
                    <AlertCircle size={16} />
                    <span>{activeProblems.length} actief {activeProblems.length === 1 ? 'probleem' : 'problemen'}</span>
                  </div>
                )}

                {resolvedProblems.length > 0 && (
                  <div className="flex items-center gap-1 text-[#599651]">
                    <CheckCircle2 size={16} />
                    <span>{resolvedProblems.length} opgelost {resolvedProblems.length === 1 ? 'probleem' : 'problemen'}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedLaptopId === laptop.id) {
                        setSelectedLaptopId(null);
                      } else {
                        setSelectedLaptopId(laptop.id);
                      }
                    }}
                    disabled={laptop.status === 'storing' || laptop.status === 'Controleren' || laptop.status === 'gereserveerd'}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      laptop.status === 'storing' || laptop.status === 'Controleren' || laptop.status === 'gereserveerd'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isSelected
                          ? 'bg-[#2e376f] text-white'
                          : 'bg-[#07114d] text-white hover:bg-[#2e376f]'
                    }`}
                  >
                    {laptop.status === 'storing' || laptop.status === 'Controleren' || laptop.status === 'gereserveerd'
                      ? 'Niet beschikbaar'
                      : isSelected
                        ? 'Deselecteren'
                        : 'Selecteren'
                    }
                  </button>
                  
                  {isAssigned && (
                    <button
                      onClick={() => handleUnassignLaptop(laptop.id)}
                      className="px-4 py-2 bg-[#d73f3f] text-white rounded-lg hover:bg-red-600"
                      title="Ontkoppel van reservering"
                    >
                      <Unlink size={20} />
                    </button>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                  <h3 className="font-semibold">Goedgekeurde Reserveringen:</h3>
                  {approvedReservations.length > 0 ? (
                    <div className="space-y-2">
                      {approvedReservations.map((reservation) => (
                        <div key={reservation.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                          {/* Contactgegevens */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="text-[#07114d]" size={20} />
                              <p className="font-semibold">{reservation.contactName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="text-[#07114d]" size={20} />
                              <a href={`tel:${reservation.contactPhone}`} className="text-[#07114d] hover:underline">
                                {reservation.contactPhone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="text-[#07114d]" size={20} />
                              <a href={`mailto:${reservation.contactEmail}`} className="text-[#07114d] hover:underline">
                                {reservation.contactEmail}
                              </a>
                            </div>
                          </div>

                          {/* Reserveringsdetails */}
                          <div className="pt-2 border-t">
                            <p className="font-medium">
                              Aantal laptops: {reservation.assignedLaptops.length} van {reservation.quantity} toegewezen
                            </p>
                            <p className="text-sm">Datum: {reservation.startDate}</p>
                            <p className="text-sm">Tijd: {reservation.startTime} - {reservation.endTime}</p>
                            <p className="text-sm mt-2 text-gray-600">{reservation.description}</p>
                          </div>

                          <button
                            onClick={() => handleAssignLaptop(reservation.id, laptop.id)}
                            disabled={reservation.assignedLaptops.length >= reservation.quantity}
                            className={`mt-2 w-full px-3 py-1.5 rounded-lg ${
                              reservation.assignedLaptops.length >= reservation.quantity
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#599651] text-white hover:bg-green-600'
                            }`}
                          >
                            {reservation.assignedLaptops.length >= reservation.quantity
                              ? 'Maximaal aantal bereikt'
                              : 'Toewijzen aan deze reservering'
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      Er zijn geen goedgekeurde reserveringen
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {laptops.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            Er zijn geen laptops beschikbaar
          </div>
        )}
      </div>
    </div>
  );
}