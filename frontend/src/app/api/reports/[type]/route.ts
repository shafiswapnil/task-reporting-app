import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request, { params }: { params: { type: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const project = searchParams.get('project');

    const response = await fetch(`${process.env.BACKEND_URL}/api/reports/${params.type}?startDate=${startDate}&endDate=${endDate}&project=${project}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
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
