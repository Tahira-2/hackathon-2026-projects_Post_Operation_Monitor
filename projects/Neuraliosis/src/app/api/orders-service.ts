import { apiFetch } from './api-client';
import { API_ENDPOINTS, orderDetailEndpoint } from './endpoints';
import type { Order, PlaceOrderPayload } from './models';

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  return apiFetch<Order>(API_ENDPOINTS.orders.root, {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}

export async function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>(API_ENDPOINTS.orders.root, { authenticated: true });
}

export async function getOrderDetail(id: number): Promise<Order> {
  return apiFetch<Order>(orderDetailEndpoint(id), { authenticated: true });
}
