import React from 'react';
import './OrderItemRow.css';
import styles from "../OrderList/OrderList.module.css"

export type LocalOrderItem = {
    orderItemId?: number;
    itemId: number;
    quantity: number;
};

type Props = {
    index: number;
    item: LocalOrderItem;
    onChange: (index: number, patch: Partial<LocalOrderItem>) => void;
    onRemove: (index: number) => void;
};

const OrderItemRow: React.FC<Props> = ({ index, item, onChange, onRemove }) => {
    const setItemId = (v: string) => {
        const n = Number(v);
        onChange(index, { itemId: Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0 });
    };

    const setQuantity = (v: string) => {
        const n = Number(v);
        onChange(index, { quantity: Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : 1 });
    };

    return (
        <div className="order-item-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', gap: 8, alignItems: 'center' }}>
            <div>
                <label style={{ display: 'block', fontSize: 12 }}>Item ID</label>
                <input
                    type="number"
                    min={0}
                    value={item.itemId > 0 ? item.itemId : ''}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="item id"
                    required
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: 12 }}>Quantity</label>
                <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
            </div>

            <div>
                <button
                    type="button"
                    onClick={():void => onRemove(index)}
                    className={`${styles.textButton} ${styles.danger}`}
                    aria-label="Remove item"
                    title="Remove item"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default OrderItemRow;
