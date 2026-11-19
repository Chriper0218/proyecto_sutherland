import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function encodeBase64Url(input: object): string {
  return Buffer.from(JSON.stringify(input), 'utf8').toString('base64url');
}

export async function GET() {
  try {
    const clientId = process.env.TABLEAU_CLIENT_ID?.trim();
    const secretId = process.env.TABLEAU_SECRET_ID?.trim();
    const secretValue = process.env.TABLEAU_SECRET_VALUE?.trim();
    const userEmail = process.env.TABLEAU_USER_EMAIL?.trim();

    if (!clientId || !secretId || !secretValue || !userEmail) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Tableau Connected Apps' },
        { status: 500 }
      );
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT',
      kid: secretId,
      iss: clientId,
    };

    const payload = {
      iss: clientId,
      sub: userEmail,
      aud: 'tableau',
      exp: Math.floor(Date.now() / 1000) + 300,
      jti: crypto.randomUUID(),
      scp: ['tableau:views:embed'],
    };

    const encodedHeader = encodeBase64Url(header);
    const encodedPayload = encodeBase64Url(payload);
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', secretValue)
      .update(signingInput)
      .digest('base64url');

    const token = `${signingInput}.${signature}`;

    return NextResponse.json(
      { token },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error al generar token JWT de Tableau:', error);
    return NextResponse.json(
      { error: 'Error interno al generar el token de autenticación de Tableau' },
      { status: 500 }
    );
  }
}
