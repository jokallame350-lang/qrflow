'use client';

import Link from 'next/link';
import { QrCode, ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(10,10,26,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
        }}>
            <div style={{
                maxWidth: 1280, margin: '0 auto', padding: '0 24px',
                height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6C63FF, #00D9FF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(108,99,255,0.3)'
                    }}>
                        <QrCode size={20} color="white" />
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                        QR<span style={{ background: 'linear-gradient(90deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flow</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
                    <a href="#features" style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Features</a>
                    <a href="#how-it-works" style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>How it Works</a>
                </div>

                {/* Auth */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user ? (
                        <Link href="/dashboard" className="btn-primary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <LayoutDashboard size={18} /> Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '8px 16px', borderRadius: 10 }} className="hidden sm:block">
                                Log In
                            </Link>
                            <Link href="/login" className="btn-primary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                Get Started <ArrowRight size={16} />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
