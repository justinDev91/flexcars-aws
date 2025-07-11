import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/payments/debug/payment-sync/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erreur diagnostic payment sync:', error);
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/payments/debug/fix-payment-sync/${invoiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erreur correction payment sync:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correction' },
      { status: 500 }
    );
  }
} 