import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Laptop } from '../types';
import { supabase } from '../lib/supabase';

interface LaptopContextType {
  laptops: Laptop[];
  updateLaptop: (updatedLaptop: Laptop) => Promise<void>;
  deleteLaptop: (id: string) => Promise<void>;
  addLaptop: (laptop: Omit<Laptop, 'id' | 'remarks' | 'problems'>) => Promise<void>;
  checkAndUpdateLaptopStatuses: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LaptopContext = createContext<LaptopContextType | undefined>(undefined);

// Helper function to determine if a laptop is available
const isLaptopAvailable = (status: string): boolean => {
  return status === 'beschikbaar';
};

export function LaptopProvider({ children }: { children: ReactNode }) {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch laptops on mount
  useEffect(() => {
    fetchLaptops();
    const interval = setInterval(checkAndUpdateLaptopStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const laptopsSubscription = supabase
      .channel('laptops_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'laptops'
      }, () => {
        fetchLaptops();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(laptopsSubscription);
    };
  }, []);

  const fetchLaptops = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch laptops with their problems and remarks
      const { data: laptopsData, error: laptopsError } = await supabase
        .from('laptops')
        .select(`
          *,
          laptop_problems (*),
          laptop_remarks (*)
        `)
        .order('created_at', { ascending: true });

      if (laptopsError) throw laptopsError;

      const formattedLaptops: Laptop[] = laptopsData.map(laptop => ({
        id: laptop.id,
        computerName: laptop.computer_name,
        cpu: laptop.cpu,
        ram: laptop.ram,
        gpu: laptop.gpu,
        softwareVersion: laptop.software_version,
        status: laptop.status,
        remarks: laptop.laptop_remarks.map((r: any) => r.content),
        problems: laptop.laptop_problems.map((p: any) => ({
          id: p.id,
          description: p.description,
          reporterName: p.reporter_name,
          reporterEmail: p.reporter_email,
          resolverName: p.resolver_name,
          status: p.status,
          repairDetails: p.repair_details,
          dateReported: p.date_reported,
          dateResolved: p.date_resolved
        }))
      }));

      // Sort laptops: available ones first, unavailable ones last
      const sortedLaptops = formattedLaptops.sort((a, b) => {
        const aAvailable = isLaptopAvailable(a.status);
        const bAvailable = isLaptopAvailable(b.status);
        
        if (aAvailable === bAvailable) {
          // If both have same availability status, maintain original order
          return 0;
        }
        // Available laptops come first
        return aAvailable ? -1 : 1;
      });

      setLaptops(sortedLaptops);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching laptops');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLaptop = async (updatedLaptop: Laptop) => {
    try {
      setError(null);
      
      // Update laptop
      const { error: updateError } = await supabase
        .from('laptops')
        .update({
          computer_name: updatedLaptop.computerName,
          cpu: updatedLaptop.cpu,
          ram: updatedLaptop.ram,
          gpu: updatedLaptop.gpu,
          software_version: updatedLaptop.softwareVersion,
          status: updatedLaptop.status
        })
        .eq('id', updatedLaptop.id);

      if (updateError) throw updateError;

      // Update remarks
      await supabase
        .from('laptop_remarks')
        .delete()
        .eq('laptop_id', updatedLaptop.id);

      if (updatedLaptop.remarks.length > 0) {
        const { error: remarksError } = await supabase
          .from('laptop_remarks')
          .insert(
            updatedLaptop.remarks.map(content => ({
              laptop_id: updatedLaptop.id,
              content
            }))
          );

        if (remarksError) throw remarksError;
      }

      // Update problems
      const { error: problemsError } = await supabase
        .from('laptop_problems')
        .upsert(
          updatedLaptop.problems.map(p => ({
            id: p.id,
            laptop_id: updatedLaptop.id,
            description: p.description,
            reporter_name: p.reporterName,
            reporter_email: p.reporterEmail,
            resolver_name: p.resolverName,
            status: p.status,
            repair_details: p.repairDetails,
            date_reported: p.dateReported,
            date_resolved: p.dateResolved
          }))
        );

      if (problemsError) throw problemsError;

      await fetchLaptops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the laptop');
      throw err;
    }
  };

  const deleteLaptop = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('laptops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchLaptops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the laptop');
      throw err;
    }
  };

  const addLaptop = async (laptop: Omit<Laptop, 'id' | 'remarks' | 'problems'>) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('laptops')
        .insert({
          computer_name: laptop.computerName,
          cpu: laptop.cpu,
          ram: laptop.ram,
          gpu: laptop.gpu,
          software_version: laptop.softwareVersion,
          status: laptop.status
        });

      if (error) throw error;

      await fetchLaptops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the laptop');
      throw err;
    }
  };

  const checkAndUpdateLaptopStatuses = async () => {
    try {
      setError(null);
      const now = new Date();
      
      // Fetch all laptop assignments with their reservations
      const { data: assignments, error: assignmentsError } = await supabase
        .from('laptop_assignments')
        .select(`
          laptop_id,
          reservations (
            start_date,
            start_time,
            end_date,
            end_time,
            status
          )
        `)
        .eq('reservations.status', 'approved');

      if (assignmentsError) throw assignmentsError;

      // Update each laptop's status based on its assignments
      for (const laptop of laptops) {
        const laptopAssignments = assignments?.filter(a => a.laptop_id === laptop.id) || [];
        let newStatus = 'beschikbaar';

        for (const assignment of laptopAssignments) {
          const reservation = assignment.reservations;
          if (!reservation) continue;

          const startDate = new Date(`${reservation.start_date}T${reservation.start_time}`);
          const endDate = new Date(`${reservation.end_date}T${reservation.end_time}`);

          if (now >= startDate && now <= endDate) {
            newStatus = 'Ingebruik';
            break;
          } else if (now > endDate) {
            newStatus = 'Controleren';
          } else if (now < startDate && newStatus !== 'Ingebruik') {
            newStatus = 'gereserveerd';
          }
        }

        if (laptop.status !== newStatus) {
          await updateLaptop({ ...laptop, status: newStatus });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating laptop statuses');
    }
  };

  return (
    <LaptopContext.Provider value={{ 
      laptops, 
      updateLaptop, 
      deleteLaptop, 
      addLaptop, 
      checkAndUpdateLaptopStatuses,
      isLoading,
      error
    }}>
      {children}
    </LaptopContext.Provider>
  );
}

export function useLaptops() {
  const context = useContext(LaptopContext);
  if (context === undefined) {
    throw new Error('useLaptops must be used within a LaptopProvider');
  }
  return context;
}