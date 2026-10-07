export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  name: string;
  email: string;
}
export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface JwtPayload {
  nameid: string;
  role: string;
  exp: number;
}
