export interface AuthResponse {
    token: string;
    role: string;
}

export interface AuthRequest {
    email: string;
    password?: string;
}