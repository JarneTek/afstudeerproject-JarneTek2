"use client";
 
import { useState } from "react";
import Pagination from "../pagination/pagination";
import { OrderWithDetails } from "@/types/orders";
 
interface PendingOrdersViewProps {
  orders: OrderWithDetails[];
  handleConfirmOrder: (orderId: string) => void;
  confirmingOrderId: string | null;
  confirmMessage: string | null;
  confirmError: string | null;
}
 
export default function PendingOrdersView({
  orders,
  handleConfirmOrder,
  confirmingOrderId,
  confirmMessage,
  confirmError,
}: PendingOrdersViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
 
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
 
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Click <span className="font-medium text-brand-navy">Set to confirmed</span> to change an order status.
      </p>
      {confirmMessage && (
        <div className="text-sm text-green-700">{confirmMessage}</div>
      )}
      {confirmError && (
        <div className="text-sm text-red-600">{confirmError}</div>
      )}
      {orders.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No pending orders.
        </div>
      ) : (
        <>
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-brand-navy">
                    {order.member.firstName} {order.member.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-sm font-semibold">
                    €{Number(order.totalPrice).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleConfirmOrder(order.id)}
                  disabled={confirmingOrderId === order.id}
                  className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-navy-light disabled:opacity-60"
                >
                  {confirmingOrderId === order.id
                    ? "Confirming..."
                    : "Set to confirmed"}
                </button>
              </div>
              <ul className="mt-4 border-t border-gray-100 pt-4 space-y-1 text-sm text-gray-600">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product.name} ({item.size})
                    </span>
                    <span>
                      €{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
