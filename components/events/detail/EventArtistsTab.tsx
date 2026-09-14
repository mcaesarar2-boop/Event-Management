'use client';

import React, { useState } from 'react';
import {
  Music,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Coffee,
  Sliders,
  Users,
  Plane,
  Building,
  Radio,
  X,
  ChevronRight,
} from 'lucide-react';
import { Artist, Event, BookingStatus, RiderStatus } from '@/lib/types';
import { formatIDR, formatCompactIDR } from '@/lib/utils/format';

interface EventArtistsTabProps {
  event: Event;
  artists: Artist[];
  onAddArtist: (artist: Omit<Artist, 'id'>) => void;
  onUpdateArtist: (id: string, data: Partial<Artist>) => void;
}

export function EventArtistsTab({
  event,
  artists,
  onAddArtist,
  onUpdateArtist,
}: EventArtistsTabProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(artists[0] || null);
  const [activeRiderTab, setActiveRiderTab] = useState<'TECHNICAL' | 'HOSPITALITY' | 'CONTRACT'>('TECHNICAL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Artist Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Artist['type']>('Headliner');
  const [genre, setGenre] = useState('Pop / Rock');
  const [agency, setAgency] = useState('Artist Management');
  const [contactPerson, setContactPerson] = useState('');
  const [fee, setFee] = useState(150000000);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddArtist({
      eventId: event.id,
      name,
      type,
      genre,
      agency,
      contactPerson,
      phone: '0812-9988-7766',
      email: 'booking@management.id',
      fee: Number(fee),
      currency: 'IDR',
      bookingStatus: 'Offered',
      contractStatus: 'Drafted',
      contractUrl: '',
      performanceDurationMinutes: 60,
      entourageCount: 15,
      technicalRider: {
        fohConsole: 'Digico SD10 / Yamaha CL5 with Waves SoundGrid',
        monitorConsole: 'Digico SD10 or 8 Aux In-Ear stereo mixes',
        iemChannelsCount: 8,
        backline: [
          'Drums: Tama Starclassic / DW Collectors',
          'Guitar Amp: Fender Twin Reverb & Marshall JCM900',
          'Bass Amp: Ampeg SVT-CL + 8x10 Cabinet',
          'Keyboard: Nord Stage 3 88 Keys',
        ],
        microphones: [
          'Lead Vocal: Shure Axient Digital KSM9 / Beta 58A',
          'Backing Vocals: 3x Shure SM58 wireless',
          'Drum Kit: Shure Beta 52A, Beta 91A, SM57s, KSM137s',
        ],
        stageDimensions: 'Minimum 14m x 10m x 1.5m with clear roof clearance',
        powerRequirements: '3-phase isolated technical power 63A with clean ground (< 1 Volt)',
        risers: ['Drum riser 3m x 2m x 0.4m', 'Keyboard riser 2m x 2m x 0.4m'],
        status: 'In Review',
      },
      hospitalityRider: {
        dressingRoomCount: 2,
        dressingRoomSpecs: 'Air-conditioned (20°C), illuminated mirror, sofas for 15 pax, private restroom',
        cateringMealsCount: 15,
        dietaryRestrictions: 'Halal standard meals, fresh fruits, hot water dispenser with ginger/honey',
        hotelRooms: {
          suiteRooms: 1,
          deluxeRooms: 7,
          twinRooms: 4,
          hotelStarRating: 5,
        },
        transportation: '2x Toyota HiAce Commuter VIP + 1x Toyota Alphard for principal artist',
        groundTransfersNotes: 'Dedicated drivers with VIP parking access at backstage artist entrance',
        securityPassesQuota: {
          allAccess: 5,
          workingCrew: 12,
          vipGuest: 6,
        },
        status: 'In Review',
      },
      paymentMilestones: [
        { label: 'Down Payment (DP)', percentage: 50, amount: Number(fee) * 0.5, dueDate: '2026-05-01', status: 'Pending' },
        { label: 'H-7 Final Settlement', percentage: 50, amount: Number(fee) * 0.5, dueDate: '2026-06-01', status: 'Pending' },
      ],
      notes: 'Initial rider submitted, awaiting production director review.',
    });

    setIsAddModalOpen(false);
    setName('');
    setFee(150000000);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            Talent, Technical Riders & Hospitality Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage booking contracts, backline riders, audio consoles, dressing room specs, and payments
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Artist / Talent</span>
        </button>
      </div>

      {/* Main Grid: Artist List on Left (Cards), Detailed Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Artist List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Confirmed & Inquired Talent ({artists.length})
          </div>

          <div className="space-y-2.5">
            {artists.map((art) => {
              const isSelected = selectedArtist?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtist(art)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{art.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {art.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {art.genre} &middot; Entourage: {art.entourageCount} pax
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        art.bookingStatus === 'Contracted'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : art.bookingStatus === 'Confirmed'
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {art.bookingStatus}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="font-mono text-slate-300">
                      Fee: <strong className="text-slate-100">{formatCompactIDR(art.fee)}</strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>Rider:</span>
                      <span
                        className={`font-semibold ${
                          art.technicalRider.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {art.technicalRider.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Rider Inspector & Contract Tracker (7 cols) */}
        <div className="lg:col-span-7">
          {selectedArtist ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Header inside Inspector */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{selectedArtist.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {selectedArtist.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Agency: {selectedArtist.agency} &middot; Contact: {selectedArtist.contactPerson} ({selectedArtist.phone})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedArtist.bookingStatus}
                    onChange={(e) =>
                      onUpdateArtist(selectedArtist.id, {
                        bookingStatus: e.target.value as BookingStatus,
                      })
                    }
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Inquired">Status: Inquired</option>
                    <option value="Offered">Status: Offered</option>
                    <option value="Negotiating">Status: Negotiating</option>
                    <option value="Confirmed">Status: Confirmed</option>
                    <option value="Contracted">Status: Contracted</option>
                    <option value="Cancelled">Status: Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Sub-tabs: Technical Rider | Hospitality Rider | Contract & Payments */}
              <div className="px-5 border-b border-slate-800 flex items-center space-x-4 bg-slate-900 text-xs">
                <button
                  onClick={() => setActiveRiderTab('TECHNICAL')}
                  className={`py-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
                    activeRiderTab === 'TECHNICAL'
                      ? 'border-indigo-500 text-indigo-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Technical Rider Specs</span>
                </button>

                <button
                  onClick={() => setActiveRiderTab('HOSPITALITY')}
                  className={`py-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
                    activeRiderTab === 'HOSPITALITY'
                      ? 'border-indigo-500 text-indigo-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Hospitality & Logistics</span>
                </button>

                <button
                  onClick={() => setActiveRiderTab('CONTRACT')}
                  className={`py-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
                    activeRiderTab === 'CONTRACT'
                      ? 'border-indigo-500 text-indigo-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Contract & Payment Milestones</span>
                </button>
              </div>

              {/* Rider Tab Content */}
              <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                {/* 1. Technical Rider */}
                {activeRiderTab === 'TECHNICAL' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div>
                        <div className="font-bold text-slate-200">Technical Rider Approval Status</div>
                        <div className="text-[11px] text-slate-400">Audio FOH, IEM mixes, microphones, and backline</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateArtist(selectedArtist.id, {
                              technicalRider: { ...selectedArtist.technicalRider, status: 'Approved' },
                            })
                          }
                          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                        >
                          Approve Rider
                        </button>
                        <button
                          onClick={() =>
                            onUpdateArtist(selectedArtist.id, {
                              technicalRider: { ...selectedArtist.technicalRider, status: 'Needs Revision' },
                            })
                          }
                          className="px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400">FOH Audio Console</div>
                        <div className="font-semibold text-slate-200">{selectedArtist.technicalRider.fohConsole}</div>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400">Monitor / IEM Mixes</div>
                        <div className="font-semibold text-slate-200">
                          {selectedArtist.technicalRider.monitorConsole} ({selectedArtist.technicalRider.iemChannelsCount} Stereo Mixes)
                        </div>
                      </div>
                    </div>

                    {/* Backline List */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-200">Stage Backline Specifications:</div>
                      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
                        {((selectedArtist.technicalRider?.backline || selectedArtist.technicalRider?.backlineList || []) as string[]).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Microphones List */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-200">Microphone & Wireless Frequency Plan:</div>
                      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
                        {((selectedArtist.technicalRider?.microphones || selectedArtist.technicalRider?.microphoneSpec || []) as string[]).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-300">
                            <Radio className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage & Power */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Stage Dimensions & Risers</div>
                        <div className="text-slate-300">{selectedArtist.technicalRider?.stageDimensions || selectedArtist.technicalRider?.stageRequirement}</div>
                        <div className="text-[11px] text-indigo-300 mt-1">
                          {(selectedArtist.technicalRider?.risers || []).join(' • ')}
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Electrical & Grounding</div>
                        <div className="text-slate-300">{selectedArtist.technicalRider?.powerRequirements || selectedArtist.technicalRider?.powerRequirement}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Hospitality Rider */}
                {activeRiderTab === 'HOSPITALITY' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>Dressing Room Specs</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {selectedArtist.hospitalityRider?.dressingRoomCount ? `${selectedArtist.hospitalityRider.dressingRoomCount} Private Rooms Required` : 'Private Dressing Room'}
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          {selectedArtist.hospitalityRider?.dressingRoomSpecs || selectedArtist.hospitalityRider?.dressingRooms || 'AC, full-length mirror, sofa, private restroom.'}
                        </p>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Catering & Entourage Meals</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {selectedArtist.hospitalityRider?.cateringMealsCount ? `${selectedArtist.hospitalityRider.cateringMealsCount} Pax Hot Meals` : 'Full Band & Crew Catering'}
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          {selectedArtist.hospitalityRider?.dietaryRestrictions || (Array.isArray(selectedArtist.hospitalityRider?.foodAndBeverage) ? selectedArtist.hospitalityRider.foodAndBeverage.join(', ') : 'Mineral water, local coffee, fresh fruit, warm snacks')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5" />
                          <span>Hotel Accommodation</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {selectedArtist.hospitalityRider?.hotelRooms?.hotelStarRating ? `${selectedArtist.hospitalityRider.hotelRooms.hotelStarRating}-Star Hotel` : (selectedArtist.accommodationDetail || '4-5 Star Hospitality')}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1">
                          {selectedArtist.hospitalityRider?.hotelRooms ? (
                            `${selectedArtist.hospitalityRider.hotelRooms.suiteRooms} Suite Room(s) • ${selectedArtist.hospitalityRider.hotelRooms.deluxeRooms} Deluxe • ${selectedArtist.hospitalityRider.hotelRooms.twinRooms} Twin Rooms`
                          ) : (
                            selectedArtist.hospitalityRider?.hotelRequirement || 'Standard artist delegation allocation'
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Security Passes Quota</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono">
                            AAA: {selectedArtist.hospitalityRider?.securityPassesQuota?.allAccess || 10}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono">
                            Crew: {selectedArtist.hospitalityRider?.securityPassesQuota?.workingCrew || 15}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                            VIP: {selectedArtist.hospitalityRider?.securityPassesQuota?.vipGuest || selectedArtist.hospitalityRider?.guestListQuota || 10}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Ground Transportation & Fleet</div>
                      <div className="text-slate-200 font-medium">{selectedArtist.hospitalityRider?.transportation || 'Dedicated VIP Van / HiAce + Alphard'}</div>
                      <div className="text-[11px] text-slate-400">{selectedArtist.hospitalityRider?.groundTransfersNotes || selectedArtist.hospitalityRider?.securityDetail || 'Airport pickup & venue transfer included'}</div>
                    </div>
                  </div>
                )}

                {/* 3. Contract & Payments */}
                {activeRiderTab === 'CONTRACT' && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">Performance Fee Agreement</div>
                        <div className="text-xs text-slate-400">
                          Total Contract Value: <strong className="text-slate-200 font-mono">{formatIDR(selectedArtist.fee)}</strong>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                        Contract: {selectedArtist.contractStatus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-slate-200">Termin Pembayaran (Payment Milestones):</div>
                      <div className="space-y-2">
                        {(selectedArtist.paymentMilestones || (selectedArtist.contract?.milestones?.map((m: any) => ({
                          label: m.name,
                          percentage: m.percentage,
                          amount: m.amount,
                          dueDate: m.dueDate,
                          status: m.status === 'PAID' ? 'Paid' : 'Pending',
                        })) || [
                          { label: 'Down Payment (DP)', percentage: 50, amount: selectedArtist.fee * 0.5, dueDate: '2027-04-15', status: 'Paid' },
                          { label: 'H-7 Final Settlement', percentage: 50, amount: selectedArtist.fee * 0.5, dueDate: '2027-05-10', status: 'Pending' },
                        ])).map((m: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-slate-200">
                                {m.label} ({m.percentage}%)
                              </div>
                              <div className="text-[11px] text-slate-400">Jatuh Tempo: {m.dueDate}</div>
                            </div>

                            <div className="text-right">
                              <div className="font-mono font-bold text-slate-200">{formatIDR(m.amount)}</div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  m.status === 'Paid'
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    : 'bg-amber-950 text-amber-400 border-amber-800'
                                }`}
                              >
                                {m.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select an artist to view technical and hospitality riders.
            </div>
          )}
        </div>
      </div>

      {/* Add Artist Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Artist / Talent to Event</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Artist / Band Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maliq & D'Essentials"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Billing Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Artist['type'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Headliner">Headliner</option>
                    <option value="Supporting">Supporting</option>
                    <option value="Opening Act">Opening Act</option>
                    <option value="Guest Star">Guest Star</option>
                    <option value="MC">MC / Host</option>
                    <option value="DJ">DJ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Management / Agency</label>
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Booking Fee (IDR)</label>
                  <input
                    type="number"
                    step="5000000"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Add Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
