import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function handler(req: Request) {
  const { method, headers, body, url } = req;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Modify the request to include the bearer token
  const backendUrl = `http://localhost:5001${new URL(url).pathname}`;

  try {
    const response = await fetch(backendUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`, // Adjust as needed
      },
      body: method === 'GET' ? null : JSON.stringify(await req.json()),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handler(req);
}

export async function POST(req: Request) {
  return handler(req);
}

export async function PUT(req: Request) {
  return handler(req);
}

export async function DELETE(req: Request) {
  return handler(req);
}

