import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { ApiResponse } from '@/types/api';
import type { Task } from '@/types/task';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.BACKEND_URL}/api/tasks`;
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
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const data = await req.json();
    const backendUrl = `${process.env.BACKEND_URL}/api/tasks`;

    console.log('Submitting task with data and email:', {
      ...data,
      developerEmail: token.email // Change this line
    });

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        ...data,
        developerEmail: token.email // Change this line
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Backend error:', responseData);
      return NextResponse.json(
        { error: responseData.message || 'Failed to submit task' },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Task submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleRequest<T>(req: Request, method: string): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ 
        error: { message: 'Unauthorized', status: 401 } 
      }, { status: 401 });
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
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({
      error: {
        message: 'An unexpected error occurred',
        status: 500,
        details: error.message
      }
    }, { status: 500 });
  }
}
