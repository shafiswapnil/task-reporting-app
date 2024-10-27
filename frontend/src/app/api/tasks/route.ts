import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { ApiResponse } from '@/types/api';
import type { Task } from '@/types/task';

export async function GET(req: Request) {
  return handleRequest<Task[]>(req, 'GET');
}

export async function POST(req: Request) {
  return handleRequest<Task>(req, 'POST');
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
