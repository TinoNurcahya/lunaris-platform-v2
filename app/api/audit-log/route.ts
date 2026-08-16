import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path, method, details } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Extract IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    }

    // Extract User Agent
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    // Geolocation Resolution
    let location = 'Localhost / Dev';
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const vercelCountry = request.headers.get('x-vercel-ip-country');

    if (vercelCity && vercelCountry) {
      const vercelRegion = request.headers.get('x-vercel-ip-country-region');
      location = vercelRegion
        ? `${decodeURIComponent(vercelCity)}, ${vercelRegion}, ${vercelCountry}`
        : `${decodeURIComponent(vercelCity)}, ${vercelCountry}`;
    } else if (ipAddress !== '127.0.0.1' && ipAddress !== 'localhost') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const geoRes = await fetch(
          `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,isp,lat,lon`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            const cityRegion = [geoData.city, geoData.regionName, geoData.country].filter(Boolean).join(', ');
            const ispStr = geoData.isp ? ` (${geoData.isp})` : '';
            location = `${cityRegion}${ispStr}`;
          }
        }
      } catch {
        location = 'IP Publik';
      }
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      user_email: user?.email || null,
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      location,
      path: path || '/',
      method: method || 'POST',
      details: details || {}
    });

    if (error) {
      console.warn('API Audit Log insert notice:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API Audit Log Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
