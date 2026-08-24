export interface ClientResponseDto {
  id: string;
  name: string;
  email: string;
  description: string | null;
  address: string | null;
  contactInfo: string;
  defaultContactID: string | null;
  defaultContactName: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  description: string;
  address: string;
  contactInfo: string;
  defaultContactId: string | null;
  defaultContactName: string | null;
}

export interface ClientDto {
  name: string;
  email: string;
  description: string | null;
  address: string | null;
  contactInfo: string;
  defaultContactID: string | null;
}
