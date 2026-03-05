'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import QRCodeLib from 'qrcode';
import { saveAs } from 'file-saver';
import {
    QrCode,
    ArrowLeft,
    Download,
    Link as LinkIcon,
    Wifi,
    Mail,
    MessageSquare,
    Type,
    User,
    Palette,
    Copy,
    Check,
    ChevronDown,
} from 'lucide-react';
import { generateId } from '@/lib/utils';
import { createQRCode } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const qrTypes = [
    { id: 'url', label: 'URL', icon: LinkIcon, placeholder: 'https://example.com' },
    { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter your text here...' },
    { id: 'wifi', label: 'WiFi', icon: Wifi, placeholder: '' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'hello@example.com' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: '+1234567890' },
    { id: 'vcard', label: 'Contact', icon: User, placeholder: '' },
];

export default function CreatePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [selectedType, setSelectedType] = useState('url');
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [fgColor, setFgColor] = useState('#6C63FF');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const canvasRef = useRef(null);

    // Auth & Load data
    useEffect(() => {
        // Check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
            setLoadingAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // WiFi specific fields
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiEncryption, setWifiEncryption] = useState('WPA');

    // vCard fields
    const [vcardName, setVcardName] = useState('');
    const [vcardPhone, setVcardPhone] = useState('');
    const [vcardEmail, setVcardEmail] = useState('');
    const [vcardOrg, setVcardOrg] = useState('');

    // Email fields
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSubject, setEmailSubject] = useState('');

    // SMS fields
    const [smsNumber, setSmsNumber] = useState('');
    const [smsMessage, setSmsMessage] = useState('');

    // Build content string based on type
    function buildContent() {
        switch (selectedType) {
            case 'url':
                return content || 'https://example.com';
            case 'text':
                return content || 'Hello World';
            case 'wifi':
                return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
            case 'email':
                return `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}`;
            case 'sms':
                return `smsto:${smsNumber}:${smsMessage}`;
            case 'vcard':
                return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`;
            default:
                return content;
        }
    }

    // Generate QR code
    useEffect(() => {
        const qrContent = buildContent();
        if (!qrContent) return;

        QRCodeLib.toDataURL(qrContent, {
            width: 512,
            margin: 2,
            color: {
                dark: fgColor,
                light: bgColor,
            },
            errorCorrectionLevel: 'H',
        })
            .then((url) => setQrDataUrl(url))
            .catch(() => { });
    }, [content, fgColor, bgColor, selectedType, wifiSSID, wifiPassword, wifiEncryption, emailAddress, emailSubject, smsNumber, smsMessage, vcardName, vcardPhone, vcardEmail, vcardOrg]);

    // Download QR as PNG
    function handleDownload() {
        if (!qrDataUrl) return;

        // Decode base64 data URL to binary
        const parts = qrDataUrl.split(',');
        const byteString = atob(parts[1]);
        const mimeType = parts[0].match(/:(.*?);/)[1];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeType });
        saveAs(blob, `qrflow-${name || 'qrcode'}.png`);
    }

    // Copy to clipboard
    async function handleCopy() {
        if (!qrDataUrl) return;
        try {
            const response = await fetch(qrDataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    // Save QR Code
    async function handleSave() {
        const qrData = {
            id: generateId(),
            name: name || `${selectedType.toUpperCase()} QR Code`,
            type: selectedType,
            content: buildContent(),
            shortCode: generateId().substring(0, 6),
            fgColor,
            bgColor,
            createdAt: new Date().toISOString(),
            scans: 0,
            status: 'active',
        };
        await createQRCode(qrData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    const currentType = qrTypes.find((t) => t.id === selectedType);

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] bg-grid">
            {/* Header */}
            <header className="glass border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm">Back</span>
                        </Link>
                        <div className="w-px h-6 bg-[var(--color-border)]" />
                        <div className="flex items-center gap-2">
                            <QrCode size={20} className="text-[var(--color-primary)]" />
                            <h1 className="text-lg font-bold text-white">Create QR Code</h1>
                        </div>
                    </div>
                    <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                        Dashboard →
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* QR Type Selection */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">QR Code Type</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {qrTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isActive = selectedType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${isActive
                                                ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)]'
                                                : 'glass-light hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white'
                                                }`}
                                        >
                                            <Icon size={22} />
                                            <span className="text-xs font-medium">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content Input */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Content</h2>

                            {/* Name field */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">QR Code Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="My QR Code"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Type-specific fields */}
                            {selectedType === 'url' && (
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">URL</label>
                                    <input
                                        type="url"
                                        className="input-field"
                                        placeholder="https://example.com"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedType === 'text' && (
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Text</label>
                                    <textarea
                                        className="input-field min-h-[120px] resize-y"
                                        placeholder="Enter your text here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedType === 'wifi' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Network Name (SSID)</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="MyWiFiNetwork"
                                            value={wifiSSID}
                                            onChange={(e) => setWifiSSID(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Password</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Password123"
                                            value={wifiPassword}
                                            onChange={(e) => setWifiPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Encryption</label>
                                        <select
                                            className="select-field"
                                            value={wifiEncryption}
                                            onChange={(e) => setWifiEncryption(e.target.value)}
                                        >
                                            <option value="WPA">WPA/WPA2</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">None</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {selectedType === 'email' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Email Address</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="hello@example.com"
                                            value={emailAddress}
                                            onChange={(e) => setEmailAddress(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Subject (optional)</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Hello from QRFlow"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedType === 'sms' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="+1234567890"
                                            value={smsNumber}
                                            onChange={(e) => setSmsNumber(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Message (optional)</label>
                                        <textarea
                                            className="input-field min-h-[80px] resize-y"
                                            placeholder="Your message here..."
                                            value={smsMessage}
                                            onChange={(e) => setSmsMessage(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedType === 'vcard' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Full Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="John Smith"
                                            value={vcardName}
                                            onChange={(e) => setVcardName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Phone</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="+1234567890"
                                            value={vcardPhone}
                                            onChange={(e) => setVcardPhone(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Email</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="john@example.com"
                                            value={vcardEmail}
                                            onChange={(e) => setVcardEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Organization</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Acme Inc."
                                            value={vcardOrg}
                                            onChange={(e) => setVcardOrg(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customization */}
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Palette size={16} className="text-[var(--color-accent-2)]" />
                                <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Customize</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-2 block">QR Code Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="input-field font-mono text-sm !w-28"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                        />
                                    </div>
                                    {/* Preset Colors */}
                                    <div className="flex gap-2 mt-3">
                                        {['#6C63FF', '#000000', '#10B981', '#EF4444', '#F59E0B', '#FF6BD6'].map((c) => (
                                            <button
                                                key={c}
                                                className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${fgColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                                                    }`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setFgColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-2 block">Background Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="input-field font-mono text-sm !w-28"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {['#FFFFFF', '#F8FAFC', '#0F0F23', '#FFF7ED', '#F0FDF4', '#FDF2F8'].map((c) => (
                                            <button
                                                key={c}
                                                className={`w-7 h-7 rounded-lg border border-white/20 transition-all hover:scale-110 ${bgColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                                                    }`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setBgColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-2">
                        <div className="glass rounded-2xl p-6 sticky top-24">
                            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Preview</h2>

                            {/* QR Preview */}
                            <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-light)] rounded-2xl p-8 flex items-center justify-center mb-6">
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="QR Code Preview"
                                        className="w-56 h-56 rounded-xl shadow-2xl transition-all hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-56 h-56 rounded-xl bg-white/5 flex items-center justify-center">
                                        <QrCode size={48} className="text-[var(--color-text-muted)]" />
                                    </div>
                                )}
                            </div>

                            {/* Name & Type */}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white">{name || 'Untitled QR Code'}</h3>
                                <span className="text-sm text-[var(--color-text-muted)] capitalize">{selectedType} QR Code</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleSave}
                                    className={`btn-primary w-full flex items-center justify-center gap-2 ${saved ? '!bg-[var(--color-success)]' : ''
                                        }`}
                                    disabled={saved}
                                >
                                    <span className="flex items-center gap-2">
                                        {saved ? <Check size={18} /> : <QrCode size={18} />}
                                        {saved ? 'Saved to Dashboard!' : 'Save QR Code'}
                                    </span>
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleDownload()}
                                        className="btn-secondary flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download size={16} />
                                        PNG
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="btn-secondary flex items-center justify-center gap-2 text-sm"
                                    >
                                        {copied ? <Check size={16} className="text-[var(--color-success)]" /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
