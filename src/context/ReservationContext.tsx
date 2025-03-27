import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Interface voor een reservering
export interface Reservation {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  quantity: number;
  assignedLaptops: string[];
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  processedDate?: string;
  reason?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

// Context interface voor reserveringen
interface ReservationContextType {
  reservations: Reservation[];
  updateReservationStatus: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  updateReservationDescription: (id: string, description: string) => Promise<void>;
  assignLaptop: (reservationId: string, laptopId: string) => Promise<void>;
  unassignLaptop: (reservationId: string, laptopId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const reservationsSubscription = supabase
      .channel('reservations_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations'
      }, () => {
        fetchReservations();
      })
      .subscribe();

    const assignmentsSubscription = supabase
      .channel('assignments_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'laptop_assignments'
      }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reservationsSubscription);
      supabase.removeChannel(assignmentsSubscription);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          laptop_assignments (
            laptop_id
          )
        `)
        .order('created_at', { ascending: false });

      if (reservationsError) throw reservationsError;

      const formattedReservations: Reservation[] = reservationsData.map(reservation => ({
        id: reservation.id,
        startDate: reservation.start_date,
        startTime: reservation.start_time,
        endDate: reservation.end_date,
        endTime: reservation.end_time,
        quantity: reservation.quantity,
        assignedLaptops: reservation.laptop_assignments.map((a: any) => a.laptop_id),
        description: reservation.description,
        status: reservation.status,
        processedDate: reservation.processed_date,
        reason: reservation.reason,
        contactName: reservation.contact_name,
        contactEmail: reservation.contact_email,
        contactPhone: reservation.contact_phone
      }));

      setReservations(formattedReservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status,
          processed_date: new Date().toISOString(),
          reason
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the reservation status');
      throw err;
    }
  };

  const updateReservationDescription = async (id: string, description: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('reservations')
        .update({ description })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the reservation description');
      throw err;
    }
  };

  const assignLaptop = async (reservationId: string, laptopId: string) => {
    try {
      setError(null);

      // Check if the assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('laptop_assignments')
        .select('*')
        .match({
          reservation_id: reservationId,
          laptop_id: laptopId
        });

      if (checkError) throw checkError;

      // If the assignment already exists, skip the insertion
      if (existingAssignment && existingAssignment.length > 0) {
        return;
      }

      // If the assignment doesn't exist, create it
      const { error: assignError } = await supabase
        .from('laptop_assignments')
        .insert({
          reservation_id: reservationId,
          laptop_id: laptopId
        });

      if (assignError) throw assignError;

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while assigning the laptop');
      throw err;
    }
  };

  const unassignLaptop = async (reservationId: string, laptopId: string) => {
    try {
      setError(null);
      const { error: unassignError } = await supabase
        .from('laptop_assignments')
        .delete()
        .match({
          reservation_id: reservationId,
          laptop_id: laptopId
        });

      if (unassignError) throw unassignError;

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while unassigning the laptop');
      throw err;
    }
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations,
      updateReservationStatus,
      updateReservationDescription,
      assignLaptop,
      unassignLaptop,
      isLoading,
      error
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}