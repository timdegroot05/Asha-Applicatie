import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext';
import { CheckCircle2, XCircle, User, Phone, Mail } from 'lucide-react';

export default function ReservationStatus() {
  const navigate = useNavigate();
  const { reservations, updateReservationDescription } = useReservations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [error, setError] = useState('');
  
  const processedReservations = reservations.filter(
    res => res.status === 'approved' || res.status === 'rejected'
  );

  const handleEdit = (reservation: typeof reservations[0]) => {
    setEditingId(reservation.id);
    setEditedDescription(reservation.description);
    setError('');
  };

  const handleSave = (id: string) => {
    if (!editedDescription.trim()) {
      setError('De wens van de klant mag niet leeg zijn');
      return;
    }

    updateReservationDescription(id, editedDescription);
    setEditingId(null);
    setEditedDescription('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1c1c1c]">Verwerkte Reserveringen</h1>
        <button
          onClick={() => navigate('/reservations')}
          className="w-full sm:w-auto px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
        >
          Terug naar overzicht
        </button>
      </div>
      
      <div className="grid gap-4">
        {processedReservations.map((reservation) => (
          <div 
            key={reservation.id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              reservation.status === 'approved' 
                ? 'border-l-4 border-[#599651]' 
                : 'border-l-4 border-[#d73f3f]'
            }`}
          >
            <div className={`p-2 ${
              reservation.status === 'approved' 
                ? 'bg-green-50' 
                : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {reservation.status === 'approved' ? (
                  <CheckCircle2 className="text-[#599651]" size={24} />
                ) : (
                  <XCircle className="text-[#d73f3f]" size={24} />
                )}
                <span className={`font-semibold ${
                  reservation.status === 'approved' 
                    ? 'text-[#599651]' 
                    : 'text-[#d73f3f]'
                }`}>
                  {reservation.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                </span>
                {reservation.processedDate && (
                  <span className="text-sm text-gray-500 ml-auto">
                    Verwerkt op: {new Date(reservation.processedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
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

              {/* Datum en tijd */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold">Datum: {reservation.startDate}</p>
                <p className="font-semibold">Tijd: {reservation.startTime} - {reservation.endTime}</p>
              </div>

              {/* Aantal laptops */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold">
                  Aantal laptops: <span className="text-[#07114d]">{reservation.quantity}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Toegewezen: {reservation.assignedLaptops.length} van {reservation.quantity}
                </p>
              </div>

              {/* Wens van klant */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Wens van klant:</p>
                  {reservation.status === 'approved' && editingId !== reservation.id && (
                    <button
                      onClick={() => handleEdit(reservation)}
                      className="px-3 py-1 text-sm bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
                    >
                      Aanpassen
                    </button>
                  )}
                </div>
                
                {editingId === reservation.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows={4}
                      placeholder="Voer de wens van de klant in..."
                    />
                    {error && (
                      <p className="text-[#d73f3f] text-sm">{error}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(reservation.id)}
                        className="px-3 py-1 bg-[#599651] text-white rounded-lg hover:bg-green-600"
                      >
                        Opslaan
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditedDescription('');
                          setError('');
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {reservation.description}
                  </p>
                )}
              </div>

              {/* Reden voor afwijzing */}
              {reservation.reason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <p className="font-semibold text-[#d73f3f] mb-1">Reden voor afwijzing:</p>
                  <p className="text-gray-700">{reservation.reason}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {processedReservations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-gray-500">
            Er zijn nog geen verwerkte reserveringen
          </div>
        )}
      </div>
    </div>
  );
}