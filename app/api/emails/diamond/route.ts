import { NextRequest, NextResponse } from 'next/server';
import { sendDiamondFoundEmail } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { email, firstName, amount } = await request.json();

    if (!email || !firstName || amount === undefined) {
      return NextResponse.json(
        { error: 'email, firstName, and amount are required' },
        { status: 400 }
      );
    }

    const result = await sendDiamondFoundEmail(email, firstName, amount);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    });
  } catch (error: any) {
    console.error('Error in diamond email API:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
