import { baseApi } from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<any, void>({
      query: () => "/conversations",
      // Mocking the behavior for now if backend doesn't exist
      transformResponse: (response: any) => response || [
        { 
          id: "1", 
          name: "Jane Doe", 
          lastMessage: "I feel better now, thank you!", 
          time: "10:30 AM", 
          unread: 2, 
          status: "online",
          avatar: "JD"
        },
        { 
          id: "2", 
          name: "John Smith", 
          lastMessage: "When is my next appointment?", 
          time: "Yesterday", 
          unread: 0, 
          status: "offline",
          avatar: "JS"
        },
        { 
          id: "3", 
          name: "Emily Wilson", 
          lastMessage: "The medicine is working well.", 
          time: "Monday", 
          unread: 0, 
          status: "online",
          avatar: "EW"
        },
      ],
    }),
    getMessages: builder.query<any, string>({
      query: (id) => `/conversations/${id}/messages`,
      transformResponse: (response: any) => response || [
        { id: "1", sender: "patient", text: "Hello doctor, I have a question about my prescription.", time: "10:00 AM" },
        { id: "2", sender: "doctor", text: "Hello Jane, sure. What's on your mind?", time: "10:05 AM" },
        { id: "3", sender: "patient", text: "Can I take it before dinner instead of after?", time: "10:15 AM" },
        { id: "4", sender: "doctor", text: "It's better to take it after dinner to avoid stomach upset.", time: "10:20 AM" },
        { id: "5", sender: "patient", text: "I feel better now, thank you!", time: "10:30 AM" },
      ],
    }),
    sendMessage: builder.mutation<any, { conversationId: string, text: string }>({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation 
} = chatApi;
