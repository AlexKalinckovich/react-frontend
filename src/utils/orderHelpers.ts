import { LocalOrderItem } from '../components/OrderForm/OrderItemRow';
import { OrderItemCreateDto, OrderItemUpdateDto, OrderResponseDto } from '../types/orderTypes';

/**
 * Merge duplicate itemIds from a user-edited list.
 * - If multiple entries with the same itemId exist, we sum quantities.
 * - If any entry contained orderItemId, we prefer to keep the first seen orderItemId.
 */
export function normalizeLocalItems(items: LocalOrderItem[]): LocalOrderItem[] {
    const map = new Map<number, { orderItemId?: number; quantity: number }>();

    for (const it of items) {
        const key: number = it.itemId;

        if (!key || key <= 0) {
            continue;
        }
        const existing: { orderItemId?: number; quantity: number } | undefined = map.get(key);
        if (!existing) {
            map.set(key, { orderItemId: it.orderItemId, quantity: it.quantity });
        } else {
            existing.quantity += it.quantity;

            if (!existing.orderItemId && it.orderItemId) {
                existing.orderItemId = it.orderItemId;
            }
        }
    }

    return Array.from(map.entries()).map(([itemId, v]) => ({
        orderItemId: v.orderItemId,
        itemId,
        quantity: v.quantity,
    }));
}

/**
 * Build update payload parts (idsToRemove, itemsToAdd, itemsToUpdate)
 * from server original order and current normalized client items.
 *
 * original: server OrderResponseDto (contains orderItems with id and itemDto.id)
 * current: normalized LocalOrderItem[] (no duplicates)
 */
export function buildUpdatePayloadParts(
    original: OrderResponseDto,
    current: LocalOrderItem[],
): {
    idsToRemove: number[];
    itemsToAdd: OrderItemCreateDto[];
    itemsToUpdate: OrderItemUpdateDto[];
} {
    const origByItemId = new Map<number, { orderItemId: number; quantity: number }>();
    for (const oi of original.orderItems) {
        origByItemId.set(oi.itemDto.id, { orderItemId: oi.id, quantity: oi.quantity });
    }

    const currentByItemId = new Map<number, LocalOrderItem>();
    for (const it of current) currentByItemId.set(it.itemId, it);

    const idsToRemove: number[] = [];
    const itemsToAdd: OrderItemCreateDto[] = [];
    const itemsToUpdate: OrderItemUpdateDto[] = [];

    for (const [origItemId] of origByItemId.entries()) {
        if (!currentByItemId.has(origItemId)) idsToRemove.push(origItemId);
    }

    for (const [itemId, curr] of currentByItemId.entries()) {
        const orig: { orderItemId: number; quantity: number } | undefined = origByItemId.get(itemId);
        if (!orig) {
            itemsToAdd.push({ itemId: itemId, quantity: curr.quantity });
        } else {
            if (orig.quantity !== curr.quantity) {
                itemsToUpdate.push({ id: orig.orderItemId, itemId: itemId, quantity: curr.quantity });
            }
        }
    }

    return { idsToRemove, itemsToAdd, itemsToUpdate };
}
