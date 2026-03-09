export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
