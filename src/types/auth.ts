export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

/** Shape returned by POST /auth/login and POST /auth/register */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
