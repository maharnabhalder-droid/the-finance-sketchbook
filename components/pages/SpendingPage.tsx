"use client";

import React, { useState } from "react";
import { Search, Filter, Trash2, Tag, Calendar, Plus } from "lucide-react";
import { DayState, ExpenseCategory } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";
import { QuickAddExpenseModal } from "../QuickAddExpenseModal";

interface SpendingPageProps {
  dayState: DayState;
}

export function SpendingPage({ dayState }: SpendingPageProps) {
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  for (const tx of transactions) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  }

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategorySpend = Math.max(...Object.values(categoryTotals), 1);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Category Watercolor Breakdown Bars */}
      <div className="sketch-card p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-paper-border dark:border-ink-800">
          <div>
            <h3 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
              Category Distribution
            </h3>
            <p className="text-xs text-ink-500">
              Total Recorded Spending: <strong>{formatINR(dayState.totalSpent)}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brass text-white hover:bg-brass-dark flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Spend</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categoryEntries.map(([cat, total]) => {
            const percentOfTotal = Math.round((total / Math.max(1, dayState.totalSpent)) * 100);
            const barWidth = Math.min(100, Math.round((total / maxCategorySpend) * 100));

            return (
              <div
                key={cat}
                className="p-3 rounded-xl bg-parchment-50 dark:bg-ink-800/40 border border-paper-border/70 dark:border-ink-700/60"
                data-lens-title={`Category: ${cat}`}
                data-lens-formula={`${formatINR(total)} ÷ Total Spends (${formatINR(dayState.totalSpent)})`}
                data-lens-value={`${percentOfTotal}% of all spends`}
                data-lens-explanation={`You have spent ${formatINR(total)} across 12 days in ${cat}.`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-ink-800 dark:text-ink-100">{cat}</span>
                  <span className="font-mono font-bold text-ink-900 dark:text-ink-50">
                    {formatINR(total)} ({percentOfTotal}%)
                  </span>
                </div>
                {/* Watercolor fill bar */}
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full watercolor-wash-green transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
          <input
            type="text"
            placeholder="Search by vendor, Swiggy, UPI note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-paper-border dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "Food & Dining", "Transport & Commute", "Shopping & Personal", "Entertainment & Gaming"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-brass text-white font-bold"
                  : "bg-black/5 dark:bg-white/5 text-ink-600 dark:text-ink-300 hover:bg-black/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="sketch-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-parchment-100 dark:bg-ink-800/80 border-b border-paper-border dark:border-ink-700 text-ink-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Day</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border/60 dark:divide-ink-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400 italic font-sans">
                    No transactions found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-brass">
                      Day {tx.day}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-ink-900 dark:text-ink-100 block">
                        {tx.title}
                      </span>
                      {tx.note && (
                        <span className="text-[11px] text-ink-500 italic block">
                          "{tx.note}"
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-ink-700 dark:text-ink-300 font-mono">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {tx.isEssential ? (
                        <span className="text-sage-dark dark:text-sage-light font-bold">
                          Essential
                        </span>
                      ) : (
                        <span className="text-ink-400">Discretionary</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-ink-900 dark:text-ink-50">
                      -{formatINR(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 rounded text-ink-400 hover:text-vermilion hover:bg-vermilion/10 transition-colors opacity-70 group-hover:opacity-100"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
