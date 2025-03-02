export interface User {
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  name: string;
  email: string;
}
