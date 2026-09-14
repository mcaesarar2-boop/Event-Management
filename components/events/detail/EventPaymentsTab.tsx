'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Building,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PaymentRequest, Event, PaymentApprovalStatus } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface EventPaymentsTabProps {
  event: Event;
  payments: PaymentRequest[];
  onCreatePayment: (req: Omit<PaymentRequest, 'id' | 'voucherNumber'>) => void;
  onUpdatePaymentStatus: (id: string, status: PaymentApprovalStatus, approverName?: string) => void;
}

export function EventPaymentsTab({
  event,
  payments,
  onCreatePayment,
  onUpdatePaymentStatus,
}: EventPaymentsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [category, setCategory] = useState<PaymentRequest['category']>('Vendor');
  const [amount, setAmount] = useState(35000000);
  const [dueDate, setDueDate] = useState('2026-06-01');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('883-0291-882');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  const totalDisbursed = payments
    .filter((p) => p.status === 'DISBURSED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status !== 'DISBURSED' && p.status !== 'REJECTED')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = filterStatus === 'ALL'
    ? payments
    : payments.filter((p) => p.status === filterStatus);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryName.trim() || !description.trim()) return;

    // Determine initial approval status based on threshold
    const amt = Number(amount);
    const initialStatus: PaymentApprovalStatus = amt > 50000000 ? 'PENDING_FINANCE' : 'PENDING_PM';

    onCreatePayment({
      eventId: event.id,
      beneficiaryName,
      category,
      amount: amt,
      dueDate,
      description,
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountHolder: bankAccountHolder || beneficiaryName,
      },
      status: initialStatus,
      submittedBy: 'Finance Ops Coordinator',
      notes: amt > 50000000 ? 'Tier-2 Finance Director signoff required' : 'Tier-1 PM signoff required',
    });

    setIsModalOpen(false);
    setBeneficiaryName('');
    setDescription('');
    setAmount(35000000);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Disbursements, Banking & Approval Sign-offs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Two-tier approval governance: PM approval up to Rp 50M, Finance Director for larger commitments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Request Disbursement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Requested Vouchers</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{payments.length} Vouchers</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Vendors, riders & crew payroll</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Disbursed via RTGS/BCA</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatCompactIDR(totalDisbursed)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Realized cash outflow</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Pending Sign-off Queue</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{formatCompactIDR(totalPending)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting PM or Finance action</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Approval Limit Rule</div>
          <div className="text-sm font-bold text-slate-200 mt-1">Tier-1: &le; 50M (PM)</div>
          <div className="text-[11px] text-indigo-400 mt-0.5">Tier-2: &gt; 50M (Finance Dir)</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {['ALL', 'PENDING_PM', 'PENDING_FINANCE', 'APPROVED', 'DISBURSED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Approval State</th>
                <th className="py-3 px-4 text-right">Sign-off Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    {p.voucherNumber}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{p.beneficiaryName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.bankDetails.bankName} - {p.bankDetails.accountNumber} ({p.bankDetails.accountHolder})
                    </div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-200 line-clamp-1">{p.description}</div>
                    <div className="text-[10px] text-indigo-300">{p.category}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-100">
                    {formatIDR(p.amount)}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                    {p.dueDate}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        p.status === 'DISBURSED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : p.status === 'APPROVED'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : p.status === 'PENDING_FINANCE'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : p.status === 'PENDING_PM'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === 'PENDING_PM' && (
                        <button
                          onClick={() => onUpdatePaymentStatus(p.id, 'APPROVED', 'Bima Satria (PM)')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition"
                        >
                          Approve (PM)
                        </button>
                      )}

                      {p.status === 'PENDING_FINANCE' && (
                        <button
                          onClick={() => onUpdatePaymentStatus(p.id, 'APPROVED', 'Siti Rahma (Finance Dir)')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition"
                        >
                          Sign-off (Dir)
                        </button>
                      )}

                      {p.status === 'APPROVED' && (
                        <button
                          onClick={() => onUpdatePaymentStatus(p.id, 'DISBURSED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition"
                        >
                          Disburse
                        </button>
                      )}

                      {p.status === 'DISBURSED' && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Disbursement Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden cursor-default"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Create Disbursement Request Voucher</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Beneficiary / Recipient *</label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. PT Soundworks Audio Indonesia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PaymentRequest['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Vendor">Vendor</option>
                    <option value="Artist Fee">Artist Fee</option>
                    <option value="Venue">Venue</option>
                    <option value="Permits & Legal">Permits & Legal</option>
                    <option value="Crew Honorarium">Crew Honorarium</option>
                    <option value="Production Operational">Production Operational</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Amount (IDR)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Payment Purpose / Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. DP 50% Sound System L-Acoustics K2 Main Stage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Account No.</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
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
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
