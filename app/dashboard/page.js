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
    User,
    Menu
} from 'lucide-react';
import { getQRCodes, getTotalStats, deleteQRCode as removeQR, getAnalytics } from '@/lib/store';
import { formatNumber, getTimeAgo } from '@/lib/utils';

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const [copiedId, setCopiedId] = useState(null);

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
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = blobUrl;

                    const safeName = (qr.name || 'code').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    link.setAttribute('download', `qrflow-${safeName}.png`);

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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Skeleton className="w-12 h-12 rounded-full" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Links', value: stats.totalQRCodes, icon: QrCode },
        { label: 'Total Scans', value: formatNumber(stats.totalScans), icon: ScanLine },
        { label: 'Active', value: stats.activeQRs, icon: Activity },
        { label: 'Avg Scans', value: formatNumber(stats.avgScansPerQR), icon: TrendingUp },
    ]

    return (
        <div className="flex bg-background text-foreground h-screen overflow-hidden font-sans">
            {/* Sidebar (Fixed position) */}
            <aside className="w-64 border-r bg-card hidden lg:flex flex-col flex-shrink-0 relative z-20">
                {/* Logo Area */}
                <div className="h-16 px-6 flex items-center border-b flex-shrink-0">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <QrCode size={18} className="text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-card-foreground">QRFlow</span>
                    </Link>
                </div>

                {/* Nav Menu */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <Button variant="secondary" className="w-full justify-start gap-3">
                        <QrCode size={18} />
                        My QR Codes
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <BarChart3 size={18} />
                        Analytics
                    </Button>
                </nav>

                {/* Bottom Action */}
                <div className="p-4 border-t flex-shrink-0">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50 border mb-3">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm text-muted-foreground font-medium">{user?.email?.split('@')[0] || 'User'}</span>
                    </div>
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut size={16} />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background h-screen relative z-10">
                {/* Header Topbar */}
                <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20">
                    {/* Mobile Branding */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="start">
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <QrCode size={18} className="text-primary-foreground" />
                            </div>
                        </Link>
                    </div>

                    <h1 className="text-lg font-semibold lg:block hidden">Dashboard</h1>

                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-64 max-w-[200px] sm:max-w-none">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                            <Input
                                type="text"
                                className="w-full pl-9 pr-4 bg-muted/50"
                                placeholder="Search links..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button asChild className="gap-2 whitespace-nowrap">
                            <Link href="/create">
                                <Plus size={16} />
                                <span className="hidden sm:inline">Create QR</span>
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Page Body Scrollable */}
                <ScrollArea className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* 4 Block Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Card key={stat.label} className="shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {stat.label}
                                            </CardTitle>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stat.value}</div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Split Interface: List <-> Details */}
                        <div className="flex flex-col xl:flex-row gap-6 items-start pb-8">

                            {/* Left Col: Master List */}
                            <Card className="flex-1 w-full min-w-0 shadow-sm overflow-hidden flex flex-col">
                                <CardHeader className="px-5 py-4 border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Your QR Codes</CardTitle>
                                    <Badge variant="secondary">{filteredQRs.length} Total</Badge>
                                </CardHeader>

                                {filteredQRs.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border">
                                            <QrCode size={24} className="text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">No QR Codes Found</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">You haven&apos;t created any QR codes yet, or none match your search.</p>
                                        <Button asChild>
                                            <Link href="/create">
                                                <Plus size={16} className="mr-2" />
                                                Create First QR Code
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <ScrollArea className="max-h-[600px] w-full">
                                        <div className="divide-y">
                                            {filteredQRs.map((qr) => (
                                                <div
                                                    key={qr.id}
                                                    className={`px-5 py-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer group transition-colors relative ${selectedQR?.id === qr.id ? 'bg-muted/50' : ''}`}
                                                    onClick={() => setSelectedQR(qr)}
                                                >
                                                    {selectedQR?.id === qr.id && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                                    )}
                                                    {/* QR Thumbnail */}
                                                    <div className="w-12 h-12 flex-shrink-0 rounded-md bg-white p-1 border shadow-sm">
                                                        {qrImages[qr.id] ? (
                                                            <img src={qrImages[qr.id]} alt={qr.name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Skeleton className="w-full h-full rounded" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{qr.name}</h3>
                                                            {qr.status === 'active' ? (
                                                                <Badge variant="default" className="text-[10px] hidden sm:inline-flex bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">Active</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">Inactive</Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="uppercase font-medium">{qr.type}</span>
                                                            <span className="text-border">•</span>
                                                            <span>{getTimeAgo(qr.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Scans */}
                                                    <div className="text-right flex-shrink-0 px-4 hidden sm:block">
                                                        <div className="text-base font-bold mb-0.5">{formatNumber(qr.scans)}</div>
                                                        <div className="text-[10px] font-medium text-muted-foreground uppercase">Scans</div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="relative flex-shrink-0">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyLink(qr.shortCode); }}>
                                                                    {copiedId === qr.shortCode ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                                                    Copy Link
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(qr); }}>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download PNG
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(qr.id); }} className="text-destructive focus:bg-destructive/10">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete QR
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </Card>

                            {/* Right Col: Details Panel */}
                            <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-6 xl:sticky xl:top-0">
                                {selectedQR ? (
                                    <>
                                        {/* Main Info Card */}
                                        <Card className="shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-base font-semibold truncate pr-4">{selectedQR.name}</h3>
                                                    {selectedQR.status === 'active' ? (
                                                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Inactive</Badge>
                                                    )}
                                                </div>

                                                <div className="bg-white rounded-lg p-4 w-44 h-44 mx-auto mb-6 flex justify-center items-center shadow-sm border">
                                                    {qrImages[selectedQR.id] && (
                                                        <img src={qrImages[selectedQR.id]} alt={selectedQR.name} className="w-full h-full object-contain" />
                                                    )}
                                                </div>

                                                <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between mb-6 border">
                                                    <div className="overflow-hidden pr-3">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Short Link</div>
                                                        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleCopyLink(selectedQR.shortCode)}>
                                                            <div className="font-mono text-sm font-medium text-primary truncate">qrflow.app/r/{selectedQR.shortCode}</div>
                                                            {copiedId === selectedQR.shortCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
                                                        </div>
                                                    </div>
                                                    <Button variant="secondary" size="icon" asChild>
                                                        <a href={`http://localhost:3000/r/${selectedQR.shortCode}`} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-background border rounded-lg p-3 text-center">
                                                        <div className="text-lg font-bold mb-0.5">{formatNumber(selectedQR.scans)}</div>
                                                        <div className="text-[10px] font-medium text-muted-foreground uppercase">Total Scans</div>
                                                    </div>
                                                    <div className="bg-background border rounded-lg p-3 text-center">
                                                        <div className="text-base font-bold mb-0.5 uppercase tracking-wide truncate">{selectedQR.type}</div>
                                                        <div className="text-[10px] font-medium text-muted-foreground uppercase">QR Type</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Chart & Analytics */}
                                        {selectedAnalytics.length > 0 && (
                                            <Card className="shadow-sm">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-semibold">Scans Last 7 Days</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-end gap-2 h-24 mb-6 pt-2 border-b">
                                                        {selectedAnalytics.slice(0, 7).reverse().map((day, i) => {
                                                            const heightPercent = maxScans > 0 ? (day.scans / maxScans) * 100 : 0;
                                                            return (
                                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-opacity z-10 whitespace-nowrap border">
                                                                        {`${day.scans} scans`}
                                                                    </div>
                                                                    <div
                                                                        className="w-full rounded-t-sm bg-primary/80 group-hover:bg-primary transition-colors"
                                                                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Device breakdown */}
                                                    {selectedAnalytics[0]?.devices && (
                                                        <div className="pt-1">
                                                            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-3">Device Breakdowns</h5>
                                                            <div className="space-y-3">
                                                                {Object.entries(selectedAnalytics[0].devices).map(([device, count]) => {
                                                                    const total = Object.values(selectedAnalytics[0].devices).reduce((a, b) => a + b, 0);
                                                                    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                                                                    const icons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
                                                                    const Icon = icons[device] || Smartphone;
                                                                    return (
                                                                        <div key={device} className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                                                                <Icon size={14} />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                                                                    <span className="capitalize">{device}</span>
                                                                                    <span className="text-muted-foreground">{pct}%</span>
                                                                                </div>
                                                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-primary/80 rounded-full" style={{ width: `${pct}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                ) : (
                                    <Card className="min-h-[300px] flex flex-col items-center justify-center text-center shadow-sm">
                                        <CardContent className="pt-6">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto border">
                                                <Eye size={20} className="text-muted-foreground" />
                                            </div>
                                            <CardTitle className="text-sm font-semibold mb-2">Select a QR Code</CardTitle>
                                            <CardDescription className="text-xs max-w-[200px] mx-auto">Click any item from the left to view data.</CardDescription>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
