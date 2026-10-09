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

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeToken(token);
    // exp is in seconds; small skew so near-expiry still triggers logout
    return !exp || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
