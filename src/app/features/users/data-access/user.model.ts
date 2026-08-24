export interface UserAccountDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  systemRole: boolean;
  clientID: string;
  clientName: string;
}

export interface UserInClientDto {
  name: string;
  email: string;
  phoneNumber: string;
  systemRole: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  systemRole: boolean;
  clientId: string;
  company: string;
  accountType: 'System administrator' | 'Client account';
}

export interface ClientUser extends UserInClientDto {
  key: string;
}

export interface UserDto {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  systemRole: boolean;
  clientID: string;
}
