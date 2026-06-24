export interface LoginRequest {
  email: string;
  passsword: string;
}
export interface User {
  id: string;
  name: string;
  role: string;
}
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
