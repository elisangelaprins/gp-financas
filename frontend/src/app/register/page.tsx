'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, User, Sparkles, Loader2, ShieldCheck, Zap, BarChart3, Target, Eye, EyeClosed, CheckCircle2, XCircle, Circle, Wallet } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[@$!%*?&#]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasCapital && hasSpecial;
  const isTypingPassword = password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!isPasswordValid) {
      toast.error(
        'A senha deve ter no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: displayName || fullName, email, password });
      toast.success(`Conta criada com sucesso! Seja bem-vindo(a), ${displayName || fullName}.`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Erro ao criar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusIcon = (isMet: boolean) => {
    if (isMet) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A4D] shrink-0" />;
    }
    if (isTypingPassword) {
      return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    return <Circle className="w-3.5 h-3.5 opacity-40 text-[#8C948F] shrink-0" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#F1F2ED]">
      <div className="w-full max-w-[860px] min-h-[620px] bg-white rounded-[24px] shadow-[0_30px_70px_rgba(15,90,58,0.16)] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-200/60">

        <div className="relative bg-gradient-to-br from-[#38B37D] via-[#1B7A4D] to-[#0F5A3A] text-white p-9 md:p-11 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-[30px] h-[30px] rounded-lg bg-white/15 border border-white/30 flex items-center justify-center text-white">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-sans font-bold text-sm tracking-wide text-white">GP Finanças</span>
            </div>

            <h1 className="text-3xl md:text-[30px] font-bold leading-tight mb-3 tracking-tight max-w-[260px]">
              Tenha o controle total das suas finanças.
            </h1>
            <p className="text-sm text-white/85 leading-relaxed max-w-[250px] mt-12">
              Crie sua conta em menos de 1 minuto e acompanhe suas receitas, despesas e orçamentos em um só lugar.
            </p>

            <div className="flex items-center gap-2.5 mt-10">
              <div
                className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white/30 hover:scale-110 cursor-pointer"
                title="Conexão Segura HTTP-Only"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>

              <div
                className="w-9 h-9 rounded-full bg-[#38B37D]/30 border border-white/25 flex items-center justify-center text-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white/30 hover:scale-110 cursor-pointer"
                title="Exportação de Relatórios PDF & CSV"
              >
                <Zap className="w-4.5 h-4.5" />
              </div>

              <div
                className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white/30 hover:scale-110 cursor-pointer"
                title="Dashboard Analítico em Tempo Real"
              >
                <BarChart3 className="w-4.5 h-4.5" />
              </div>

              <div
                className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white/30 hover:scale-110 cursor-pointer"
                title="Gestão de Metas e Orçamentos"
              >
                <Target className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {/* Rodapé Inspiracional Preenchendo o Painel Verde */}
          <div className="relative z-10 pt-6 border-t border-white/15">
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              Transforme sua relação com o dinheiro hoje mesmo.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-bold tracking-tight text-[#14181A] mb-1">
            Criar conta
          </h2>
          <p className="text-sm text-[#6B7570] mb-6">
            Preencha seus dados para começar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome completo"
                  autoComplete="name"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Sparkles className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Como gostaria de ser chamado(a)?"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  autoComplete="email"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
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
                  autoComplete="new-password"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
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

            {/* Checklist Dinâmico com Texto Neutro (Apenas o Ícone Muda de Cor) */}
            <div className="py-2 px-1 space-y-2 text-xs text-[#6B7570]">
              <div className="flex items-center gap-2">
                {renderStatusIcon(hasNumber)}
                <span>Pelo menos um número (0-9)</span>
              </div>

              <div className="flex items-center gap-2">
                {renderStatusIcon(hasCapital)}
                <span>Pelo menos uma letra maiúscula (A-Z)</span>
              </div>

              <div className="flex items-center gap-2">
                {renderStatusIcon(hasSpecial)}
                <span>Pelo menos um caractere especial (! @ # $ % & *)</span>
              </div>

              <div className="flex items-center gap-2">
                {renderStatusIcon(hasMinLength)}
                <span>No mínimo 8 caracteres</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar senha"
                  autoComplete="new-password"
                  className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-[#6B7570] hover:text-[#14181A] transition focus:outline-none p-1 rounded-md"
                  title={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPassword ? (
                    <Eye className="w-4 h-4 text-[#1B7A4D]" />
                  ) : (
                    <EyeClosed className="w-4 h-4 text-[#6B7570]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition duration-150 transform active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg shadow-[#0F5A3A]/20 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Criando sua conta...</span>
                </>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B7570] mt-4">
            <span>Já tem uma conta?</span>
            <Link href="/login" className="text-[#1B7A4D] hover:underline font-semibold transition">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
