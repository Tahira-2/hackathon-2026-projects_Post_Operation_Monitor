import { baseApi } from './baseApi';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ListNotificationsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  isRead?: boolean;
}

export interface ListNotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ListNotificationsResponse, ListNotificationsParams | void>({
      query: (params) => ({
        url: '/notifications',
        params: params || {},
      }),
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'PATCH',
        body: { isRead: true },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = notificationApi;
