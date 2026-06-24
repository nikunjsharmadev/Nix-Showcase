interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: "customer" | "employee" | "admin";
  varificationLink?: string;
}

export interface CreateRequest extends IUser {
  password: string;
}

export interface UpdateRequest {}

export interface DeleteRequest {}

export interface UserResponse extends IUser {
  id: string;
}
