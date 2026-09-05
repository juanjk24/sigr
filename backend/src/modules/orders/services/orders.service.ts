import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '../../../config/db';
import { orders, orderItems, dishes, users } from '../../../db/schema';
import type { Order } from '../../../db/schema';
import { HttpError } from '../../../shared/utils/response';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderStatus,
  createOrderSchema,
} from '../dtos/orders.dto';

export interface OrderItemEnriched {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: string;
  createdAt: Date;
  lineTotal: string;
}

export interface OrderEnriched extends Order {
  user: { id: string; name: string } | null;
  items: OrderItemEnriched[];
}

const CUSTOMER_FIELDS = [
  'customerName',
  'customerPhone',
  'customerAddress',
  'tableNumber',
  'notes',
] as const;

const toMoney = (n: number): string => String(n.toFixed(2));

const normalizeCustomerFields = (data: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const key of CUSTOMER_FIELDS) {
    const value = data[key];
    if (value === undefined || value === null) continue;
    const str = String(value).trim();
    if (str === '') continue;
    out[key] = str;
  }
  return out;
};

const loadItems = async (orderId: string): Promise<OrderItemEnriched[]> => {
  const rows = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  return rows.map((item) => ({
    ...item,
    lineTotal: toMoney(parseFloat(item.unitPrice) * item.quantity),
  }));
};

export const loadOrderItems = loadItems;

const enrich = async (order: Order): Promise<OrderEnriched> => {
  const [items, userRows] = await Promise.all([
    loadItems(order.id),
    db.select().from(users).where(eq(users.id, order.userId)).limit(1),
  ]);
  return {
    ...order,
    items,
    user: userRows[0]
      ? { id: userRows[0].id, name: userRows[0].name }
      : null,
  };
};

const resolveDishes = async (dishIds: string[]) => {
  const dishRows = await db
    .select()
    .from(dishes)
    .where(inArray(dishes.id, dishIds));
  const byId = new Map(dishRows.map((d) => [d.id, d]));
  for (const id of dishIds) {
    if (!byId.has(id)) {
      throw new HttpError('Uno de los platos no existe', 400);
    }
  }
  return byId;
};

const buildItemsToInsert = (
  items: Array<{ dishId: string; quantity: number }>,
  dishById: Map<string, { id: string; name: string; price: string }>,
) => {
  let total = 0;
  const rows = items.map((item) => {
    const dish = dishById.get(item.dishId)!;
    const unitPrice = parseFloat(dish.price);
    total += unitPrice * item.quantity;
    return {
      dishId: dish.id,
      dishName: dish.name,
      quantity: item.quantity,
      unitPrice: toMoney(unitPrice),
    };
  });
  return { rows, total };
};

export const listOrders = async (): Promise<OrderEnriched[]> => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return Promise.all(rows.map(enrich));
};

export const getOrderById = async (id: string): Promise<OrderEnriched> => {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!rows[0]) {
    throw new HttpError('Pedido no encontrado', 404);
  }
  return enrich(rows[0]);
};

export const createOrder = async (
  userId: string,
  data: CreateOrderDto,
): Promise<OrderEnriched> => {
  const dishById = await resolveDishes(data.items.map((i) => i.dishId));
  const { rows: itemsToInsert, total } = buildItemsToInsert(data.items, dishById);
  const payload = normalizeCustomerFields(data);
  const status = data.status ?? 'pending';

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        ...payload,
        type: data.type,
        userId,
        status,
        total: toMoney(total),
      })
      .returning();
    await tx
      .insert(orderItems)
      .values(itemsToInsert.map((item) => ({ ...item, orderId: created.id })));
    return created;
  });

  return enrich(order);
};

export const updateOrder = async (
  id: string,
  data: UpdateOrderDto,
): Promise<OrderEnriched> => {
  const existingRows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existingRows[0]) {
    throw new HttpError('Pedido no encontrado', 404);
  }
  const existing = existingRows[0];

  const type = data.type ?? existing.type;
  const status = data.status ?? existing.status;
  const payload = normalizeCustomerFields(data);

  if (data.items) {
    data.items.forEach((item) => {
      if (item.quantity < 1) {
        throw new HttpError('La cantidad mínima es 1', 400);
      }
    });

    const combined = {
      ...existing,
      ...payload,
      type,
      status,
      items: data.items,
      customerName: payload.customerName ?? existing.customerName,
      customerPhone: payload.customerPhone ?? existing.customerPhone,
      customerAddress: payload.customerAddress ?? existing.customerAddress,
      tableNumber: payload.tableNumber ?? existing.tableNumber,
    };
    const check = createOrderSchema.safeParse(combined);
    if (!check.success) {
      throw new HttpError(check.error.issues[0]?.message ?? 'Datos inválidos', 400);
    }
  }

  const dishById =
    data.items ? await resolveDishes(data.items.map((i) => i.dishId)) : null;
  const { rows: itemsToInsert, total } = data.items
    ? buildItemsToInsert(data.items, dishById!)
    : { rows: [], total: null };

  const order = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orders)
      .set({
        ...payload,
        type,
        status,
        ...(total !== null ? { total: toMoney(total) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    if (data.items) {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      await tx
        .insert(orderItems)
        .values(itemsToInsert.map((item) => ({ ...item, orderId: id })));
    }
    return updated;
  });

  return enrich(order);
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<OrderEnriched> => {
  const rows = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  if (!rows[0]) {
    throw new HttpError('Pedido no encontrado', 404);
  }
  return enrich(rows[0]);
};

export const deleteOrder = async (id: string): Promise<void> => {
  const rows = await db.delete(orders).where(eq(orders.id, id)).returning();
  if (!rows[0]) {
    throw new HttpError('Pedido no encontrado', 404);
  }
};