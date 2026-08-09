'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ShieldCheck, Zap, BarChart3, Target, Eye, EyeClosed, Wallet } from 'lucide-react';
import { logError } from '@/utils/logError';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {

      await login({ email, password });

      toast.success('Login realizado com sucesso!');

      router.push('/dashboard');

    } catch (err: unknown) {

      logError('Login', err);

      const error = err as Error;

      toast.error(error.message || 'E-mail ou senha incorretos.');

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#F1F2ED]">
      <div className="w-full max-w-[860px] min-h-[560px] bg-white rounded-[24px] shadow-[0_30px_70px_rgba(15,90,58,0.16)] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-200/60">
        <div className="relative bg-gradient-to-br from-[#38B37D] via-[#1B7A4D] to-[#0F5A3A] text-white p-9 md:p-11 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-14">
              <div className="w-[30px] h-[30px] rounded-lg bg-white/15 border border-white/30 flex items-center justify-center font-mono font-semibold text-xs text-white">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono font-bold text-sm tracking-wider text-white">GP Finanças</span>
            </div>

            <h1 className="text-3xl md:text-[30px] font-bold leading-tight mb-3 tracking-tight max-w-[260px]">
              Que bom te ver de novo.
            </h1>
            <p className="text-sm text-white/85 leading-relaxed max-w-[250px]">
              Entre com sua conta para continuar acompanhando suas receitas, despesas e orçamentos.
            </p>

            <div className="flex items-center gap-2.5 mt-8">
              {[
                { Icon: ShieldCheck, title: 'Conexão Segura HTTP-Only' },
                { Icon: Zap, title: 'Exportação de Relatórios PDF & CSV' },
                { Icon: BarChart3, title: 'Dashboard Analítico em Tempo Real' },
                { Icon: Target, title: 'Gestão de Metas e Orçamentos' },
              ].map(({ Icon, title }, i) => (
                <div key={i} title={title} className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white/30 hover:scale-110 cursor-pointer">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10" />
        </div>

        <div className="p-9 md:p-12 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-bold tracking-tight text-[#14181A] mb-1">
            Bem-vindo(a)
          </h2>
          <p className="text-sm text-[#6B7570] mb-7">
            Acesse seu painel financeiro.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Usuário ou e-mail"
                  autoComplete="email"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete="current-password"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-10 py-3 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#6B7570] hover:text-[#14181A] transition focus:outline-none p-1 rounded-md"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4 text-[#1B7A4D]" />
                  ) : (
                    <EyeClosed className="w-4 h-4 text-[#6B7570]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 pb-2">
              <label className="flex items-center gap-2 text-[#6B7570] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#1B7A4D] rounded cursor-pointer"
                />
                <span>Lembrar-me</span>
              </label>

              <Link href="/forgot-password" className="text-[#1B7A4D] hover:underline font-semibold transition">
                Esqueci a senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition duration-150 transform active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg shadow-[#0F5A3A]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Entrando no painel...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B7570] mt-6">
            <span>Novo por aqui?</span>
            <Link href="/register" className="text-[#1B7A4D] hover:underline font-semibold transition">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}