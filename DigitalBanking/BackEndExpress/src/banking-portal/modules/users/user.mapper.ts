import type { UserResponse } from "./user.interface.js";

export const toUserResponse = (user: any): UserResponse => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

export const toUserResponseList = (users: any[]): UserResponse[] => {
  return users.map(toUserResponse);
};
