import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Interface voor een adviesaanvraag
export interface Advice {
  id: string;
  type: string;
  description: string;
  requirements: string[];
  additionalNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  notedBy: string;
}

// Context interface voor adviezen
interface AdviceContextType {
  adviceRequests: Advice[];
  addAdvice: (advice: Omit<Advice, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateAdviceStatus: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AdviceContext = createContext<AdviceContextType | undefined>(undefined);

export function AdviceProvider({ children }: { children: ReactNode }) {
  const [adviceRequests, setAdviceRequests] = useState<Advice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch advice requests on mount
  useEffect(() => {
    fetchAdviceRequests();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const adviceSubscription = supabase
      .channel('advice_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'advice_requests'
      }, () => {
        fetchAdviceRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(adviceSubscription);
    };
  }, []);

  const fetchAdviceRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: adviceData, error: adviceError } = await supabase
        .from('advice_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (adviceError) throw adviceError;

      const formattedAdvice: Advice[] = adviceData.map(advice => ({
        id: advice.id,
        type: advice.type,
        description: advice.description,
        requirements: advice.requirements,
        additionalNotes: advice.additional_notes || '',
        status: advice.status,
        createdAt: advice.created_at,
        processedAt: advice.processed_at,
        rejectionReason: advice.rejection_reason,
        reporterName: advice.reporter_name,
        reporterEmail: advice.reporter_email,
        reporterPhone: advice.reporter_phone,
        notedBy: advice.noted_by
      }));

      setAdviceRequests(formattedAdvice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching advice requests');
    } finally {
      setIsLoading(false);
    }
  };

  const addAdvice = async (newAdvice: Omit<Advice, 'id' | 'status' | 'createdAt'>) => {
    try {
      setError(null);
      const { error: insertError } = await supabase
        .from('advice_requests')
        .insert({
          type: newAdvice.type,
          description: newAdvice.description,
          requirements: newAdvice.requirements,
          additional_notes: newAdvice.additionalNotes,
          status: 'pending',
          reporter_name: newAdvice.reporterName,
          reporter_email: newAdvice.reporterEmail,
          reporter_phone: newAdvice.reporterPhone,
          noted_by: newAdvice.notedBy
        });

      if (insertError) throw insertError;

      await fetchAdviceRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the advice request');
      throw err;
    }
  };

  const updateAdviceStatus = async (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('advice_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchAdviceRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the advice status');
      throw err;
    }
  };

  return (
    <AdviceContext.Provider value={{
      adviceRequests,
      addAdvice,
      updateAdviceStatus,
      isLoading,
      error
    }}>
      {children}
    </AdviceContext.Provider>
  );
}

export function useAdvice() {
  const context = useContext(AdviceContext);
  if (!context) {
    throw new Error('useAdvice must be used within an AdviceProvider');
  }
  return context;
}