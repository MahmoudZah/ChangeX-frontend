export const ROLES = {
  Admin: 'Admin',
  UserAdmin: 'UserAdmin',
  User: 'User',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PAGE_SIZE = 8;

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STORAGE_KEYS = {
  token: 'changex.token',
  user: 'changex.user',
  theme: 'changex.theme',
} as const;
