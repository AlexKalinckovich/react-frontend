import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderItemRow, { LocalOrderItem } from './OrderItemRow';
import { normalizeLocalItems, buildUpdatePayloadParts } from '../../utils/orderHelpers';
import { createOrder, updateOrder, getOrderById } from '../../services/orderService';
import {
    OrderCreateDto,
    OrderResponseDto,
    OrderUpdateDto,
    OrderItemResponseDto
} from '../../types/orderTypes';
import styles from "../OrderList/OrderList.module.css";

type Props = {
    isEdit?: boolean;
};

const OrderForm: React.FC<Props> = ({ isEdit = false } : Props) : React.JSX.Element  => {
    const { id: urlId } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [userId, setUserId] = useState<number | null>(user?.id ?? null);
    const [orderItems, setOrderItems] = useState<LocalOrderItem[]>([{ itemId: 0, quantity: 1 }]);
    const [initialOrder, setInitialOrder] = useState<OrderResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() : void => {
        setUserId(user?.id ?? null);
    }, [user?.id]);

    useEffect(() => {
        if (!isEdit) return;
        const id = urlId ? Number(urlId) : NaN;
        if (!id || Number.isNaN(id)) {
            setError('Invalid order id in route');
            return;
        }

        let cancelled: boolean = false;
        (async () => {
            try {
                setLoading(true);
                const order: OrderResponseDto = await getOrderById(id);
                if (cancelled) return;
                setInitialOrder(order);
                setUserId(order.userId);
                setOrderItems(
                    order.orderItems.map((oi: OrderItemResponseDto) => ({
                        orderItemId: oi.id,
                        itemId: oi.itemDto.id,
                        quantity: oi.quantity,
                    }))
                );
            } catch (err: any) {
                setError(err?.message || 'Failed to load order');
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isEdit, urlId]);

    const addRow = () => setOrderItems((s) => [...s, { itemId: 0, quantity: 1 }]);
    const removeRow = (index: number) => setOrderItems((s) => s.filter((_, i) => i !== index));
    const patchRow = (index: number, patch: Partial<LocalOrderItem>) => {
        setOrderItems((s) => s.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const validateClient = useCallback(
        (isForCreate: boolean): string | null => {
            if (!userId || userId <= 0) {
                return 'UserId must be set';
            }

            const normalized: LocalOrderItem[] = normalizeLocalItems(orderItems);

            if (isForCreate && normalized.length === 0) {
                return 'At least one item is required';
            }

            for (const it of normalized) {
                if (!it.itemId || it.itemId <= 0) {
                    return 'All items must have valid itemId';
                }
                if (!it.quantity || it.quantity <= 0) {
                    return 'Quantity must be positive';
                }
            }

            return null;
        },
        [userId, orderItems]
    );


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const clientError = validateClient(!isEdit);
        if (clientError) {
            setError(clientError);
            return;
        }

        const normalizedItems: LocalOrderItem[] = normalizeLocalItems(orderItems);

        if (!isEdit) {
            if(!userId){
                setError("UserId must be set");
                return;
            }
            const createDto: OrderCreateDto = {
                userId,
                orderItems: normalizedItems.map((it: LocalOrderItem) => ({ itemId: it.itemId, quantity: it.quantity })),
            };
            try {
                setSubmitting(true);
                await createOrder(createDto);
                navigate('/orders');
            } catch (err: any) {
                setError(err?.message || 'Failed to create order');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        if (!initialOrder) {
            setError('Missing initial order data for update');
            return;
        }

        const { idsToRemove, itemsToAdd, itemsToUpdate } = buildUpdatePayloadParts(initialOrder, normalizedItems);

        if(!userId){
            setError("UserId must be set");
            return;
        }

        const updateDto: OrderUpdateDto = {
            id: initialOrder.id,
            userId,
            ...(idsToRemove.length ? { idsToRemove } : {}),
            ...(itemsToAdd.length ? { itemsToAdd } : {}),
            ...(itemsToUpdate.length ? { itemsToUpdate } : {}),
        };

        try {
            setSubmitting(true);
            await updateOrder(updateDto as OrderUpdateDto);
            navigate('/orders');
        } catch (err: any) {
            setError(err?.message || 'Failed to update order');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit: boolean = useMemo(() : boolean => {
        const clientErr: string | null = validateClient(!isEdit);
        return clientErr === null && !loading && !submitting;
    }, [validateClient, isEdit, loading, submitting]);

    return (
        <div className="order-form-container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2>{isEdit ? 'Edit Order' : 'Create Order'}</h2>

            {error && <div style={{ color: 'crimson', padding: 8, background: '#ffecec' }}>{error}</div>}
            {loading && <div>Loading order...</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Items</h3>
                        <div>
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

                    {orderItems.map((it: LocalOrderItem, idx: number) => (
                        <OrderItemRow key={idx} index={idx} item={it} onChange={patchRow} onRemove={removeRow} />
                    ))}

                    {orderItems.length === 0 && <div style={{ color: '#666' }}>No items — add at least one.</div>}
                </div>

                <div className={styles.editActions} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                        type="button"
                        onClick={(): void | Promise<void> => navigate('/orders')}
                        className={`${styles.textButton}`}
                        aria-label="Cancel edits"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={`${styles.textButton} ${styles.primary}`}
                        disabled={!canSubmit}
                        aria-label="Save edits"
                    >
                        {submitting ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;
