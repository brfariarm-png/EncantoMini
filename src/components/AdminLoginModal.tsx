import React, { useState } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { ENCANTO_LOGO } from '../assets/logo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor, informe o login e a senha.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Required credentials: login "encantomini", senha "1234"
      if (cleanUser === 'encantomini' && cleanPass === '1234') {
        setUsername('');
        setPassword('');
        setError('');
        setIsSubmitting(false);
        onSuccess();
      } else {
        setIsSubmitting(false);
        setError('Usuário ou senha incorretos. Tente novamente.');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Brand */}
        <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-pink-950 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-pink-400 mx-auto mb-3 shadow-lg flex items-center justify-center overflow-hidden">
            <img
              src={ENCANTO_LOGO}
              alt="Encanto Mini"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            <span>Acesso Restrito ao Lojista</span>
          </div>

          <h3 className="font-heading font-black text-xl text-white">
            Painel Administrativo
          </h3>
          <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
            Digite suas credenciais de proprietário para gerenciar pedidos, produtos e configurações.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Login / Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: encantomini"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 rounded-xl text-sm font-medium text-stone-900 transition-all outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 rounded-xl text-sm font-medium text-stone-900 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Entrar no Painel'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Voltar ao Cardápio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
