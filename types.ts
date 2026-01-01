
export interface TimeEntry {
  project: string;
  client: string;
  description: string;
  task: string;
  user: string;
  email: string;
  tags: string;
  billable: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: string;
  durationDecimal: number;
  billableRate: number;
  billableAmount: number;
  currency: string;
}

export type InvoiceTemplate = 'modern' | 'classic' | 'bold';

export interface InvoiceDetails {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  clientName: string;
  clientAddress: string;
  notes: string;
  taxRate: number;
  currency: string;
  hourlyRate: number;
  logoUrl?: string;
  showProjectSummary: boolean;
  template: InvoiceTemplate;
}

export interface AggregatedItem {
  id: string;
  description: string;
  project: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface ContactMessage {
  id: string;
  subject: string;
  email: string;
  description: string;
  timestamp: string;
  status: 'new' | 'read';
}
