'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  X,
  Trash2,
  Sparkles,
  Layers,
  ListTodo,
  Columns,
} from 'lucide-react';
import { Task, Event, TaskStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface EventPlanningTabProps {
  event: Event;
  tasks: Task[];
  onCreateTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask?: (id: string) => void;
  onGenerateChecklist?: (eventId: string) => void;
}

export function EventPlanningTab({
  event,
  tasks,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onGenerateChecklist,
}: EventPlanningTabProps) {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'CHECKLIST' | 'TIMELINE'>('CHECKLIST');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState(event.pics.projectManager);
  const [category, setCategory] = useState('Production');
  const [priority, setPriority] = useState<Task['priority']>('HIGH');
  const [dueDate, setDueDate] = useState(event.setupDate?.split('T')[0] || '2026-06-11');
  const [notes, setNotes] = useState('');

  const now = new Date().toISOString().split('T')[0];

  const columns: Array<{ status: TaskStatus; label: string; color: string }> = [
    { status: 'To Do', label: 'To Do', color: 'border-slate-700' },
    { status: 'In Progress', label: 'In Progress', color: 'border-indigo-500' },
    { status: 'Review', label: 'In Review', color: 'border-amber-500' },
    { status: 'Completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTask({
      eventId: event.id,
      name,
      category,
      assignee,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'To Do',
      notes,
    });

    setIsModalOpen(false);
    setName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Operations Planning & Master Task Checklist
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage rigging, permits, artist hospitalities, and rehearsal milestone assignments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onGenerateChecklist && (
            <button
              onClick={() => onGenerateChecklist(event.id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Isi checklist standar event otomatis"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Isi Checklist Standar</span>
            </button>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('CHECKLIST')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                viewMode === 'CHECKLIST' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                viewMode === 'KANBAN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                viewMode === 'TIMELINE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Timeline Gantt</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 1. TIMELINE GANTT VIEW */}
      {viewMode === 'TIMELINE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Production Timeline Roadmap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rangkaian fase load-in, staging, rehearsal, hingga show day untuk {event.name}
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold border border-slate-700">
              {event.code}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: '1. Load-In Logistik & Rigging Truss',
                date: event.loadInDate?.split('T')[0] || event.startDate?.split('T')[0],
                time: '08:00 WIB',
                pic: event.pics?.productionPIC || 'Hendra Setiawan',
                color: 'bg-sky-500',
                badge: 'LOAD-IN',
              },
              {
                name: '2. Staging, Sound System & LED Wall Setup',
                date: event.setupDate?.split('T')[0] || event.startDate?.split('T')[0],
                time: '09:00 WIB',
                pic: event.pics?.technicalPIC || 'Ir. Johanes Handoko',
                color: 'bg-amber-500',
                badge: 'STAGING & AV',
              },
              {
                name: '3. Technical Rehearsal & Soundcheck Talent',
                date: event.technicalRehearsalDate?.split('T')[0] || event.eventDayDate?.split('T')[0],
                time: '14:00 WIB',
                pic: event.pics?.creativePIC || 'Sound Engineer',
                color: 'bg-purple-500',
                badge: 'SOUNDCHECK',
              },
              {
                name: '4. General Rehearsal (GR) Full Flow Run-through',
                date: event.generalRehearsalDate?.split('T')[0] || event.eventDayDate?.split('T')[0],
                time: '19:00 WIB',
                pic: event.pics?.projectManager || 'Show Caller',
                color: 'bg-violet-500',
                badge: 'DRESS REHEARSAL',
              },
              {
                name: '5. MAIN EVENT SHOW DAY (Live Performance)',
                date: event.eventDayDate?.split('T')[0] || event.startDate?.split('T')[0],
                time: '15:00 - 23:00 WIB',
                pic: event.pics?.eventPIC || 'Floor Manager',
                color: 'bg-rose-500',
                badge: 'SHOW DAY (D-DAY)',
              },
              {
                name: '6. Strike Dismantle & Rigging Teardown',
                date: event.strikeDate?.split('T')[0] || event.endDate?.split('T')[0],
                time: '00:00 WIB',
                pic: event.pics?.productionPIC || 'Production Lead',
                color: 'bg-orange-500',
                badge: 'STRIKE',
              },
              {
                name: '7. Load-Out, Venue Cleaning & Handover',
                date: event.loadOutDate?.split('T')[0] || event.endDate?.split('T')[0],
                time: '20:00 WIB',
                pic: event.pics?.projectManager || 'Operations Lead',
                color: 'bg-emerald-500',
                badge: 'HANDOVER',
              },
            ].map((stg, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stg.color} flex-shrink-0`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{stg.name}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {stg.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PIC: {stg.pic} &middot; Jam: {stg.time}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatDate(stg.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className={`p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between border-t-2 ${col.color}`}>
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="p-2 space-y-2.5 min-h-[300px] max-h-[650px] overflow-y-auto">
                  {colTasks.map((t) => {
                    const isOverdue = t.status !== 'Completed' && t.dueDate < now;
                    return (
                      <div
                        key={t.id}
                        className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              t.priority === 'URGENT'
                                ? 'bg-rose-950 text-rose-400 border-rose-800'
                                : t.priority === 'HIGH'
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-indigo-400 font-medium truncate max-w-[110px]">
                            {t.category}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-200 leading-snug">{t.name}</div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[80px]">{t.assignee}</span>
                          </div>

                          <div className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{t.dueDate}</span>
                          </div>
                        </div>

                        {/* Move Status Buttons */}
                        <div className="pt-1 flex items-center justify-end gap-1">
                          {col.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                const nextStatus: TaskStatus =
                                  col.status === 'To Do' ? 'In Progress' : col.status === 'In Progress' ? 'Review' : 'Completed';
                                onUpdateTaskStatus(t.id, nextStatus);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-200 flex items-center gap-1 hover:underline"
                            >
                              <span>Next stage</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="text-center py-10 text-[11px] text-slate-400 italic">No tasks in this lane</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. CHECKLIST VIEW */}
      {viewMode === 'CHECKLIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">Status</th>
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((t) => {
                const isCompleted = t.status === 'Completed';

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-800/40 transition group ${
                      isCompleted ? 'bg-slate-950/30 text-slate-500' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateTaskStatus(t.id, isCompleted ? 'To Do' : 'Completed')
                        }
                        className={`transition rounded ${
                          isCompleted
                            ? 'text-emerald-400'
                            : 'text-slate-600 hover:text-indigo-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {t.name}
                    </td>
                    <td className="py-3 px-4 text-indigo-300">{t.category}</td>
                    <td className="py-3 px-4 text-slate-300">{t.assignee}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          t.priority === 'CRITICAL' || t.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.dueDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isCompleted
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : t.status === 'In Progress'
                            ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                            : t.status === 'Review'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={t.status}
                          onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {onDeleteTask && (
                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    Belum ada tugas operasional untuk event ini. Klik &quot;Isi Checklist Standar&quot; di atas untuk mengisi otomatis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Operational Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Finalisasi izin keramaian Polda DIY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Audio & FOH">Audio & FOH</option>
                    <option value="Legal & Permits">Legal & Permits</option>
                    <option value="Talent Hospitality">Talent Hospitality</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Assignee</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or links"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
