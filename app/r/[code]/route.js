import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { code } = resolvedParams;

  if (!code) {
    return new NextResponse('Not found', { status: 404 });
  }

  // 1. Find the QR Code in Supabase
  const { data: qrCode, error: qrError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('short_code', code)
    .single();

  if (qrError || !qrCode) {
    return new NextResponse('QR Code not found or inactive', { status: 404 });
  }

  if (qrCode.status !== 'active') {
    return new NextResponse('This QR Code is disabled', { status: 403 });
  }

  // 2. Parse User Agent & Request Info for Analytics
  const userAgent = request.headers.get('user-agent') || '';
  let deviceType = 'desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/ipad|tablet/i.test(userAgent)) deviceType = 'tablet';

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'Unknown';
  // Vercel generally sets x-vercel-ip-country
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown';

  // 3. Record the Scan asynchronously
  await supabase
    .from('scan_events')
    .insert([{
      qr_id: qrCode.id,
      device_type: deviceType,
      country: country,
      ip_address: ip
    }]);

  // 4. Redirect based on QR content type
  // For MVP, we will mostly redirect to URLs directly
  // However, things like text, wifi, vcard are trickier to redirect.
  // For 'url' type, redirect directly.
  // For others, we'll build a simple generated page or data URI.

  if (qrCode.type === 'url') {
    let target = qrCode.content;
    if (!target.startsWith('http')) {
      target = `https://${target}`;
    }
    return NextResponse.redirect(target);
  }

  // For non-URL types, we serve a simple interstitial page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Code Content</title>
      <style>
        body { font-family: system-ui, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#0B0F19; color:white; }
        .card { background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); max-width: 400px; width: 100%; text-align:center; }
        pre { background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 14px; text-align: left;}
        a { color: #6C63FF; text-decoration: none; display: inline-block; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>${qrCode.name}</h2>
        <p>Type: <strong>${qrCode.type.toUpperCase()}</strong></p>
        <pre>${qrCode.content}</pre>
        ${qrCode.type === 'email' ? `<a href="${qrCode.content}">Send Email</a>` : ''}
        ${qrCode.type === 'sms' ? `<a href="${qrCode.content}">Send SMS</a>` : ''}
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
