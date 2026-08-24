export type ProjectState = 'Active' | 'Completed' | 'Canceled';

export interface ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  scope: string;
  clientID: string;
  client: unknown | null;
  state: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  scope: string;
  clientId: string;
  clientName: string;
  state: ProjectState;
}

export interface ProjectDto {
  name: string;
  description: string;
  scope: string;
  clientID: string;
  state: number;
}
