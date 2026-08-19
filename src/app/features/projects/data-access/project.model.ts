export interface Project {
  id: string;
  name: string;
  description: string;
  scope: string;
  userId: string;
  clientId: string;
  state: 'Active' | 'Inactive';
  changeRequestCount: number;
  lastUpdated: string;
}
