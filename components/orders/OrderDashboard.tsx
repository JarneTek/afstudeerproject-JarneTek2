"use client";
 
import { useClub } from "@/providers/clubprovider";
import { confirmOrder, toggleOrderStatus } from "@/lib/actions/orders";
import { useState } from "react";
import { FittingDay } from "@prisma/client";
import OrderSummaryView from "./OrderSummaryView";
import { OrderWithDetails } from "@/types/orders";
import IndividualOrdersView from "./IndividualOrdersView";
import PendingOrdersView from "./PendingOrdersView";
 
export default function OrderDashboard({
  fittingdays,
  initialOrders,
}: {
  fittingdays: FittingDay[];
  initialOrders: OrderWithDetails[];
}) {
  const { selectedClub } = useClub();
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"summary" | "individual" | "pending">("summary");
  const [activeFittingDay, setActiveFittingDay] = useState<string | null>(null);
 
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [togglingOrderId, setTogglingOrderId] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
 
  const handleConfirmOrder = async (orderId: string) => {
    setConfirmError(null);
    setConfirmMessage(null);
    setConfirmingOrderId(orderId);
 
    const res = await confirmOrder(orderId);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
      );
      setConfirmMessage("The order was marked as CONFIRMED and removed from Pending Orders.");
    } else {
      setConfirmError("Could not confirm this order. Please try again.");
    }
    setConfirmingOrderId(null);
  };
 
  const handleSetToPending = async (orderId: string) => {
    setTogglingOrderId(orderId);
    const res = await toggleOrderStatus(orderId, "PENDING");
    if (res.error) {
      alert(res.error);
    } else {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "PENDING" } : o)));
    }
    setTogglingOrderId(null);
  };
 
  if (!selectedClub) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No club selected.
      </div>
    );
  }
 
  const filteredOrders = activeFittingDay
    ? orders.filter((o) => o.fittingDayId === activeFittingDay)
    : orders;
 
  const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING");
 
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Order Overview</h1>
            <p className="text-gray-500 text-sm">{filteredOrders.length} orders</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Filter by Fitting Day:</span>
            <select
              value={activeFittingDay || ""}
              onChange={(e) => setActiveFittingDay(e.target.value || null)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-navy focus:border-brand-navy block p-2.5 outline-none"
            >
              <option value="">All Fitting Days</option>
              {fittingdays.map((day) => (
                <option key={day.id} value={day.id}>
                  {new Date(day.date).toLocaleDateString("en-GB")} - {day.location}
                </option>
              ))}
            </select>
          </div>
        </div>
 
        <div className="flex gap-2">
          {["summary", "individual", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "summary" | "individual" | "pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-brand-navy text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "pending" ? `(${pendingOrders.length})` : "Orders"}
            </button>
          ))}
        </div>
 
        {activeTab === "summary" && (
          <OrderSummaryView
            fittingdays={fittingdays}
            activeFittingDay={activeFittingDay}
            orders={filteredOrders}
          />
        )}
 
        {activeTab === "individual" && (
          <IndividualOrdersView
            orders={filteredOrders}
            handleSetToPending={handleSetToPending}
            togglingOrderId={togglingOrderId}
          />
        )}
 
        {activeTab === "pending" && (
          <PendingOrdersView
            orders={pendingOrders}
            handleConfirmOrder={handleConfirmOrder}
            confirmingOrderId={confirmingOrderId}
            confirmMessage={confirmMessage}
            confirmError={confirmError}
          />
        )}
      </div>
    </div>
  );
}
