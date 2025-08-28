export enum OrderStatus {
    PAID       = 'PAID',
    UNPAID     = 'UNPAID',
    CREATED    = 'CREATED',
    PROCESSING = 'PROCESSING',
    COMPLETED  = 'COMPLETED',
    CANCELED   = 'CANCELED',
}

export interface ItemResponseDto {
    id: number;
    name: string;
    price: number;
}

export interface OrderItemResponseDto {
    id: number;
    itemDto: ItemResponseDto;
    quantity: number;
}

export interface OrderResponseDto {
    id: number;
    userId: number;
    status: OrderStatus;
    orderDate: string; // ISO
    orderItems: OrderItemResponseDto[];
}

export interface OrderItemCreateDto {
    itemId: number;
    quantity: number;
}

export interface OrderCreateDto {
    userId: number;
    orderItems: OrderItemCreateDto[];
}

export interface OrderItemUpdateDto {
    id: number;
    itemId: number;
    quantity: number;
}

export interface OrderUpdateDto {
    id: number;
    userId?: number;
    status?: OrderStatus;
    orderDate?: string; // ISO
    idsToRemove?: number[];
    itemsToAdd?: OrderItemCreateDto[];
    itemsToUpdate?: OrderItemUpdateDto[];
}
