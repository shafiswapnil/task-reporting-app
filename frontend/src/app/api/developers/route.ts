import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  return handleRequest(req, 'GET');
}

export async function POST(req: Request) {
  return handleRequest(req, 'POST');
}

async function handleRequest(req: Request, method: string) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/developers`, {
      method,
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? await req.text() : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
