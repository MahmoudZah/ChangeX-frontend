export interface ClientContactDto {
  name: string;
  email: string;
  phoneNumber: string;
  systemRole: boolean;
}

export interface ClientResponseDto {
  id: string;
  name: string;
  email: string;
  description: string | null;
  address: string | null;
  contactInfo: string;
  defaultContactID: string | null;
  defaultContact: ClientContactDto | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  description: string;
  address: string;
  contactInfo: string;
  defaultContactId: string | null;
  defaultContact: ClientContactDto | null;
}

export interface ClientDto {
  name: string;
  email: string;
  description: string | null;
  address: string | null;
  contactInfo: string;
  defaultContactID: string | null;
}
