'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { joinWaitlist } from '@/lib/store';

export default function Pricing() {
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistStatus, setWaitlistStatus] = useState('idle'); // idle, loading, success, error
    const [waitlistError, setWaitlistError] = useState('');

    const handleJoinWaitlist = async (e) => {
        e.preventDefault();
        setWaitlistStatus('loading');
        setWaitlistError('');

        const result = await joinWaitlist(waitlistEmail);

        if (result.success) {
            setWaitlistStatus('success');
        } else {
            setWaitlistStatus('error');
            // Check for duplicate email error code (Supabase returns 23505 for unique violation)
            if (result.error.includes('duplicate key') || result.error.includes('23505')) {
                setWaitlistError('This email is already on the waitlist!');
            } else {
                setWaitlistError(result.error || 'Something went wrong. Please try again.');
            }
        }
    };

    const plans = [
        {
            name: 'Starter', price: '$0', period: 'forever',
            desc: 'Perfect for testing and personal projects.',
            features: ['5 Dynamic QR Codes', 'Basic Scan Tracking', 'Standard Redirection', 'Email Support'],
            excluded: ['Custom Domains'],
            button: 'Get Started Free', popular: false,
            action: 'free'
        },
        {
            name: 'Pro', price: '$19', period: '/month',
            desc: 'Ideal for small businesses and marketers.',
            features: ['Unlimited Dynamic QR Codes', 'Advanced Analytics', 'Geographic Routing', 'Priority Support', 'Custom Branding'],
            excluded: [],
            button: 'Join Pro Waitlist', popular: true,
            action: 'waitlist'
        },
        {
            name: 'Enterprise', price: '$99', period: '/month',
            desc: 'Dedicated power for large teams.',
            features: ['Unlimited QR Codes', 'API Access', 'SSO Authentication', 'Account Manager', 'Custom Domains'],
            excluded: [],
            button: 'Contact Sales', popular: false,
            action: 'waitlist'
        },
    ];

    return (
        <section id="pricing" style={{ padding: '100px 0', background: '#0a0a1a', position: 'relative' }}>
            {/* Waitlist Modal */}
            {isWaitlistOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)'
                }} onClick={() => setIsWaitlistOpen(false)}>
                    <div style={{
                        background: '#111122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
                        padding: 40, width: '100%', maxWidth: 440, position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(108, 99, 255, 0.25)'
                    }} onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setIsWaitlistOpen(false)}
                            style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        {waitlistStatus === 'success' ? (
                            <div style={{ textAlign: 'center', py: 20 }}>
                                <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 12 }}>You&apos;re on the list!</h3>
                                <p style={{ color: '#94A3B8', fontSize: 16 }}>We&apos;ll email you at <strong>{waitlistEmail}</strong> as soon as premium features are ready. Thank you for your early support!</p>
                                <button
                                    onClick={() => setIsWaitlistOpen(false)}
                                    style={{ marginTop: 32, width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,217,255,0.2))', padding: 12, borderRadius: 12 }}>
                                        <Sparkles size={24} color="#00D9FF" />
                                    </div>
                                    <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Early Access</h3>
                                </div>

                                <p style={{ color: '#94A3B8', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                                    Our premium features are currently in closed beta. Join the waitlist to get early access and a <strong>Lifetime 50% discount</strong> when we launch.
                                </p>

                                <form onSubmit={handleJoinWaitlist}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', color: 'white', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={waitlistEmail}
                                            onChange={e => setWaitlistEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontSize: 16
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={waitlistStatus === 'loading'}
                                        style={{
                                            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                                            background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', color: 'white',
                                            fontWeight: 700, fontSize: 16, cursor: waitlistStatus === 'loading' ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            opacity: waitlistStatus === 'loading' ? 0.7 : 1
                                        }}
                                    >
                                        {waitlistStatus === 'loading' ? 'Joining...' : 'Claim 50% Discount'}
                                        {waitlistStatus !== 'loading' && <ArrowRight size={18} />}
                                    </button>
                                </form>
                                {waitlistStatus === 'error' && (
                                    <p style={{ textAlign: 'center', fontSize: 13, color: '#EF4444', marginTop: 12, background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>
                                        {waitlistError}
                                    </p>
                                )}
                                <p style={{ textAlign: 'center', fontSize: 12, color: '#64748B', marginTop: 16 }}>No credit card required.</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 80px' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', marginBottom: 16 }}>
                        Simple, transparent pricing.
                    </h2>
                    <p style={{ fontSize: 18, color: '#94A3B8' }}>Start for free, upgrade when you need to scale.</p>
                </div>

                {/* Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 28, alignItems: 'stretch',
                }}>
                    {plans.map((plan, i) => (
                        <div key={i} style={{
                            background: plan.popular ? 'linear-gradient(180deg, #1a1a3e 0%, #0a0a1a 100%)' : 'var(--glass-bg)',
                            border: plan.popular ? '2px solid #6C63FF' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 28, padding: '40px 36px', position: 'relative',
                            transition: 'transform 0.3s ease',
                            boxShadow: plan.popular ? '0 0 60px rgba(108,99,255,0.15)' : 'none',
                        }}>
                            {/* Popular badge */}
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                                    background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', color: 'white',
                                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                                    padding: '6px 18px', borderRadius: 50,
                                    whiteSpace: 'nowrap'
                                }}>Most Popular</div>
                            )}

                            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>{plan.name}</h3>
                            <p style={{ fontSize: 14, color: '#94A3B8', minHeight: 40, marginBottom: 24 }}>{plan.desc}</p>

                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                                <span style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>{plan.price}</span>
                                <span style={{ color: '#94A3B8', fontWeight: 500, marginBottom: 6 }}>{plan.period}</span>
                            </div>

                            {plan.action === 'free' ? (
                                <Link href="/login" style={{
                                    display: 'block', textAlign: 'center', width: '100%',
                                    padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
                                    textDecoration: 'none', marginBottom: 32, transition: 'opacity 0.2s',
                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}>{plan.button}</Link>
                            ) : (
                                <button
                                    onClick={() => setIsWaitlistOpen(true)}
                                    style={{
                                        display: 'block', textAlign: 'center', width: '100%',
                                        padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
                                        cursor: 'pointer', marginBottom: 32, transition: 'all 0.2s',
                                        background: plan.popular ? 'linear-gradient(135deg, #6C63FF, #00D9FF)' : 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {plan.button}
                                </button>
                            )}

                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: 0 }}>
                                {plan.features.map((feat, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, fontWeight: 500, color: '#CBD5E1' }}>
                                        <Check size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                                {plan.excluded.map((feat, j) => (
                                    <li key={`ex-${j}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                                        <X size={16} color="#475569" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
