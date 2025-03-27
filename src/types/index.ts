export interface Laptop {
  id: string;
  computerName: string;
  cpu: string;
  ram: string;
  gpu: string;
  softwareVersion: string;
  status: 'beschikbaar' | 'in behandeling' | 'gereserveerd' | 'Ingebruik' | 'Controleren' | 'storing';
  remarks: string[];
  problems: Problem[];
}

export interface Problem {
  id: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  resolverName?: string;
  status: 'open' | 'resolved';
  repairDetails?: string;
  dateReported: string;
  dateResolved?: string;
}

export interface User {
  id: string;
  role: 'admin' | 'helpdesk' | 'owner';
}