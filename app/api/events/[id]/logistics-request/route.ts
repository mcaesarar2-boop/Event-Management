import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const result = db.dispatchLogisticsRequest(id, body.requirementIds);

    return NextResponse.json({
      success: true,
      message: result.message,
      dispatchPayload: result.payload,
      integrationContract: {
        targetRepo: 'mcaesarar2-boop/erp-logistik',
        status: 'DISPATCH_READY',
        protocol: 'REST_WEBHOOK_JSON',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
