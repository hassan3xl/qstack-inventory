export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
  avatar: string | null;
  phone: string;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
  user: User;
}
