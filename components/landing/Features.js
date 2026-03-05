'use client';

import { Zap, Target, Globe2, Edit3, Smartphone, BarChart } from 'lucide-react';

export default function Features() {
    const features = [
        { icon: Edit3, title: 'Change Destination Anytime', desc: 'Update the URL your QR code points to dynamically. Never worry about reprinting marketing materials.' },
        { icon: BarChart, title: 'In-Depth Scan Analytics', desc: 'Track exactly when, where, and how your codes are scanned. Monitor device types, locations, and unique hits.' },
        { icon: Smartphone, title: 'Mobile Optimized', desc: 'Deliver lightning-fast, responsive redirect journeys for end-users scanning from any smartphone.' },
        { icon: Zap, title: 'Instant Generation', desc: 'Create WiFi, SMS, Email, URL, or vCard QR codes in seconds. Customize colors and error correction.' },
        { icon: Target, title: 'Marketing Campaigns', desc: 'Run multiple marketing campaigns simultaneously. Group your QR codes and measure ROI seamlessly.' },
        { icon: Globe2, title: 'Global CDN Routing', desc: 'High-speed redirection server network ensures minimal latency, redirecting your users globally in milliseconds.' },
    ];

    return (
        <section id="features" style={{ padding: '100px 0', background: '#0a0a1a', position: 'relative' }}>
            {/* Gradient bg */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(180deg, #0a0a1a 0%, rgba(18,18,42,0.3) 50%, #0a0a1a 100%)'
            }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                {/* Section Header */}
                <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 80px' }}>
                    <span style={{ color: '#00D9FF', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
                        Powerful Features
                    </span>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', marginBottom: 20, lineHeight: 1.15 }}>
                        Everything you need to master the scan limit.
                    </h2>
                    <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7 }}>
                        QRFlow provides all the enterprise features in a beautifully simple interface.
                    </p>
                </div>

                {/* Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 28,
                }}>
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <div key={i} className="feature-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16,
                                    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 24,
                                }}>
                                    <Icon size={24} color="#8B84FF" />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 12 }}>{feat.title}</h3>
                                <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7 }}>{feat.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
