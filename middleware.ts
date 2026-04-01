import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Note: la protection admin est gérée côté client dans app/admin/layout.tsx
  // Le middleware ne bloque plus car getUser() peut retourner null sur des sessions valides
  // quand le token est en cours de refresh

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
