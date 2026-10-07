import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ChefHat, ArrowRight } from 'lucide-react';
import { AuthService, AuthUser } from '../services/authService';
import sistersImg from '../assets/images/duas_irmas_restaurante_1791393415864.jpg';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Erro ao realizar login.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-stone-100/80 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background warm aesthetic elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Welcoming Sisters Illustration & Story */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-50 via-orange-50/60 to-stone-100 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-6">
              <ChefHat className="w-4 h-4 text-amber-700" />
              <span>Receitas & Tradição</span>
            </div>

            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-lg shadow-amber-900/10 border-4 border-white mb-6 group">
              <img
                src={sistersImg}
                alt="Duas irmãs proprietárias do restaurante"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-medium text-center drop-shadow">
                Clara & Helena
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display text-stone-900 font-bold tracking-tight text-center md:text-left">
              Restaurante das Irmãs
            </h1>
            <p className="mt-2 text-stone-600 text-sm leading-relaxed text-center md:text-left">
              Controle de estoque diário dos nossos pratos frescos, sobremesas caseiras e bebidas selecionadas.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-200/60">
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cozinha aberta • Acesso exclusivo das proprietárias</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-stone-900">
              Bem-vindas à Cozinha
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Digite seu e-mail e senha para gerenciar o estoque do restaurante.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="irmãs@irmãs.com.br"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-medium rounded-xl shadow-md shadow-orange-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
