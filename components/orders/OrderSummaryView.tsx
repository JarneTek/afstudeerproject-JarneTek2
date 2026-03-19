"use client";

import { printOrderPDF } from "@/lib/helpers/print";
import { OrderWithDetails } from "@/types/orders";
import { useState } from "react";
import Pagination from "../pagination/pagination";
import { FittingDay } from "@prisma/client";

interface OrderSummaryViewProps {
  activeFittingDay: string | null;
  orders: OrderWithDetails[];
  fittingdays: FittingDay[];
}

export default function OrderSummaryView({
  activeFittingDay,
  orders,
  fittingdays,
}: OrderSummaryViewProps) {
  const summaryItems: {
    productName: string;
    size: string;
    quantity: number;
    totalPrice: number;
  }[] = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = summaryItems.find(
        (s) => s.productName === item.product.name && s.size === item.size,
      );
      if (existing) {
        existing.quantity += item.quantity;
        existing.totalPrice += Number(item.price) * item.quantity;
      } else {
        summaryItems.push({
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          totalPrice: Number(item.price) * item.quantity,
        });
      }
    });
  });
  function printPDF() {
    const selectedDay = fittingdays.find((d) => d.id === activeFittingDay);
    const title = selectedDay
      ? `Bestellingen – ${new Date(selectedDay.date).toLocaleDateString("nl-BE")}${selectedDay.location ? " – " + selectedDay.location : ""}`
      : "Bestellingen – Alle pasdagen";
    printOrderPDF({ title, summaryItems });
  }
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalSummaryPages = Math.ceil(summaryItems.length / pageSize);
  const paginatedSummaryItems = summaryItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {summaryItems.length === 0 ? (
        <div className="p-10 text-center text-gray-400 text-sm">
          No orders yet.
        </div>
      ) : (
        <>
          <button
            onClick={printPDF}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-brand-navy text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / PDF
          </button>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-brand-navy">
                <th className="px-4 py-3 font-semibold">Article</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Total Quantity</th>
                <th className="px-4 py-3 font-semibold">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSummaryItems.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-brand-navy">
                    {item.productName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.size}</td>
                  <td className="px-4 py-3 text-gray-500">{item.quantity}x</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.totalPrice.toFixed(2)} EUR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalSummaryPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
