export interface Invoice {
  id: string;
  crId: string;
  crCode: string;
  amount: number;
  dueDate: string;
  state: 'Open' | 'Paid' | 'Overdue';
}
