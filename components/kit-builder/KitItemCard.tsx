import { getMemberFormItemsFromToken } from "@/lib/actions/members";
import { useState } from "react";
import { CartItem } from "@/lib/helpers/cart";

type FormWithItems = Awaited<ReturnType<typeof getMemberFormItemsFromToken>>;
type KitItem = NonNullable<FormWithItems>["items"][number];

export default function KitItemCard({
  item,
  onAdd,
}: {
  item: KitItem;
  onAdd: (item: CartItem) => void;
}) {
  const [selectedSize, setSelectedSize] = useState(item.product.sizes[0] || "");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const itemPrice = Number(item.customPrice ?? item.product.defaultPrice) || 0;

  const handleAddToCart = () => {
    onAdd({
      id: item.product.id,
      formItemId: item.id,
      productName: item.product.name,
      type: item.type,
      price: itemPrice,
      size: selectedSize,
      quantity: selectedQuantity,
    });
    setSelectedSize(item.product.sizes[0] || "");
    setSelectedQuantity(1);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full">
      <div className="w-full h-48 bg-gray-50 border-b border-gray-100 flex items-center justify-center p-4">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mb-2 shadow-sm p-2 text-[8px] font-black uppercase text-center leading-tight">
              NO IMAGE
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">No image</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 space-y-2">
        <p className="font-bold text-brand-navy tracking-tight">{item.product.name}</p>

        {item.product.description && (
          <p className="text-xs text-gray-500 leading-relaxed">{item.product.description}</p>
        )}

        <p className="text-sm font-black text-brand-navy">€{itemPrice.toFixed(2)}</p>

        <div className="flex-1" />

        <div className="space-y-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select size & quantity</p>
          <div className="flex gap-2">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white shadow-sm outline-none focus:ring-2 focus:ring-brand-navy/5 transition-all"
            >
              {item.product.sizes.map((size: string) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              className="w-16 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white shadow-sm outline-none focus:ring-2 focus:ring-brand-navy/5 transition-all font-bold"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-lg py-3 text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
