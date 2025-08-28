import {OrderCreateDto, OrderResponseDto, OrderUpdateDto} from '../types/orderTypes';

const BASE_API_PATH: string           = process.env.VITE_API_GATEWAY_PATH || 'http://localhost:8083';
const ORDERS_PATH: string             = process.env.VITE_ORDERS_PATH || '/order';
const GET_BY_USER_ID_ENDPOINT: string = process.env.GET_BY_USER_ID_ENDPOINT || 'user';
const UPDATE_ENDPOINT : string        = process.env.UPDATE_ENDPOINT || 'update';
const DELETE_ENDPOINT : string        = process.env.DELETE_ENDPOINT || 'delete';
const CREATE_ENDPOINT : string        = process.env.CREATE_ENDPOINT || 'create';

const authRequest = async (path: string, options: RequestInit = {}) => {
    const token : string | null = localStorage.getItem('accessToken');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    console.log('Making request to:', `${BASE_API_PATH}${path}`);

    try {
        const response: Response = await fetch(`${BASE_API_PATH}${path}`, {
            ...options,
            headers,
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            let err : Error = new Error(`HTTP error! status: ${response.status}`);
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userData');
                err = new Error('Authentication failed. Please log in again.');
            }
            throwRequestError(err);
        }

        return response.json();
    } catch (error) {
        throwRequestError(error);
    }
};

function throwRequestError(error: any) : void {
    console.error('Request failed:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Network request failed');
}

export const getUserOrders = async (userId: number): Promise<OrderResponseDto[]> => {
    try {
        return await authRequest(`${ORDERS_PATH}/${GET_BY_USER_ID_ENDPOINT}/${userId}`);
    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        throw error;
    }
};

export const getOrderById = async (orderId: number): Promise<OrderResponseDto> => {
    try {
        return await authRequest(`${ORDERS_PATH}/${orderId}`);
    } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
    }
};

export const createOrder = async (orderData: OrderCreateDto): Promise<OrderResponseDto> => {
    try {
        return await authRequest(`${ORDERS_PATH}/${CREATE_ENDPOINT}`, {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

export const updateOrder = async (orderData: OrderUpdateDto): Promise<OrderResponseDto> => {
    try {
        return await authRequest(`${ORDERS_PATH}/${UPDATE_ENDPOINT}`, {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.error('Failed to update order:', error);
        throw error;
    }
};

export const deleteOrder = async (orderId: number): Promise<void> => {
    try {
        await authRequest(`${ORDERS_PATH}/${DELETE_ENDPOINT}/${orderId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Failed to delete order:', error);
        throw error;
    }
};