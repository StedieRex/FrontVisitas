export interface AuthRequest {
  email: string;
  password: string;
}

// Representa el objeto de usuario devuelto por el backend dentro de data.user
export interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Representa la propiedad "data" completa de la respuesta de login
export interface AuthData {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserData;
}

// Representa la estructura global de la respuesta del backend
export interface ApiResponse<T> {
  code: number;
  data: T;
  htmlMessage: string;
  message: string;
  stack: any[];
  status: string;
}