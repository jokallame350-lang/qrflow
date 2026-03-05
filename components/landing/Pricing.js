'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    const plans = [
        {
            name: 'Starter', price: '$0', period: 'forever',
            desc: 'Perfect for testing and personal projects.',
            features: ['5 Dynamic QR Codes', 'Basic Scan Tracking', 'Standard Redirection', 'Email Support'],
            excluded: ['Custom Domains'],
            button: 'Get Started Free', popular: false,
        },
        {
            name: 'Pro', price: '$19', period: '/month',
            desc: 'Ideal for small businesses and marketers.',
            features: ['Unlimited Dynamic QR Codes', 'Advanced Analytics', 'Geographic Routing', 'Priority Support', 'Custom Branding'],
            excluded: [],
            button: 'Start 14-Day Trial', popular: true,
        },
        {
            name: 'Enterprise', price: '$99', period: '/month',
            desc: 'Dedicated power for large teams.',
            features: ['Unlimited QR Codes', 'API Access', 'SSO Authentication', 'Account Manager', 'Custom Domains'],
            excluded: [],
            button: 'Contact Sales', popular: false,
        },
    ];

    return (
        <section id="pricing" style={{ padding: '100px 0', background: '#0a0a1a' }}>
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
                                }}>Most Popular</div>
                            )}

                            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>{plan.name}</h3>
                            <p style={{ fontSize: 14, color: '#94A3B8', minHeight: 40, marginBottom: 24 }}>{plan.desc}</p>

                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                                <span style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>{plan.price}</span>
                                <span style={{ color: '#94A3B8', fontWeight: 500, marginBottom: 6 }}>{plan.period}</span>
                            </div>

                            <Link href="/login" style={{
                                display: 'block', textAlign: 'center', width: '100%',
                                padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
                                textDecoration: 'none', marginBottom: 32, transition: 'opacity 0.2s',
                                background: plan.popular ? 'linear-gradient(135deg, #6C63FF, #00D9FF)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            }}>{plan.button}</Link>

                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {plan.features.map((feat, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: '#CBD5E1' }}>
                                        <Check size={16} color="#10B981" /> {feat}
                                    </li>
                                ))}
                                {plan.excluded.map((feat, j) => (
                                    <li key={`ex-${j}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                                        <X size={16} color="#475569" /> {feat}
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
