'use client';

import React, { useState } from 'react';
import { X, Sparkles, Calendar, Building2, MapPin, DollarSign, Users, ShieldCheck } from 'lucide-react';
import { Client, Venue, EventTemplate, EventType, EventPriority } from '@/lib/types';

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  venues: Venue[];
  templates: EventTemplate[];
  onCreateEvent: (data: any) => void;
}

export function EventCreateModal({
  isOpen,
  onClose,
  clients,
  venues,
  templates,
  onCreateEvent,
}: EventCreateModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Concert');
  const [priority, setPriority] = useState<EventPriority>('HIGH');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [templateId, setTemplateId] = useState(templates[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [loadInDate, setLoadInDate] = useState('2026-06-28');
  const [eventDayDate, setEventDayDate] = useState('2026-07-01');
  const [attendance, setAttendance] = useState(5000);
  const [budget, setBudget] = useState(750000000);
  const [revenue, setRevenue] = useState(1100000000);
  const [description, setDescription] = useState('');
  const [projectManager, setProjectManager] = useState('Bima Satria Wardhana');
  const [technicalPIC, setTechnicalPIC] = useState('Ir. Johanes Handoko');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateEvent({
      name,
      type,
      priority,
      clientId,
      venueId,
      templateId: templateId || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(startDate).toISOString(),
      loadInDate: new Date(loadInDate).toISOString(),
      eventDayDate: new Date(eventDayDate).toISOString(),
      expectedAttendance: Number(attendance),
      totalBudget: Number(budget),
      totalRevenue: Number(revenue),
      description,
      pics: {
        projectManager,
        eventPIC: projectManager,
        financePIC: 'Ratna Ayu Larasati',
        productionPIC: 'Hendra Setiawan',
        technicalPIC,
        creativePIC: 'Nadia Putri',
        salesPIC: projectManager,
      },
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 cursor-default"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Create New Production Event</h2>
              <p className="text-[11px] text-slate-400">
                Initialize event with operational templates, financial target, and talent roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Event Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jakarta Summer Fest 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="University Festival">University Festival</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Conference">Conference</option>
                <option value="Brand Activation">Brand Activation</option>
                <option value="Government Event">Government Event</option>
              </select>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-1 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Apply Operational Template (Auto-seeds Checklist & Rundown)
              </label>
            </div>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 mt-1"
            >
              <option value="">None (Blank Slate)</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.eventType}) - {tpl.defaultMilestones.length} Milestones, {tpl.defaultChecklist.length} Tasks
                </option>
              ))}
            </select>
          </div>

          {/* Client and Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Client / Organizer
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.company} ({cli.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Venue & City
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {venues.map((ven) => (
                  <option key={ven.id} value={ven.id}>
                    {ven.name} ({ven.city} &middot; {ven.capacity.toLocaleString()} pax)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Load In Date</label>
              <input
                type="date"
                value={loadInDate}
                onChange={(e) => setLoadInDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Main Event Day</label>
              <input
                type="date"
                value={eventDayDate}
                onChange={(e) => setEventDayDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Attendance</label>
              <input
                type="number"
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Financials: Budget & Revenue Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                Total Budget Allocation (IDR)
              </label>
              <input
                type="number"
                step="10000000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">
                Rp {Number(budget).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Target Gross Revenue (IDR)
              </label>
              <input
                type="number"
                step="10000000"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">
                Rp {Number(revenue).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* PICs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Project Manager</label>
              <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Technical Director</label>
              <input
                type="text"
                value={technicalPIC}
                onChange={(e) => setTechnicalPIC(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Brief Scope & Objectives</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event concept, key production goals, crowd management specifics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              Create Production Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
