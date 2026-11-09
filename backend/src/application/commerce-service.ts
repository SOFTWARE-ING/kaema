import { badRequest, conflict, notFound } from "../domain/errors";
import type { DatabasePort } from "../domain/ports";

export class CommerceService {
  constructor(private readonly database: DatabasePort) {}

  listPublishedProducts() {
    return this.database.client.showroomProduct.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  }

  placeOrder(input: { productId: string; quantity: number; customerName: string; customerContact: string; message?: string }) {
    const quantity = input.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw badRequest("La quantité doit être comprise entre 1 et 100.");
    const deliveryDays = 5 + Math.max(0, quantity - 1);
    return this.database.client.$transaction(async (tx) => {
      const product = await tx.showroomProduct.findFirst({ where: { id: input.productId, published: true } });
      if (!product) throw notFound("Produit indisponible.");
      if (product.price > Math.floor(2_147_483_647 / quantity)) throw badRequest("Le montant total de cette commande dépasse la limite autorisée.");
      const stock = await tx.showroomProduct.updateMany({
        where: { id: product.id, published: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (stock.count !== 1) throw conflict("Stock insuffisant.");
      return tx.productOrder.create({ data: {
        productId: product.id, productName: product.name, unitPrice: product.price, quantity,
        total: product.price * quantity, deliveryDays,
        customerName: input.customerName.trim(), customerContact: input.customerContact.trim(), message: input.message?.trim() ?? "",
      } });
    });
  }

  changeOrderStatus(id: string, status: "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED") {
    return this.database.client.$transaction(async (tx) => {
      const order = await tx.productOrder.findUnique({ where: { id } });
      if (!order) throw notFound("Commande introuvable.");
      const transitions: Record<string, string[]> = {
        NEW: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["DELIVERED", "CANCELLED"],
        DELIVERED: [],
        CANCELLED: [],
      };
      if (order.status === status) return order;
      if (!transitions[order.status]?.includes(status)) throw conflict("Cette transition de commande n'est pas autorisée.");

      const updated = await tx.productOrder.updateMany({ where: { id: order.id, status: order.status }, data: { status } });
      if (!updated.count) throw conflict("La commande vient d'être modifiée. Actualisez la liste et réessayez.");
      if (status === "CANCELLED") {
        await tx.showroomProduct.update({ where: { id: order.productId }, data: { stock: { increment: order.quantity } } });
      }
      return tx.productOrder.findUnique({ where: { id: order.id } });
    });
  }
}
