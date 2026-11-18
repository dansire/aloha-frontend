import { api } from '@/lib/apiClient'
import type {
  AuthResponse,
  LoginInput,
  PasswordInput,
  ProfileInput,
  RegisterInput,
  User,
} from '@/types'

export const authService = {
  login: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input).then((r) => r.data),

  register: (input: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', input).then((r) => r.data),

  /** Devuelve el usuario dueño del token actual (sirve para restaurar la sesión). */
  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (input: ProfileInput) => api.put<User>('/users/me', input).then((r) => r.data),

  changePassword: (input: PasswordInput) =>
    api.put<void>('/users/me/password', input).then(() => undefined),
}
