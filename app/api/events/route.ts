import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q')?.toLowerCase();

    let events = db.getEvents();

    if (status) {
      events = events.filter((e) => e.status === status);
    }

    if (search) {
      events = events.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          e.code.toLowerCase().includes(search) ||
          e.clientName.toLowerCase().includes(search) ||
          e.venueName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        total: events.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Event name and type are required' },
        { status: 400 }
      );
    }

    const created = db.createEvent(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
