import React, { useEffect, useState } from 'react';
import styles from './OrderList.module.css';
import { useAuth } from '../../context/AuthContext';
import {
    OrderResponseDto,
    OrderItemResponseDto, OrderUpdateDto,
} from '../../types/orderTypes';
import { getUserOrders, getOrderById, updateOrder } from '../../services/orderService';
import OrderItemRow, { LocalOrderItem } from '../OrderForm/OrderItemRow';
import { normalizeLocalItems, buildUpdatePayloadParts } from '../../utils/orderHelpers';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, logout } = useAuth();

    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [editingItems, setEditingItems] = useState<LocalOrderItem[]>([]);
    const [editingInitialOrder, setEditingInitialOrder] = useState<OrderResponseDto | null>(null);
    const [editingSubmitting, setEditingSubmitting] = useState(false);
    const [editingError, setEditingError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!user) {
                    setError('No user found. Please log in again.');
                    return;
                }
                const userOrders = await getUserOrders(user.id);
                if (cancelled) return;
                setOrders(userOrders);
            } catch (err: any) {
                console.error('Error fetching orders:', err);
                const errorMessage = err?.message || 'Failed to fetch orders';
                setError(errorMessage);
                if (errorMessage.includes('Authentication failed')) {
                    setTimeout(() => logout(), 3000);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchOrders();
        return () => {
            cancelled = true;
        };
    }, [user, logout]);

    if (loading) return <div className={styles.loading}>Loading orders...</div>;
    if (error)
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>Error: {error}</div>
                {error.includes('Authentication failed') && <p>Redirecting to login page...</p>}
            </div>
        );
    if (orders.length === 0) return <div className={styles.empty}>No orders found.</div>;

    const openEdit = async (orderId: number) => {
        try {
            setEditingError(null);
            setEditingSubmitting(false);
            const order: OrderResponseDto = await getOrderById(orderId);
            setEditingOrderId(orderId);
            setEditingInitialOrder(order);
            setEditingItems(
                order.orderItems.map((oi: OrderItemResponseDto) => ({
                    orderItemId: oi.id,
                    itemId: oi.itemDto.id,
                    quantity: oi.quantity,
                }))
            );
        } catch (err: any) {
            setEditingError(err?.message || 'Failed to load order for editing');
        }
    };

    const closeEdit = () => {
        setEditingOrderId(null);
        setEditingItems([]);
        setEditingInitialOrder(null);
        setEditingError(null);
    };

    const addRow = () => setEditingItems((s) => [...s, { itemId: 0, quantity: 1 }]);
    const removeRow: (index: number) => void = (index: number) => setEditingItems((s) => s.filter((_, i) => i !== index));
    const patchRow: (index: number, patch: Partial<LocalOrderItem>) => void = (index: number, patch: Partial<LocalOrderItem>) =>
        setEditingItems((s: LocalOrderItem[]) : LocalOrderItem[] => s.map(
            (r : LocalOrderItem, i : number) => (i === index ? { ...r, ...patch } : r)));

    const handleSaveEdits = async () => {
        setEditingError(null);
        if (!editingInitialOrder) {
            setEditingError('Missing initial order data');
            return;
        }

        const normalized = normalizeLocalItems(editingItems);
        const { idsToRemove, itemsToAdd, itemsToUpdate } = buildUpdatePayloadParts(editingInitialOrder, normalized);

        if (!idsToRemove.length && !itemsToAdd.length && !itemsToUpdate.length) {
            closeEdit();
            return;
        }

        const updateDto : OrderUpdateDto = {
            id: editingInitialOrder.id,
            userId: editingInitialOrder.userId,
            ...(idsToRemove.length ? { idsToRemove } : {}),
            ...(itemsToAdd.length ? { itemsToAdd } : {}),
            ...(itemsToUpdate.length ? { itemsToUpdate } : {}),
        };

        try {
            setEditingSubmitting(true);
            await updateOrder(updateDto);
            if (user) {
                const refreshed = await getUserOrders(user.id);
                setOrders(refreshed);
            }
            closeEdit();
        } catch (err: any) {
            setEditingError(err?.message || 'Failed to save order changes');
        } finally {
            setEditingSubmitting(false);
        }
    };

    return (
        <div className={styles.orderList}>
            <h2>Your Orders</h2>

            {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                        <h3>Order #{order.id}</h3>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                                onClick={() => openEdit(order.id)}
                                className={`${styles.textButton} ${styles.smallButton}`}
                                aria-label={`Edit items for order ${order.id}`}
                                title="Edit items"
                            >
                                Edit
                            </button>
                        </div>

                        <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
              {order.status}
            </span>
                    </div>

                    <p className={styles.orderDate}>Ordered on: {new Date(order.orderDate).toLocaleDateString()}</p>

                    {editingOrderId === order.id && editingInitialOrder ? (
                        <div className={styles.editPane}>
                            <h4>Editing items for order #{order.id}</h4>

                            {editingError && <div className={styles.error}>{editingError}</div>}

                            <div className={styles.sectionHeader}>
                                <div className={styles.leftTitle}>
                                    <div className={styles.titleMain}>Items</div>
                                    <div className={styles.titleSub}> — edit quantities or remove items</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className={styles.actionLabel}>Add / Remove</span>
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className={`${styles.textButton} ${styles.primary}`}
                                        aria-label="Add item"
                                        title="Add item"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {editingItems.map((it, idx) => (
                                <OrderItemRow key={it.orderItemId ?? `new-${idx}`} index={idx} item={it} onChange={patchRow} onRemove={removeRow} />
                            ))}

                            {editingItems.length === 0 && <div className={styles.empty}>No items — add at least one.</div>}

                            <div className={styles.editActions} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className={`${styles.textButton}`}
                                    aria-label="Cancel edits"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveEdits}
                                    className={`${styles.textButton} ${styles.primary}`}
                                    disabled={editingSubmitting}
                                    aria-label="Save edits"
                                >
                                    {editingSubmitting ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.orderItems}>
                                <h4>Items:</h4>
                                {order.orderItems.map(item => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <span className={styles.itemName}>{item.itemDto.name}</span>
                                        <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                                        <span className={styles.itemPrice}>${(item.itemDto.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderTotal}>
                                Total: $
                                {order.orderItems
                                    .reduce((total, item) => total + item.itemDto.price * item.quantity, 0)
                                    .toFixed(2)}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OrderList;
