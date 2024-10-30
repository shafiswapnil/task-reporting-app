import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const backendUrl = `${process.env.BACKEND_URL}/api/reports/missing?email=${email}`;
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Missing reports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
