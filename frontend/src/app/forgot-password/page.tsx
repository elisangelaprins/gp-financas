'use client';

import { useState } from "react";
import Link from "next/link";
import { apiClient } from '@/lib/api';
import { toast } from "sonner";
import { Mail, Loader2, ShieldCheck, Zap, BarChart3, Target, ArrowLeft, Wallet, Lock, MailCheck, } from 'lucide-react';
import { logError } from "@/utils/logError";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;
        setIsSubmitting(true);

        try {

            await apiClient('/api/auth/forgot-password', { data: { email } });

            toast.success('Se o e-mail informado estiver cadastrado em nosso sistema, enviaremos o link de redefinição em alguns instantes. Verifique sua caixa de entrada e a pasta de spam');
            setIsSubmitted(true);

        } catch (err: unknown) {

            logError('ForgotPassword', err);

            toast.error('Não foi possível processar a solicitação no momento. Tente novamente mais tarde.')

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
                            <div className="w-[30px] h-[30px] rounded-lg bg-white/15 border border-white/30 flex items-center justify-center text-white">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-mono font-bold text-sm tracking-wider text-white">GP Finanças</span>
                        </div>
                        <h1 className="text-3xl md:text-[26px] font-bold leading-tight mb-3 tracking-tight max-w-[260px]">Recupere o acesso à sua conta.</h1>
                        <p className="text-sm text-white/85 leading-relaxed max-w-[250px] mt-10">
                            Informe seu e-mail de cadastro para receber um link seguro de redefinição de senha.
                        </p>

                        <div className="flex items-center gap-2.5 mt-10">
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

                    <div className="relative z-10 pt-6 border-t border-white/15 mb-6">
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                            Organização financeira com você no controle.
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <div className=" flex items-center justify-center">
                                <MailCheck className="w-16 h-16 text-[#1B7A4D]" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#14181A] mb-6">Verifique seu e-mail</h2>
                            <p className="text-sm text-[#6B7570] leading-relaxed">
                                Se o e-mail informado estiver cadastrado, você receberá o link de redefinição em alguns instantes.
                            </p>
                            <div className="pt-4 mb-16">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B7A4D] hover:underline">
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar para o login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-[#1B7A4D] " strokeWidth={1.5} />
                                </div>
                                <span className="text-xs tracking-wide text-[#1B7A4D]">REDEFINIÇÃO SEGURA</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#14181A] mt-12  mb-2">
                                Redefinir senha
                            </h2>
                            <p className="text-sm text-[#6B7570] mt-4 mb-4">
                                Digite seu e-mail para receber as instruções.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-1">
                                    <div className="relative flex items-center">
                                        <Mail className="w-4 h-4 absolute left-3.5 text-[#6B7570] pointer-events-none" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Seu e-mail de cadastro"
                                            autoComplete="email"
                                            className="w-full bg-[#FBFBFA] border border-[#E2E5DF] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#14181A] placeholder-[#A2A9A3] outline-none focus:border-[#1B7A4D] focus:ring-4 focus:ring-[#1B7A4D]/15 focus:bg-white transition duration-150"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition duration-150 transform active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg shadow-[#0F5A3A]/20 mt-10"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <span>Enviar</span>
                                    )}
                                </button>
                            </form>
                            <div className="flex items-center justify-center mt-10">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7570] hover:text-[#1B7A4D] transition"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Voltar para o login
                                </Link>
                            </div>
                            <div className="pt-4 mt-10 border-t border-[#E2E5DF]">
                                <div className="flex items-start gap-2.5 text-xs text-[#6B7570] leading-relaxed">
                                    <Lock className="w-4 h-4 text-[#6B7570] shrink-0 mt-0.5" />
                                    <p>
                                        Por segurança, o link enviado expira em <strong>10 minutos</strong>. Se não encontrar o e-mail, verifique também a caixa de spam.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}