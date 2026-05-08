export type RegisterData = {
  nom: string;
  prenom: string;
  mail: string;
  password: string;
  confirmation: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type UpdateUserData = {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
};