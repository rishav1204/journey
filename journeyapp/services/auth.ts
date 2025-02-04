import api from './api';
import * as storage from '@/utils/storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', credentials);
  await storage.setToken(response.data.token);
  return response.data;
}

export async function register(data: RegisterData): Promise<void> {
  await api.post('/api/auth/sign-up', data);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  await api.post('/api/auth/reset-password', {
    email,
    otp,
    newPassword
  });
}

export async function logout(): Promise<void> {
  await storage.removeToken();
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  await api.post('/api/auth/verify-otp', {
    email,
    otp
  });
}

export async function resendOtp(email: string): Promise<void> {
  await api.post('/api/auth/send-otp', { email });
}