import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = db.getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const health = db.calculateEventHealth(event);
    const financials = db.calculateFinancialSummary(event);

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        health,
        financials,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = db.updateEvent(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = db.deleteEvent(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Event marked as ARCHIVED' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
