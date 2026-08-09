'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { logError } from '@/utils/logError';
import { ApiError } from '@/utils/errors';
import { Loader2, ShieldCheck, Zap, BarChart3, Target, MessageCircleCheck, AlertTriangle, Wallet } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const initialError = !token ? 'Token de verificação não encontrado na URL.' : '';
    const initialStatus = !token ? 'error' : 'loading';

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialStatus);
    const [errorMessage, setErrorMessage] = useState(initialError);

    useEffect(() => {
        if (!token) return;

        const verifyToken = async () => {
            try {
                await apiClient('/api/auth/verify-email', {
                    data: { token }
                });
                setStatus('success');
                toast.success('Sua conta foi ativada com sucesso!');
            } catch (err: unknown) {
                logError('VerifyEmail', err);
                setStatus('error');
                if (err instanceof ApiError) {
                    setErrorMessage(err.message);
                } else {
                    setErrorMessage('Token de verificação inválido ou expirado.');
                }
            }
        };

        verifyToken();
    }, [token]);

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

                        <h1 className="text-2xl md:text-[26px] font-bold leading-snug tracking-tight max-w-[260px] mt-10">
                            Ativação de Conta Segura.
                        </h1>

                        <p className="text-sm text-white/85 leading-relaxed max-w-[250px] mt-6 mb-1">
                            Confirme seu e-mail para ter acesso completo ao controle financeiro.
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
                
                <div className="p-8 md:p-10 flex flex-col justify-start bg-white">
                    <div className="w-[30px] h-[30px] mb-6 opacity-0 select-none pointer-events-none"></div>

                    {status === 'loading' ? (
                        <div className="text-center space-y-6 mt-2">
                            <div className="flex items-center justify-center">
                                <Loader2 className="w-16 h-16 text-[#1B7A4D] animate-spin" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#14181A]">Ativando sua conta...</h2>
                                <p className="text-sm text-[#6B7570] leading-relaxed max-w-[300px] mx-auto">
                                    Por favor, aguarde alguns instantes enquanto validamos seu código de ativação.
                                </p>
                            </div>
                        </div>
                    ) : status === 'success' ? (
                        <div className="text-center space-y-6 mt-2">
                            <div className="flex items-center justify-center">
                                <MessageCircleCheck className="w-16 h-16 text-[#1B7A4D]" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#14181A]">Conta Ativada!</h2>
                                <p className="text-sm text-[#6B7570] leading-relaxed max-w-[300px] mx-auto">
                                    Seu e-mail foi verificado com sucesso. Você já pode acessar a plataforma com suas credenciais.
                                </p>
                            </div>
                            <div className="pt-6">
                                <button onClick={() => router.push('/login')} className="w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] hover:brightness-105 text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] transition shadow-lg shadow-[#0F5A3A]/20">
                                    Ir para o Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 mt-2">
                            <div className="flex items-center justify-center">
                                <AlertTriangle className="w-16 h-16 text-amber-500" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#14181A]">Falha na Ativação</h2>
                                <p className="text-sm text-[#6B7570] leading-relaxed max-w-[300px] mx-auto">
                                    {errorMessage || 'Não foi possível ativar sua conta. O link pode ser inválido ou já ter expirado.'}
                                </p>
                            </div>
                            <div className="pt-3">
                                <Link href="/login" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#38B37D] to-[#1B7A4D] text-white font-bold py-3.5 px-5 rounded-full text-[14.5px] shadow-lg shadow-[#0F5A3A]/20">
                                    Ir para a página de Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F1F2ED]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1B7A4D]" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
