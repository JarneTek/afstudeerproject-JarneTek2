import { getMemberFormItemsFromToken } from "@/lib/actions/members";

type FormWithItems = Awaited<ReturnType<typeof getMemberFormItemsFromToken>>;
type KitItem = NonNullable<FormWithItems>["items"][number];

export default function KitItemCard({ item }: { item: KitItem }) {
  return (
    <div>
      <p>{item.product.name}</p>
      <p>{item.product.description}</p>
      <p>€{item.product.defaultPrice}</p>
      <select name={`size-${item.id}`} id={`size-${item.id}`} required>
        {item.product.sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <input
        type="number"
        name={`quantity-${item.id}`}
        id={`quantity-${item.id}`}
        min={1}
        defaultValue={1}
        required
      />
    </div>
  );
}
