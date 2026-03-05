import { supabase } from './supabase';

export async function getQRCodes() {
    const { data: { session } } = await supabase.auth.getSession();

    let query = supabase
        .from('qr_codes')
        .select(`
      *,
      scan_events (count)
    `)
        .order('created_at', { ascending: false });

    if (session?.user) {
        query = query.eq('user_id', session.user.id);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching QR codes:', error);
        return [];
    }

    return data.map(qr => ({
        id: qr.id,
        name: qr.name,
        type: qr.type,
        content: qr.content,
        shortCode: qr.short_code,
        fgColor: qr.fg_color,
        bgColor: qr.bg_color,
        createdAt: qr.created_at,
        status: qr.status,
        scans: qr.scan_events?.[0]?.count || 0,
    }));
}

export async function getQRCodeByShortCode(shortCode) {
    const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('short_code', shortCode)
        .single();

    if (error) {
        console.error('Error fetching specific QR code:', error);
        return null;
    }
    return data;
}

export async function createQRCode(qrData) {
    const { data: { session } } = await supabase.auth.getSession();

    const dbData = {
        name: qrData.name,
        type: qrData.type,
        content: qrData.content,
        short_code: qrData.shortCode,
        fg_color: qrData.fgColor,
        bg_color: qrData.bgColor,
        status: qrData.status,
    };

    if (session?.user) {
        dbData.user_id = session.user.id;
    }

    const { data, error } = await supabase
        .from('qr_codes')
        .insert([dbData])
        .select()
        .single();

    if (error) {
        console.error('Error creating QR code:', error);
        return null;
    }
    return data;
}

export async function deleteQRCode(id) {
    const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting QR code:', error);
    }
}

export async function getAnalytics(qrId) {
    // Get scans from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const { data, error } = await supabase
        .from('scan_events')
        .select('created_at, device_type, country')
        .eq('qr_id', qrId)
        .gte('created_at', sevenDaysAgo);

    if (error) {
        console.error('Error fetching analytics:', error);
        return [];
    }

    // Aggregate stats by date
    const dailyStats = {};

    // Initialize last 7 days with zeros
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = {
            date: dateStr,
            scans: 0,
            devices: { mobile: 0, desktop: 0, tablet: 0 }
        };
    }

    // Populate data
    data.forEach(scan => {
        const dateStr = scan.created_at.split('T')[0];
        if (dailyStats[dateStr]) {
            dailyStats[dateStr].scans++;
            const device = scan.device_type || 'mobile';
            if (dailyStats[dateStr].devices[device] !== undefined) {
                dailyStats[dateStr].devices[device]++;
            }
        }
    });

    // Convert to array and sort by date ascending
    return Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export async function getTotalStats() {
    const codes = await getQRCodes();
    const totalScans = codes.reduce((sum, qr) => sum + (qr.scans || 0), 0);
    const activeQRs = codes.filter(qr => qr.status === 'active').length;

    return {
        totalQRCodes: codes.length,
        totalScans,
        activeQRs,
        avgScansPerQR: codes.length > 0 ? Math.round(totalScans / codes.length) : 0,
    };
}

export async function joinWaitlist(email) {
    const { data, error } = await supabase
        .from('waitlist')
        .insert([{ email }])
        .select();

    if (error) {
        console.error('Waitlist insertion error:', error);
        return { success: false, error: error.message };
    }
    return { success: true, data };
}
