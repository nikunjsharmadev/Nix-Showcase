// TYPES
export type httpMethods = 'get' | 'post';
export enum AuthTab {
  Login = 'login',
  Register = 'register',
}
export type LoginRequest = {
  email: string;
  password: string;
};
export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptTerms: boolean;
};
export type ApiPayload = LoginRequest | RegisterRequest;
export type LoginResponse = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
};
export type TokenResponse = {
  user: LoginResponse;
};
