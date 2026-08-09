import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Simple in-memory rate limiter (resets on serverless cold start)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const MAX_REQUESTS_PER_MINUTE = 3;

export async function POST(request: Request) {
  try {
    // Rate Limiting Logic
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userRateData = rateLimitMap.get(ip);
    
    if (userRateData) {
      const timeElapsed = now - userRateData.timestamp;
      if (timeElapsed < 60000) { // Within 1 minute
        if (userRateData.count >= MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json(
            { error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.' },
            { status: 429 }
          );
        }
        userRateData.count += 1;
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nama, email, dan isi pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured yet. Message logged locally.');
      console.log('Contact Message Received:', { name, email, subject, message });
      return NextResponse.json({
        success: true,
        message: 'Pesan diterima (Dev Mode / Siap Konfigurasi Resend API Key).'
      });
    }

    const resend = new Resend(apiKey);

    const subjectLabels: Record<string, string> = {
      general: 'Pertanyaan Umum',
      account: 'Kendala Akun & Login',
      feedback: 'Kritik, Saran & Masukan',
      partnership: 'Ide Kerja Sama & Kolaborasi'
    };

    const topicLabel = subjectLabels[subject] || 'Pesan Baru';

    const data = await resend.emails.send({
      from: 'Lunarys Contact <onboarding@resend.dev>',
      to: 'tinonurcahya.ti@gmail.com',
      replyTo: email,
      subject: `[Lunarys Contact] ${topicLabel} dari ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Pesan Baru dari Formulir Kontak Lunarys V2</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Pengirim:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Topik:</strong> ${topicLabel}</p>
          <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <h3 style="color: #1e293b;">Isi Pesan:</h3>
          <blockquote style="background: #f8fafc; border-left: 4px solid #4f46e5; margin: 0; padding: 12px 16px; font-style: italic;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error sending email via Resend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim email';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
