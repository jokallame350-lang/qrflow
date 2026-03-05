'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Github, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.push('/dashboard');
            } else {
                setCheckingAuth(false);
            }
        });
    }, [router]);

    async function handleGithubLogin() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
        if (error) {
            console.error('Error logging in:', error.message);
            setLoading(false);
        }
    }

    if (checkingAuth) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0a0a1a'
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '4px solid #6C63FF', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a1a', padding: 24, position: 'relative', overflow: 'hidden'
        }}>
            {/* Background orbs */}
            <div style={{
                position: 'absolute', top: '20%', left: '25%', width: 400, height: 400,
                background: 'rgba(108,99,255,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '20%', right: '25%', width: 400, height: 400,
                background: 'rgba(0,217,255,0.08)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
            }} />

            <div className="glass" style={{
                borderRadius: 28, padding: 48, maxWidth: 440, width: '100%',
                position: 'relative', zIndex: 10,
                boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>

                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div className="animate-float-slow" style={{
                            width: 80, height: 80, borderRadius: 20,
                            background: 'linear-gradient(135deg, #6C63FF, #00D9FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(108,99,255,0.3)',
                        }}>
                            <QrCode size={40} color="white" />
                        </div>
                    </Link>

                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Welcome Back</h1>
                        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
                            Sign in with GitHub to manage your QR codes and analytics securely.
                        </p>
                    </div>

                    <button
                        onClick={handleGithubLogin}
                        disabled={loading}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', padding: '16px 24px', borderRadius: 16,
                            fontWeight: 700, fontSize: 16, cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        <Github size={20} />
                        {loading ? 'Authenticating...' : 'Continue with GitHub'}
                    </button>

                    <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
                        By continuing, you agree to QRFlow&apos;s Terms of Service and Privacy Policy.
                        <br />Secure authentication provided by Supabase.
                    </p>
                </div>
            </div>
        </div>
    );
}
