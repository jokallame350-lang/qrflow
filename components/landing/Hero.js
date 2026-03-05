'use client';

import Link from 'next/link';
import { ArrowRight, Link2, ScanLine, BarChart3, ShieldCheck } from 'lucide-react';

export default function Hero() {
    const pills = [
        { label: 'Dynamic Links', icon: Link2, color: '#6C63FF' },
        { label: 'Real-time Scans', icon: ScanLine, color: '#00D9FF' },
        { label: 'Advanced Analytics', icon: BarChart3, color: '#FF6BD6' },
        { label: 'Enterprise Security', icon: ShieldCheck, color: '#10B981' },
    ];

    return (
        <section style={{
            position: 'relative', paddingTop: 160, paddingBottom: 100,
            overflow: 'hidden', background: '#0a0a1a',
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'absolute', top: '15%', left: '20%', width: 500, height: 500,
                background: 'rgba(108,99,255,0.12)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '15%', width: 500, height: 500,
                background: 'rgba(0,217,255,0.10)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
            }} />

            {/* Grid overlay */}
            <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

            <div style={{
                position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto',
                padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                {/* Badge */}
                <div className="animate-slide-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '10px 20px', borderRadius: 50,
                    border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.08)',
                    color: '#8B84FF', fontSize: 13, fontWeight: 700, marginBottom: 40,
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D9FF' }} className="animate-ping-dot" />
                    QRFlow 1.0 — Now Live
                </div>

                {/* Headline */}
                <h1 className="animate-slide-up" style={{
                    fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 900, color: 'white',
                    letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 28,
                    maxWidth: 900
                }}>
                    The Ultimate Platform for{' '}
                    <span style={{
                        background: 'linear-gradient(90deg, #6C63FF, #00D9FF, #FF6BD6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(108,99,255,0.3))'
                    }}>
                        Dynamic QR Codes
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="animate-slide-up" style={{
                    fontSize: 'clamp(16px, 2vw, 22px)', color: '#94A3B8', fontWeight: 500,
                    maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.7,
                    animationDelay: '0.15s'
                }}>
                    Create, track, and manage all your QR codes from one powerful dashboard.
                    Change destinations on the fly without ever reprinting your codes.
                </p>

                {/* CTA Buttons */}
                <div className="animate-slide-up" style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16,
                    animationDelay: '0.25s'
                }}>
                    <Link href="/login" className="btn-primary" style={{ padding: '18px 40px', fontSize: 17 }}>
                        Start Free Trial <ArrowRight size={20} />
                    </Link>
                    <a href="#how-it-works" className="btn-secondary" style={{ padding: '18px 40px', fontSize: 17 }}>
                        See How It Works
                    </a>
                </div>

                {/* Feature Pills */}
                <div className="animate-slide-up" style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16,
                    marginTop: 72, animationDelay: '0.4s'
                }}>
                    {pills.map((pill, i) => {
                        const Icon = pill.icon;
                        return (
                            <div key={i} className="glass" style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 20px', borderRadius: 16,
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'default',
                            }}>
                                <Icon size={18} style={{ color: pill.color }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.02em' }}>{pill.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
