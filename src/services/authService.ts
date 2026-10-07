export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

const AUTH_KEY = 'irmas_restaurante_auth_session';

export const AuthService = {
  // Normalize string by removing accents and lowercasing for tolerant matching
  normalize(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  login(emailInput: string, passwordInput: string): { success: boolean; message?: string; user?: AuthUser } {
    const rawEmail = emailInput.trim();
    const cleanEmail = this.normalize(rawEmail);
    const validEmailTarget = 'irmas@irmas.com.br'; // normalized version of irmãs@irmãs.com.br

    if (!cleanEmail || !passwordInput) {
      return { success: false, message: 'Por favor, informe o e-mail e a senha de acesso.' };
    }

    if (cleanEmail === validEmailTarget && passwordInput.trim() === '123456') {
      const user: AuthUser = {
        email: 'irmãs@irmãs.com.br',
        name: 'Clara & Helena (Irmãs)',
        role: 'Proprietárias & Cozinheiras',
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    return {
      success: false,
      message: 'E-mail ou senha incorretos. Utilize irmãs@irmãs.com.br e a senha 123456.',
    };
  },

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },
};
