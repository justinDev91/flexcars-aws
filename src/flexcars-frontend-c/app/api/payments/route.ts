import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method } = body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      return NextResponse.json(
        { error: 'Payment failed', message: 'Card was declined' },
        { status: 400 }
      );
    }

    // Generate mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = {
      id: `pay_${Date.now()}`,
      status: 'SUCCESS',
      transactionId,
      message: 'Payment processed successfully',
      invoiceId,
      amount,
      method,
      paidAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
