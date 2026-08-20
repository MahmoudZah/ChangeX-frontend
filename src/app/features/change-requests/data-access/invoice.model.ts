export interface Invoice {
  id: string;
  crId: string;
  crid?: string;
  crCode?: string;
  amount?: number;
  cost?: number;
  status?: string;
  state?: 'Open' | 'Paid' | 'Overdue';
  dueDate?: string;
  createdAt?: string;
}

export interface InvoiceDto {
  crid: string;
  cost: number;
}
