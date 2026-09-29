import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend, checkAuthentication } from '@/proxy';

async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const auth = await checkAuthentication(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Please log in as a merchant.' }, { status: 401 });
  }

  const subPath = params.path.join('/');
  const endpoint = `/api/v1/auth/seller/${subPath}`;

  const contentType = req.headers.get('content-type') || '';
  let body: any = undefined;

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await req.json());
    } else {
      body = await req.text();
    }
  }

  try {
    const backendRes = await proxyToBackend(req, endpoint, {
      method: req.method,
      headers: {
        'Content-Type': contentType || 'application/json',
      },
      body,
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to proxy request to FastAPI backend' },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
