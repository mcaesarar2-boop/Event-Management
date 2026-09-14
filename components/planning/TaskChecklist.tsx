'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  ListTodo,
  Columns,
  X,
  Edit2,
} from 'lucide-react';
import { Task, Event, TaskStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface TaskChecklistProps {
  events: Event[];
  tasks: Task[];
  onSelectEvent?: (eventId: string) => void;
  onCreateTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask?: (id: string) => void;
  onGenerateChecklist?: (eventId: string) => void;
}

export function TaskChecklist({
  events,
  tasks,
  onSelectEvent,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onGenerateChecklist,
}: TaskChecklistProps) {
  const [viewMode, setViewMode] = useState<'CHECKLIST' | 'KANBAN'>('CHECKLIST');
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [formEventId, setFormEventId] = useState(events[0]?.id || '');
  const [assignee, setAssignee] = useState('Bima Satria Wardhana');
  const [category, setCategory] = useState('Production & Staging');
  const [priority, setPriority] = useState<Task['priority']>('HIGH');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Categories list
  const defaultCategories = [
    'Licensing & Permits',
    'Talent & Artist',
    'Production & Staging',
    'Audio Visual',
    'Show Management',
    'Safety & Security',
    'Logistics & Crew',
    'Operations',
    'Finance & Administration',
  ];

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesEvent = selectedEventId === 'ALL' || task.eventId === selectedEventId;
      const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;
      const matchesSearch =
        !searchQuery ||
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesEvent && matchesCategory && matchesPriority && matchesSearch;
    });
  }, [tasks, selectedEventId, selectedCategory, selectedPriority, searchQuery]);

  // Statistics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const criticalCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'Completed').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Group tasks by category for Checklist Mode
  const tasksByCategory = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach((t) => {
      const cat = t.category || 'General Operations';
      const cur = map.get(cat) || [];
      cur.push(t);
      map.set(cat, cur);
    });
    return map;
  }, [filteredTasks]);

  // Kanban Columns
  const kanbanColumns: Array<{ status: TaskStatus; label: string; color: string; border: string }> = [
    { status: 'To Do', label: 'To Do', color: 'bg-slate-900', border: 'border-slate-800' },
    { status: 'In Progress', label: 'In Progress', color: 'bg-indigo-950/40', border: 'border-indigo-800/60' },
    { status: 'Review', label: 'In Review', color: 'bg-amber-950/40', border: 'border-amber-800/60' },
    { status: 'Completed', label: 'Completed', color: 'bg-emerald-950/40', border: 'border-emerald-800/60' },
  ];

  const handleToggleTask = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    onUpdateTaskStatus(task.id, newStatus);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTask({
      eventId: formEventId || events[0]?.id || 'evt-default',
      name,
      category,
      assignee,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'To Do',
      description,
      notes: description,
    });

    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const handleTriggerGenerate = () => {
    const targetEventId = selectedEventId !== 'ALL' ? selectedEventId : events[0]?.id;
    if (targetEventId && onGenerateChecklist) {
      onGenerateChecklist(targetEventId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              Operations Tasks & Master Checklist
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
              {filteredTasks.length} Tugas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen tugas operasional event: perizinan, soundcheck, riders talent, safety briefing, dan handover
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {events.length > 0 && onGenerateChecklist && (
            <button
              onClick={handleTriggerGenerate}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Generate checklist standar industri event"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Template Checklist Standar</span>
            </button>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('CHECKLIST')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'CHECKLIST' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'KANBAN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tingkat Penyelesaian
            </p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{completionRate}%</h3>
            <div className="w-32 bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tugas Selesai (Done)
            </p>
            <h3 className="text-xl font-bold text-emerald-400 mt-0.5">
              {completedTasksCount}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {totalTasksCount} Total</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tersisa {totalTasksCount - completedTasksCount} tugas</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sedang Dikerjakan
            </p>
            <h3 className="text-xl font-bold text-amber-400 mt-0.5">{inProgressCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Dalam proses review & eksekusi</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tugas Kritis (Critical)
            </p>
            <h3 className="text-xl font-bold text-rose-400 mt-0.5">{criticalCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Membutuhkan perhatian segera</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, PIC, atau catatan..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Event Filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Event Portfolio</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.code}: {evt.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            {defaultCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* VIEW: CHECKLIST MODE */}
      {viewMode === 'CHECKLIST' && (
        <div className="space-y-4">
          {tasksByCategory.size === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
              <CheckSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-200">Tidak ada tugas yang ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan tombol &quot;Template Checklist Standar&quot; di atas untuk mengisi checklist secara instan.
              </p>
            </div>
          ) : (
            Array.from(tasksByCategory.entries()).map(([categoryName, categoryTasks]) => {
              const categoryDone = categoryTasks.filter((t) => t.status === 'Completed').length;
              const categoryRate = Math.round((categoryDone / categoryTasks.length) * 100);

              return (
                <div
                  key={categoryName}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
                >
                  {/* Category Header */}
                  <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <h3 className="text-xs font-bold text-slate-100">{categoryName}</h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({categoryDone}/{categoryTasks.length} selesai &middot; {categoryRate}%)
                      </span>
                    </div>

                    <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${categoryRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tasks in Category */}
                  <div className="divide-y divide-slate-800/60">
                    {categoryTasks.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      const matchingEvent = events.find((e) => e.id === task.eventId);

                      return (
                        <div
                          key={task.id}
                          className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 transition group hover:bg-slate-850/40 ${
                            isCompleted ? 'bg-slate-950/20 text-slate-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Clickable Checkbox */}
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className={`mt-0.5 flex-shrink-0 transition rounded text-slate-400 hover:text-indigo-400 ${
                                isCompleted ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>

                            {/* Task Content */}
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-semibold ${
                                    isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                                  }`}
                                >
                                  {task.name}
                                </span>

                                {/* Priority Badge */}
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    task.priority === 'CRITICAL'
                                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                      : task.priority === 'HIGH'
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {task.priority}
                                </span>

                                {matchingEvent && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                                    {matchingEvent.code}
                                  </span>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                              )}

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-0.5">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {task.assignee}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Target: {formatDate(task.dueDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                            {/* Status Selector */}
                            <select
                              value={task.status}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className={`text-[10px] font-bold rounded px-2 py-1 border bg-slate-950 focus:outline-none ${
                                task.status === 'Completed'
                                  ? 'text-emerald-300 border-emerald-800'
                                  : task.status === 'In Progress'
                                  ? 'text-indigo-300 border-indigo-800'
                                  : task.status === 'Review'
                                  ? 'text-amber-300 border-amber-800'
                                  : 'text-slate-400 border-slate-800'
                              }`}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">In Review</option>
                              <option value="Completed">Completed</option>
                            </select>

                            {onDeleteTask && (
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Hapus Tugas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: KANBAN MODE */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[450px]"
              >
                {/* Column Header */}
                <div className={`p-3 border-b ${col.border} flex items-center justify-between ${col.color}`}>
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>{col.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {colTasks.length}
                    </span>
                  </h3>
                </div>

                {/* Column Body Cards */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 leading-snug">{task.name}</h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{task.assignee}</span>

                        {/* Quick Kanban Status Advance */}
                        <div className="flex items-center gap-1">
                          {col.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                const nextStatus: TaskStatus =
                                  col.status === 'To Do'
                                    ? 'In Progress'
                                    : col.status === 'In Progress'
                                    ? 'Review'
                                    : 'Completed';
                                onUpdateTaskStatus(task.id, nextStatus);
                              }}
                              className="px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium"
                              title="Pindah ke status berikutnya"
                            >
                              &rarr;
                            </button>
                          )}
                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-10 text-[11px] text-slate-600">
                      Tidak ada tugas {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Tugas */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Tambah Tugas Operasional Baru</h3>
                  <p className="text-[11px] text-slate-400">
                    Delegasikan checklist panggung, perizinan, soundcheck, atau riders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nama Tugas / Checklist *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kalibrasi Audio FOH & Line-Array Delay Tower"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Event Terkait</label>
                  <select
                    value={formEventId}
                    onChange={(e) => setFormEventId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.code} - {evt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {defaultCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">PIC / Penanggung Jawab</label>
                  <input
                    type="text"
                    required
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">CRITICAL (Mendesak)</option>
                    <option value="HIGH">HIGH (Tinggi)</option>
                    <option value="MEDIUM">MEDIUM (Sedang)</option>
                    <option value="LOW">LOW (Rendah)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tenggat Waktu (Due)</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Catatan / Rincian Pekerjaan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruksi khusus, vendor terkait, atau checklist poin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
