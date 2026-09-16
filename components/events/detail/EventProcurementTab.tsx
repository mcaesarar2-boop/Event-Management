'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Building2,
  X,
} from 'lucide-react';
import { PurchaseOrder, Vendor, Event } from '@/lib/types';
import { formatIDR, formatCompactIDR, formatDate } from '@/lib/utils/format';

interface EventProcurementTabProps {
  event: Event;
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  onUpdatePOStatus: (id: string, status: PurchaseOrder['status']) => void;
}

export function EventProcurementTab({
  event,
  purchaseOrders,
  vendors,
  onCreatePO,
  onUpdatePOStatus,
}: EventProcurementTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(purchaseOrders[0] || null);

  // Form State
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(25000000);
  const [paymentTerms, setPaymentTerms] = useState('DP 50% saat PO diteken, Pelunasan 50% setelah load-in');
  const [deliveryDate, setDeliveryDate] = useState(event.loadInDate?.split('T')[0] || '2026-06-10');

  const totalCommittedPO = purchaseOrders
    .filter((p) => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + p.total, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === vendorId) || vendors[0];
    const subtotal = itemQty * itemUnitPrice;
    const tax = Math.round((subtotal * 11) / 100);
    const total = subtotal + tax;

    onCreatePO({
      eventId: event.id,
      vendorId: vendor.id,
      vendorName: vendor.company,
      items: [
        {
          description: itemDescription || 'Production Services & Equipment',
          quantity: itemQty,
          unit: 'Lot',
          unitPrice: itemUnitPrice,
          totalPrice: subtotal,
        },
      ],
      subtotal,
      tax,
      total,
      status: 'Issued',
      paymentTerms,
      deliveryDate,
      issuedBy: 'Hendra Setiawan (Production Lead)',
      approvedBy: 'Bima Satria Wardhana (Project Manager)',
    });

    setIsModalOpen(false);
    setItemDescription('');
    setItemUnitPrice(25000000);
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            Procurement & Purchase Orders (POs)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal vendor purchase agreements, tax invoices (PPN 11%), terms of payment, and delivery validation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            Committed PO Total: <strong className="text-emerald-400">{formatCompactIDR(totalCommittedPO)}</strong>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate PO</span>
          </button>
        </div>
      </div>

      {/* Grid: PO List & PO Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PO Records Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 font-semibold text-xs text-slate-200">
            Registered Purchase Orders ({purchaseOrders.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Total (Inc. Tax)</th>
                  <th className="py-3 px-4">Delivery</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => {
                  const isSelected = selectedPO?.id === po.id;
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className={`transition cursor-pointer ${
                        isSelected ? 'bg-indigo-950/40 text-indigo-200 font-medium' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {po.poNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{po.vendorName}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {po.items[0]?.description || 'Production equipment'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-100">
                        {formatIDR(po.total)}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {formatDate(po.deliveryDate)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            po.status === 'Fulfilled'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : po.status === 'Issued'
                              ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected PO Invoice Voucher Card (5 cols) */}
        <div className="lg:col-span-5">
          {selectedPO ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400">OFFICIAL PURCHASE ORDER</span>
                  <h3 className="text-base font-bold text-slate-100">{selectedPO.poNumber}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Vendor: {selectedPO.vendorName}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedPO.status}
                    onChange={(e) => onUpdatePOStatus(selectedPO.id, e.target.value as PurchaseOrder['status'])}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Issued">Issued</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items in PO */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Deliverable Line Items</div>
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 space-y-2">
                  {selectedPO.items.map((it, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">{it.description}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {it.quantity} {it.unit} &times; {formatIDR(it.unitPrice)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-100">{formatIDR(it.totalPrice)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation breakdown */}
              <div className="space-y-1.5 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatIDR(selectedPO.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (PPN 11%):</span>
                  <span>{formatIDR(selectedPO.tax)}</span>
                </div>
                <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-sm text-slate-100">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400">{formatIDR(selectedPO.total)}</span>
                </div>
              </div>

              {/* Terms & Delivery */}
              <div className="text-xs space-y-1 text-slate-300">
                <div>
                  <strong className="text-slate-400 text-[11px] uppercase">Payment Terms:</strong>
                  <p className="mt-0.5 text-slate-300">{selectedPO.paymentTerms}</p>
                </div>
                <div className="pt-2">
                  <strong className="text-slate-400 text-[11px] uppercase">Expected Delivery:</strong>
                  <p className="mt-0.5 text-slate-300">{formatDate(selectedPO.deliveryDate)} (Load In window)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
              Select a Purchase Order to view voucher details.
            </div>
          )}
        </div>
      </div>

      {/* Issue PO Modal */}
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
              <h3 className="text-sm font-bold text-slate-100">Generate New Purchase Order (PO)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Vendor</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.company} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Service / Equipment Description *</label>
                <input
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. Stage Rigging & Barricade Mojo 100m"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Unit Price (IDR)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={itemUnitPrice}
                    onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Delivery Deadline</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
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
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
