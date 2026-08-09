'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { logError } from "@/utils/logError";
import { ApiError } from "@/utils/errors";
import { Lock, Loader2, ShieldCheck, Zap, BarChart3, Target, Eye, EyeClosed, CheckCircle2, XCircle, Circle, Wallet, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';


function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || searchParams.get('resetToken') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const hasMinLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasCapital = /[A-Z]/.test(newPassword);
    const hasSpecial = /[@$!%*?&#]/.test(newPassword);
    const isPasswordValid = hasMinLength && hasNumber && hasCapital && hasSpecial;
    const isTypingPassword = newPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Token de redefinição não encontrado. Solicite um novo link.');
            return;
        };

        if (!newPassword || !confirmPassword) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        };

        if (!isPasswordValid) {
            toast.error('A senha não atende a todos os requisitos de segurança, verifique e tente novamente.');
            return;
        };

        if (newPassword !== confirmPassword) {
            toast.error('As senhas devem ser iguais. Verifique e tente novamente.')
            return;
        };

        setIsSubmitting(true);

        try {
            await apiClient('/api/auth/reset-password', {
                data: { resetToken: token, newPassword }
            });

            toast.success('Sua senha foi redefinida com sucesso!');
            setIsSuccess(true);

        } catch (err: unknown) {
            logError('ResetPassword', err);

            if (err instanceof ApiError) {
                toast.error(`${err.message} Redirecionando para nova solicitação...`);
            } else {
                toast.error('O link pode ter expirado. Redirecionando para nova solicitação....');
            }

            setTimeout(() => {
                router.push('/forgot-password');
            }, 2500);

        } finally {
            setIsSubmitting(false);
        };

    };

    const renderStatusIcon = (isMet: boolean) => {
        if (isMet) {
            return <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A4D] shrink-0" />;
        };

        if (isTypingPassword) {
            return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
        };

        return <Circle className="w-3.5 h-3.5 opacity-40 text-[#8C948F] shrink-0" />;

    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-[#F1F2ED]">
            <div className="w-full max-w-[860px] min-h-[580px] bg-white rounded-[24px] shadow-[0_30px_70px_rgba(15,90,58,0.16)] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-200/60">
                <div className="relative bg-gradient-to-br from-[#38B37D] via-[#1B7A4D] to-[#0F5A3A] text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-[30px] h-[30px] rounded-lg bg-white/15 border border-white/30 flex items-center justify-center text-white">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-mono font-bold text-sm tracking-wider text-white">GP Finanças</span>
                        </div>
                        <h1 className="text-2xl md:text-[26px] font-bold leading-snug tracking-tight max-w-[260px] mt-10 ">
                            Crie uma nova senha segura.
                        </h1>

                        <p className="text-sm text-white/85 leading-relaxed max-w-[250px] mt-6 mb-1">
                            Escolha uma senha forte para proteger sua conta.
                        </p>
                        <div className="flex items-center gap-2.5 mt-4">
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

                    <div className="relative z-10 pt-6 border-t border-white/15">
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                            Controle financeiro simplificado.
                        </p>
                    </div>
                </div>


                <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                    {!token ? (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <AlertTriangle className="w-14 h-14 text-amber-500" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#14181A]">Link Inválido</h2>
                            <p className="text-sm text-[#6B7570] leading-relaxed">
                                O link de redefinição de senha não contém um token válido ou está incompleto.
                            </p>
                            <div className="pt-4">
                                <Link href="/forgot-password" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] text-white font-bold py-3 px-5 rounded-full text-sm shadow-lg shadow-[#0F5A3A]/20">
                                    Solicitar novo link
                                </Link>
                            </div>
                        </div>
                    ) : isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <CheckCircle2 className="w-16 h-16 text-[#1B7A4D]" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#14181A]">Senha Redefinida!</h2>
                            <p className="text-sm text-[#6B7570] leading-relaxed">
                                Sua senha foi alterada com sucesso. Agora você pode acessar sua conta com as novas credenciais.
                            </p>
                            <div className="pt-4">
                                <button onClick={() => router.push('/login')} className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition shadow-lg shadow-[#0F5A3A]/20">
                                    Ir para o Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2.5 mb-6">
                                <KeyRound className="w-6 h-6 text-[#1B7A4D]" strokeWidth={1.5} />
                                <span className="text-xs font-semibold tracking-wide text-[#1B7A4D]">REDEFINIR SENHA</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#14181A] mt-4 mb-4">
                                Crie sua nova senha
                            </h2>
                            <p className="text-sm text-[#6B7570] mb-6">
                                Preencha e confirme a sua nova senha abaixo.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <div className="relative flex items-center">
                                        <Lock className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nova senha"
                                            autoComplete="new-password"
                                            className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 text-[#6B7570] hover:text-[#14181A] transition focus:outline-none p-1 rounded-md">
                                            {showPassword ? <Eye className="w-4 h-4 text-[#1B7A4D]" /> : <EyeClosed className="w-4 h-4 text-[#6B7570]" />}
                                        </button>
                                    </div>
                                </div>

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
                                            placeholder="Confirmar nova senha"
                                            autoComplete="new-password"
                                            className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 text-[#6B7570] hover:text-[#14181A] transition focus:outline-none p-1 rounded-md">
                                            {showConfirmPassword ? <Eye className="w-4 h-4 text-[#1B7A4D]" /> : <EyeClosed className="w-4 h-4 text-[#6B7570]" />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition duration-150 transform active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg shadow-[#0F5A3A]/20 mt-6">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Redefinindo...</span>
                                        </>
                                    ) : (
                                        <span>Redefinir senha</span>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center justify-center mt-6">
                                <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7570] hover:text-[#1B7A4D] transition">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Voltar para o login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F1F2ED]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1B7A4D]" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
