import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token);
}
