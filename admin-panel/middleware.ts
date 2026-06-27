import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pass-through middleware — auth is handled client-side in the Sidebar component
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
