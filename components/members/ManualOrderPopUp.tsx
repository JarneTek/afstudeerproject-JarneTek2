"use client";

import { useState, useEffect } from "react";
import { getFormItemsForMember } from "@/lib/actions/forms";
import { createManualOrder } from "@/lib/actions/orders";
import { Product } from "@prisma/client";

export default function ManualOrderPopUp({
  memberId,
  clubId,
}: {
  memberId: string;
  clubId: string;
}) {
  const [open, setOpen] = useState(false);
  const [formItems, setFormItems] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [size, setSize] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFormItemsForMember(memberId).then((data) =>
      setFormItems(data?.items.map((item) => item.product) || []),
    );
  }, [memberId]);
  useEffect(() => {
    setTotalPrice(
      selectedItems.reduce(
        (acc, item) => acc + item.defaultPrice * (quantity[item.id] || 1),
        0,
      ),
    );
  }, [selectedItems, quantity]);

  const handleCreateOrder = async () => {
    setLoading(true);
    const orderItems = selectedItems.map((item) => ({
      productId: item.id,
      size: size[item.id] || "",
      quantity: quantity[item.id] || 1,
      price: item.defaultPrice,
    }));

    await createManualOrder(memberId, orderItems, clubId, totalPrice);
    setLoading(false);
    setOpen(false);
    setSelectedItems([]);
  };

  return (
    <div>
      <button
        className="border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <h1>Manual Order</h1>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <button onClick={() => setOpen(false)}>Close</button>
            {formItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    €{item.defaultPrice.toFixed(2)}
                  </p>
                </div>
                <select
                  value={size[item.id] || ""}
                  onChange={(e) =>
                    setSize({ ...size, [item.id]: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-green"
                >
                  <option value="">Select Size</option>
                  {item.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={quantity[item.id] || 1}
                  onChange={(e) =>
                    setQuantity({
                      ...quantity,
                      [item.id]: Number(e.target.value),
                    })
                  }
                  min={1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-green"
                />
                <button
                  onClick={() => setSelectedItems([...selectedItems, item])}
                  className="w-full bg-brand-navy text-white py-1.5 rounded-lg text-sm hover:bg-brand-green transition-colors"
                >
                  Add
                </button>
              </div>
            ))}

            {selectedItems.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="font-bold text-brand-navy mb-2">Cart</h3>
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>
                      {quantity[item.id] || 1}x {item.name} (
                      {size[item.id] || "No size"})
                    </span>
                    <span>
                      €
                      {(item.defaultPrice * (quantity[item.id] || 1)).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-brand-navy mt-2 pt-2 border-t border-gray-100">
                  <span>Total:</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              className="w-full bg-brand-navy text-white font-medium py-2 rounded-lg mt-4 disabled:opacity-50"
              onClick={handleCreateOrder}
              disabled={selectedItems.length === 0 || loading}
            >
              {loading ? "Processing..." : "Create Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
