export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
