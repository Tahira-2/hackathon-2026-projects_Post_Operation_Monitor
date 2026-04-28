import { apiFetch } from './api-client';
import { API_ENDPOINTS } from './endpoints';
import type { ChatMessagePayload, SendChatMessageRequest } from './models';

export async function sendChatMessage(
  payload: SendChatMessageRequest
): Promise<ChatMessagePayload> {
  return apiFetch<ChatMessagePayload>(API_ENDPOINTS.chat.message, {
    method: 'POST',
    body: payload,
  });
}
