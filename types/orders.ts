import { Order, OrderItem, Member, Product } from "@prisma/client";
 
export type OrderWithDetails = Omit<Order, "totalPrice"> & {
  totalPrice: number;
  member: Member;
  items: (Omit<OrderItem, "price"> & { price: number; product: Product })[];
};
