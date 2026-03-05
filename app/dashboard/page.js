'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCodeLib from 'qrcode';
import { supabase } from '@/lib/supabase';
import {
    QrCode,
    Plus,
    BarChart3,
    ScanLine,
    Activity,
    TrendingUp,
    Search,
    MoreVertical,
    Trash2,
    Download,
    Eye,
    Smartphone,
    Monitor,
    Tablet,
    Copy,
    Check,
    LogOut,
    User
} from 'lucide-react';
import { getQRCodes, getTotalStats, deleteQRCode as removeQR, getAnalytics } from '@/lib/store';
import { formatNumber, getTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [qrCodes, setQrCodes] = useState([]);
    const [stats, setStats] = useState({ totalQRCodes: 0, totalScans: 0, activeQRs: 0, avgScansPerQR: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQR, setSelectedQR] = useState(null);
    const [selectedAnalytics, setSelectedAnalytics] = useState([]);
    const [qrImages, setQrImages] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Auth & Load data
    useEffect(() => {
        // Check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
                loadData();
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

    async function loadData() {
        const codes = await getQRCodes();
        setQrCodes(codes);
        const dataStats = await getTotalStats();
        setStats(dataStats);

        // Generate QR images
        codes.forEach((qr) => {
            QRCodeLib.toDataURL(qr.content, {
                width: 200,
                margin: 1,
                color: { dark: qr.fgColor || '#000000', light: qr.bgColor || '#FFFFFF' },
                errorCorrectionLevel: 'H',
            }).then((url) => {
                setQrImages((prev) => ({ ...prev, [qr.id]: url }));
            });
        });
    }

    // Filter QR codes
    const filteredQRs = qrCodes.filter(
        (qr) =>
            qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            qr.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Delete QR
    async function handleDelete(id) {
        await removeQR(id);
        loadData();
        setActiveMenu(null);
        if (selectedQR?.id === id) setSelectedQR(null);
    }

    // Copy link
    function handleCopyLink(shortCode) {
        const urlToCopy = `${window.location.origin}/r/${shortCode}`;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(urlToCopy);
            setCopiedId(shortCode);
            setTimeout(() => setCopiedId(null), 2000);
        } else {
            // Fallback for non-HTTPS local development
            const textArea = document.createElement("textarea");
            textArea.value = urlToCopy;

            // Make it invisible but accessible for copying
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopiedId(shortCode);
                    setTimeout(() => setCopiedId(null), 2000);
                }
            } catch (err) {
                console.error('Failed to copy fallback', err);
            }

            document.body.removeChild(textArea);
        }
    }

    // Download QR
    function handleDownload(qr) {
        // Generate high resolution QR Code
        QRCodeLib.toDataURL(qr.content, {
            width: 1024,
            margin: 2,
            color: { dark: qr.fgColor || '#000000', light: qr.bgColor || '#FFFFFF' },
            errorCorrectionLevel: 'H',
        }).then((dataUrl) => {
            // Convert Base64 Data URL to Blob
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    // Create an object URL representing the Blob
                    const blobUrl = window.URL.createObjectURL(blob);

                    // Create an anchor tag to trigger download
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = blobUrl;

                    // Always guarantee the .png extension
                    const safeName = (qr.name || 'code').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    link.setAttribute('download', `qrflow-${safeName}.png`);

                    // Append, trigger click, and cleanup
                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                });
        }).catch(err => console.error("Could not generate QR code", err));
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/');
    }

    // Analytics for selected QR
    useEffect(() => {
        if (selectedQR) {
            getAnalytics(selectedQR.id).then(data => setSelectedAnalytics(data));
        } else {
            setSelectedAnalytics([]);
        }
    }, [selectedQR]);

    const maxScans = Math.max(...selectedAnalytics.map((a) => a.scans), 1);

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex bg-gray-950 text-gray-200 font-sans h-screen overflow-hidden">
            {/* Sidebar (Fixed position) */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900 hidden lg:flex flex-col flex-shrink-0 relative z-20">
                {/* Logo Area */}
                <div className="h-16 px-6 flex items-center border-b border-gray-800 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                            <QrCode size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">QRFlow</span>
                    </Link>
                </div>

                {/* Nav Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium">
                        <QrCode size={18} />
                        My QR Codes
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-400 font-medium hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setSelectedQR(qrCodes[0] || null)}
                    >
                        <BarChart3 size={18} />
                        Analytics
                    </button>
                </nav>

                {/* Bottom Action */}
                <div className="p-4 border-t border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-950 border border-gray-800 text-sm mb-3">
                        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-400" />
                        </div>
                        <span className="truncate text-gray-400 font-medium">{user?.email?.split('@')[0] || 'User'}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors text-sm font-medium">
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-950 h-screen relative z-10">
                {/* Header Topbar */}
                <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20">
                    {/* Mobile Branding */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <Link href="/">
                            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                                <QrCode size={18} className="text-white" />
                            </div>
                        </Link>
                        <span className="text-lg font-bold text-white sm:hidden">QRFlow</span>
                    </div>

                    <h1 className="text-lg font-semibold text-white hidden sm:block">Dashboard</h1>

                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-64 max-w-[200px] sm:max-w-none">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                            <input
                                type="text"
                                style={{ paddingLeft: '2.5rem' }}
                                className="w-full bg-gray-950 border border-gray-700 rounded-md py-1.5 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all relative"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link
                            href="/create"
                            className="bg-indigo-600 flex-shrink-0 hover:bg-indigo-500 text-white rounded-md px-3 sm:px-4 py-1.5 flex items-center gap-2 font-medium transition-colors text-sm whitespace-nowrap"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Create QR</span>
                        </Link>
                    </div>
                </header>

                {/* Page Body Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* 4 Block Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Links', value: stats.totalQRCodes, icon: QrCode, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                { label: 'Total Scans', value: formatNumber(stats.totalScans), icon: ScanLine, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                                { label: 'Active', value: stats.activeQRs, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Avg Scans', value: formatNumber(stats.avgScansPerQR), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</div>
                                                <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                                            </div>
                                            <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bg}`}>
                                                <Icon size={20} className={stat.color} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Split Interface: List <-> Details */}
                        <div className="flex flex-col xl:flex-row gap-6 items-start pb-8">

                            {/* Left Col: Master List */}
                            <div className="flex-1 w-full min-w-0 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-white">Your QR Codes</h2>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                        {filteredQRs.length} Total
                                    </span>
                                </div>

                                {filteredQRs.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                                            <QrCode size={24} className="text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-2">No QR Codes Found</h3>
                                        <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">You haven&apos;t created any QR codes yet, or none match your search.</p>
                                        <Link href="/create" className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                            <Plus size={16} />
                                            Create First QR Code
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {filteredQRs.map((qr) => (
                                            <div
                                                key={qr.id}
                                                style={{ zIndex: activeMenu === qr.id ? 50 : 1 }}
                                                className={`p-4 flex items-center gap-4 hover:bg-gray-800/50 cursor-pointer group transition-colors relative ${selectedQR?.id === qr.id ? 'bg-gray-800/80' : ''}`}
                                                onClick={() => setSelectedQR(qr)}
                                            >
                                                {selectedQR?.id === qr.id && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                                )}
                                                {/* QR Thumbnail */}
                                                <div className="w-12 h-12 flex-shrink-0 rounded bg-white p-1 border border-gray-200">
                                                    {qrImages[qr.id] ? (
                                                        <img src={qrImages[qr.id]} alt={qr.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                                            <QrCode size={16} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">{qr.name}</h3>
                                                        {qr.status === 'active' ? (
                                                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                                                        ) : (
                                                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="uppercase font-medium">{qr.type}</span>
                                                        <span className="text-gray-600">•</span>
                                                        <span>{getTimeAgo(qr.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Scans */}
                                                <div className="text-right flex-shrink-0 px-4 hidden sm:block">
                                                    <div className="text-lg font-bold text-gray-200 mb-0.5">{formatNumber(qr.scans)}</div>
                                                    <div className="text-[10px] font-medium text-gray-500 uppercase">Scans</div>
                                                </div>

                                                {/* Actions */}
                                                <div className="relative flex-shrink-0">
                                                    <button
                                                        className="w-8 h-8 rounded hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-200 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === qr.id ? null : qr.id);
                                                        }}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenu === qr.id && (
                                                        <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 w-44 z-50">
                                                            <button
                                                                className="w-full px-4 py-2 text-xs font-medium text-left flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); handleCopyLink(qr.shortCode); setActiveMenu(null); }}
                                                            >
                                                                {copiedId === qr.shortCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                                Copy Shortlink
                                                            </button>
                                                            <button
                                                                className="w-full px-4 py-2 text-xs font-medium text-left flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); handleDownload(qr); setActiveMenu(null); }}
                                                            >
                                                                <Download size={14} />
                                                                Download PNG
                                                            </button>
                                                            <div className="h-px bg-gray-700 my-1 mx-2" />
                                                            <button
                                                                className="w-full px-4 py-2 text-xs font-medium text-left flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(qr.id); }}
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Details Panel */}
                            <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-6 xl:sticky xl:top-0">
                                {selectedQR ? (
                                    <>
                                        {/* Main Info Card */}
                                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-sm">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-base font-semibold text-white truncate pr-4">{selectedQR.name}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold flex-shrink-0 ${selectedQR.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                    {selectedQR.status}
                                                </span>
                                            </div>

                                            <div className="bg-white rounded-lg p-4 w-40 h-40 mx-auto mb-6 flex justify-center items-center shadow-sm">
                                                {qrImages[selectedQR.id] && (
                                                    <img src={qrImages[selectedQR.id]} alt={selectedQR.name} className="w-full h-full object-contain" />
                                                )}
                                            </div>

                                            <div className="bg-gray-950 rounded-lg p-3 flex items-center justify-between mb-6 border border-gray-800">
                                                <div className="overflow-hidden pr-3">
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Short Link</div>
                                                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleCopyLink(selectedQR.shortCode)}>
                                                        <div className="font-mono text-sm font-medium text-indigo-400 truncate">qrflow.app/r/{selectedQR.shortCode}</div>
                                                        {copiedId === selectedQR.shortCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-500" />}
                                                    </div>
                                                </div>
                                                <a href={`http://localhost:3000/r/${selectedQR.shortCode}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors text-gray-400 flex-shrink-0">
                                                    <Eye size={16} />
                                                </a>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold text-white mb-0.5">{formatNumber(selectedQR.scans)}</div>
                                                    <div className="text-[10px] font-medium text-gray-500 uppercase">Total Scans</div>
                                                </div>
                                                <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-center">
                                                    <div className="text-base font-bold text-gray-300 mb-0.5 uppercase tracking-wide truncate">{selectedQR.type}</div>
                                                    <div className="text-[10px] font-medium text-gray-500 uppercase">QR Type</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chart & Analytics */}
                                        {selectedAnalytics.length > 0 && (
                                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-sm">
                                                <h4 className="text-sm font-semibold text-white mb-4">Scans Last 7 Days</h4>

                                                <div className="flex items-end gap-2 h-24 mb-6 pt-2 border-b border-gray-800">
                                                    {selectedAnalytics.slice(0, 7).reverse().map((day, i) => {
                                                        const heightPercent = maxScans > 0 ? (day.scans / maxScans) * 100 : 0;
                                                        return (
                                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-gray-200 text-xs font-bold px-2 py-1 rounded pointer-events-none transition-opacity z-10 whitespace-nowrap">
                                                                    {`${day.scans} scans`}
                                                                </div>
                                                                <div
                                                                    className="w-full rounded-t-sm bg-indigo-500/80 group-hover:bg-indigo-400 transition-colors"
                                                                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Device breakdown */}
                                                {selectedAnalytics[0]?.devices && (
                                                    <div className="pt-1">
                                                        <h5 className="text-[10px] font-semibold text-gray-500 uppercase mb-3">Device Breakdowns</h5>
                                                        <div className="space-y-3">
                                                            {Object.entries(selectedAnalytics[0].devices).map(([device, count]) => {
                                                                const total = Object.values(selectedAnalytics[0].devices).reduce((a, b) => a + b, 0);
                                                                const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                                                                const icons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
                                                                const Icon = icons[device] || Smartphone;
                                                                return (
                                                                    <div key={device} className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                                                                            <Icon size={14} />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between text-xs font-medium mb-1.5">
                                                                                <span className="text-gray-300 capitalize">{device}</span>
                                                                                <span className="text-gray-400">{pct}%</span>
                                                                            </div>
                                                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-indigo-500/80 rounded-full" style={{ width: `${pct}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                            <Eye size={20} className="text-gray-500" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-white mb-2">Select a QR Code</h3>
                                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Click any item from the left to view data.</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Click outside to close menus */}
            {activeMenu && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveMenu(null)} />
            )}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}
