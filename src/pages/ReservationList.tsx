import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext';
import { Search, ArrowUpDown, Mail, Phone, User, X } from 'lucide-react';

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'laptops-asc' | 'laptops-desc';

export default function ReservationList() {
  const navigate = useNavigate();
  const { reservations, updateReservationStatus } = useReservations();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  
  // Ref for the rejection form
  const rejectionFormRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to rejection form when it appears
  useEffect(() => {
    if (showRejectionForm && rejectionFormRef.current) {
      rejectionFormRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [showRejectionForm]);

  const pendingReservations = reservations
    .filter(res => res.status === 'pending')
    .filter(res => 
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'date-desc':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'name-asc':
          return a.contactName.localeCompare(b.contactName);
        case 'name-desc':
          return b.contactName.localeCompare(a.contactName);
        case 'laptops-asc':
          return a.quantity - b.quantity;
        case 'laptops-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Vul een reden in voor de afwijzing');
      return;
    }

    updateReservationStatus(id, 'rejected', rejectionReason);
    setShowRejectionForm(null);
    setRejectionReason('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1c1c1c]">Overzicht Reserveringen</h1>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Filters en Sortering</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoeken
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek op naam, email of wens..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sorteren op
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none"
              >
                <option value="date-asc">Datum (oplopend)</option>
                <option value="date-desc">Datum (aflopend)</option>
                <option value="name-asc">Naam (A-Z)</option>
                <option value="name-desc">Naam (Z-A)</option>
                <option value="laptops-asc">Aantal laptops (oplopend)</option>
                <option value="laptops-desc">Aantal laptops (aflopend)</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {pendingReservations.map((reservation) => (
          <div key={reservation.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="w-full space-y-4">
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
                <div>
                  <p className="font-semibold">Wens van klant:</p>
                  <p className="text-gray-700 whitespace-pre-wrap mt-1">{reservation.description}</p>
                </div>

                {/* Status */}
                <p className="font-semibold text-[#e4c76b]">
                  Status: {reservation.status}
                </p>

                {/* Rejection Form */}
                {showRejectionForm === reservation.id && (
                  <div 
                    ref={rejectionFormRef}
                    className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 animate-fadeIn"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[#d73f3f]">Reden voor afwijzing</h3>
                      <button
                        onClick={() => {
                          setShowRejectionForm(null);
                          setRejectionReason('');
                          setError('');
                        }}
                        className="p-1 hover:bg-red-100 rounded-full"
                      >
                        <X size={20} className="text-[#d73f3f]" />
                      </button>
                    </div>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border rounded-lg mt-2"
                      rows={3}
                      placeholder="Geef een reden voor het afwijzen van deze reservering..."
                      autoFocus
                    />
                    {error && (
                      <p className="text-[#d73f3f] text-sm mt-2">{error}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleReject(reservation.id)}
                        className="flex-1 px-4 py-2 bg-[#d73f3f] text-white rounded-lg hover:bg-red-600"
                      >
                        Bevestig Afwijzing
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectionForm(null);
                          setRejectionReason('');
                          setError('');
                        }}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {!showRejectionForm && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'approved')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#599651] text-white rounded-lg hover:bg-green-600"
                  >
                    Goedkeuren
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(reservation.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#d73f3f] text-white rounded-lg hover:bg-red-600"
                  >
                    Afwijzen
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingReservations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-gray-500">
            {searchQuery
              ? 'Geen reserveringen gevonden die overeenkomen met uw zoekopdracht'
              : 'Er zijn geen openstaande reserveringen'
            }
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => navigate('/reservations/status')}
          className="w-full sm:w-auto px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
        >
          Bekijk Verwerkte Reserveringen
        </button>
        <button
          onClick={() => navigate('/reservations/assign')}
          className="w-full sm:w-auto px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
        >
          Laptops Toewijzen
        </button>
      </div>
    </div>
  );
}