"use client";

import { getMemberFormItemsFromToken } from "@/lib/actions/members";
import KitItemCard from "../forms/KitItemCard";
import { createMemberOrder } from "@/lib/actions/orders";
import { useState } from "react";

type FormWithItems = Awaited<ReturnType<typeof getMemberFormItemsFromToken>>;

export default function MemberFormItems({
  form,
  token,
}: {
  form: FormWithItems;
  token: string;
}) {
  if (!form) return <div>No form found.</div>;

  const [activeTab, setActiveTab] = useState<"basic" | "extra">("basic");

  const basicItems = form.items.filter((item) => item.type === "BASIC");
  const customItems = form.items.filter((item) => item.type === "EXTRA");

  const handleCheckout = async (formData: FormData) => {
    const items = form.items.map((item) => ({
      productId: item.product.id,
      size: formData.get(`size-${item.id}`) as string,
      quantity: parseInt(formData.get(`quantity-${item.id}`) as string),
      price: Number(item.customPrice ?? item.product.defaultPrice),
    }));
    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    await createMemberOrder(token, totalPrice, items);
  };

  return (
    <form action={handleCheckout}>
      <div className="flex gap-4">
        <button type="button" onClick={() => setActiveTab("basic")}>
          Basic
        </button>
        
          <button type="button" onClick={() => setActiveTab("extra")}>
            Extra
          </button>
        
      </div>
      {activeTab === "basic" &&
        basicItems.map((item) => <KitItemCard key={item.id} item={item} />)}

      {activeTab === "extra" && (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⚠️ These are <strong>optional extra items</strong>. Any extras you
            select will be charged additionally.
          </div>
          {customItems.map((item) => (
            <KitItemCard key={item.id} item={item} />
          ))}
        </>
      )}

      <button type="submit">Checkout</button>
    </form>
  );
}
