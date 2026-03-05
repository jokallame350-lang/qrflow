'use client';

import { Sparkles, QrCode, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        { num: '01', icon: Sparkles, title: 'Create & Customize', desc: 'Paste your link, customize colors, and generate a dynamic QR code in one click.' },
        { num: '02', icon: QrCode, title: 'Print & Distribute', desc: 'Download high-res formats. Print on flyers, products, or display them digitally.' },
        { num: '03', icon: TrendingUp, title: 'Track & Update', desc: 'Change the destination link anytime while monitoring global scan analytics.' },
    ];

    return (
        <section id="how-it-works" style={{
            padding: '100px 0', background: '#0e0e24',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 64 }}>

                    {/* Left text */}
                    <div style={{ flex: '1 1 320px', minWidth: 280 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
                            How it works in{' '}
                            <span style={{
                                background: 'linear-gradient(90deg, #6C63FF, #00D9FF)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>3 simple steps</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.7, marginBottom: 32 }}>
                            Stop wasting money reprinting materials. Control the journey dynamically from your dashboard.
                        </p>
                        <a href="/login" className="btn-primary">Get Started Now</a>
                    </div>

                    {/* Steps */}
                    <div style={{ flex: '2 1 500px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={i} className="glass" style={{
                                    borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden',
                                    transition: 'transform 0.3s ease',
                                }}>
                                    <div style={{
                                        position: 'absolute', top: -8, right: 4,
                                        fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1,
                                    }}>{step.num}</div>
                                    <Icon size={32} color="#00D9FF" style={{ marginBottom: 20, position: 'relative', zIndex: 2 }} />
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10, position: 'relative', zIndex: 2 }}>{step.title}</h3>
                                    <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
