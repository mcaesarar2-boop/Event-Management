import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const reportType = searchParams.get('type') || 'SUMMARY'; // SUMMARY | BUDGET_VS_ACTUAL | PROFIT_LOSS | TALENT_COST | PROCUREMENT

    const allEvents = db.getEvents();
    const targetEvents = eventId ? allEvents.filter((e) => e.id === eventId) : allEvents;

    const reportsData = targetEvents.map((event) => {
      const financials = db.calculateFinancialSummary(event);
      const budgets = db.getBudgetItems(event.id);
      const artists = db.getArtists(event.id);
      const pos = db.getPurchaseOrders(event.id);
      const risks = db.getRisks(event.id);

      return {
        eventId: event.id,
        code: event.code,
        name: event.name,
        type: event.type,
        status: event.status,
        financials,
        budgetLinesCount: budgets.length,
        artistsCount: artists.length,
        posCount: pos.length,
        openRisksCount: risks.filter((r) => r.status === 'Open').length,
        budgetByCategory: budgets.reduce((acc: Record<string, number>, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.actualTotal;
          return acc;
        }, {}),
      };
    });

    return NextResponse.json({
      success: true,
      reportType,
      generatedAt: new Date().toISOString(),
      data: reportsData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
