import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  try {
    console.log('Attempting to get token');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    console.log('Token:', JSON.stringify(token, null, 2));

    if (!token) {
      console.error('No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Token found, attempting to fetch tasks');
    console.log('Backend URL:', process.env.BACKEND_URL);
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: `Backend API error: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
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

    const response = await fetch(`${process.env.BACKEND_URL}/api/tasks`, {
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
