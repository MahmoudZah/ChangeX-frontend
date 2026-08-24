export interface Invoice {
  id: string;
  crId: string;
  crid?: string;
  crCode?: string;
  crName?: string;
  projectName?: string;
  clientName?: string;
  invoiceNumber?: string;
  amount?: number;
  cost?: number;
  status?: string;
  state?: 'Open' | 'Paid' | 'Overdue';
  dueDate?: string;
  createdAt?: string;
  paidAt?: string;
}

export interface InvoiceDto {
  crid: string;
  cost: number;
}
