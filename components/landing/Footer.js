'use client';

import { QrCode } from 'lucide-react';

export default function Footer() {
    const columns = [
        { title: 'Product', links: ['Dynamic QR', 'Analytics & Data', 'Integrations', 'API Docs'] },
        { title: 'Resources', links: ['Help Center', 'Blog', 'Best Practices', 'Community'] },
        { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'] },
    ];

    return (
        <footer style={{
            background: '#050510', borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 80, paddingBottom: 40,
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 48, marginBottom: 64,
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'linear-gradient(135deg, #6C63FF, #00D9FF)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <QrCode size={16} color="white" />
                            </div>
                            <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>QRFlow</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', maxWidth: 260, lineHeight: 1.7 }}>
                            The enterprise SaaS protocol for linking the offline world to high-performing digital campaigns.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {columns.map((col, i) => (
                        <div key={i}>
                            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{col.title}</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#8B84FF'}
                                            onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{
                    paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, fontSize: 12, color: '#475569',
                }}>
                    <p>© {new Date().getFullYear()} QRFlow Inc. All rights reserved.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                        System Status: All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
