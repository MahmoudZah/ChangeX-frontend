export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Client';
  clientId: string | null;
  company: string;
}
