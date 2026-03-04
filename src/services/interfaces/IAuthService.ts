export interface IAuthService {
  login(email: string, password: string): Promise<any>;
  register(email: string, password: string): Promise<any>;
  logout(): Promise<void>;
  observeAuthState(callback: (user: any | null) => void): () => void;
}
