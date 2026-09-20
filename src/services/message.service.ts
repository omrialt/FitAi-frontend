import api from './api';
import type { Message, ThreadSummary } from '../types/message.types';

// Backend wraps every response as { data, timestamp, path } (TransformInterceptor)
class MessageService {
  /** Every conversation the caller may have, including the empty ones. */
  async getThreads(): Promise<ThreadSummary[]> {
    const res = await api.get<{ data: ThreadSummary[] }>('/messages/threads');
    return res.data.data;
  }

  /**
   * One conversation, oldest first.
   *
   * `after` is what keeps polling cheap — pass the newest message already on
   * screen and the server returns only what came after it.
   */
  async getThread(otherUserId: string, after?: string): Promise<Message[]> {
    const res = await api.get<{ data: Message[] }>(
      `/messages/${otherUserId}`,
      after ? { params: { after } } : undefined,
    );
    return res.data.data;
  }

  async send(toUserId: string, body: string): Promise<Message> {
    const res = await api.post<{ data: Message }>('/messages', {
      toUserId,
      body,
    });
    return res.data.data;
  }

  /** Marks the other party's messages read. Never your own. */
  async markRead(otherUserId: string): Promise<{ updated: number }> {
    const res = await api.patch<{ data: { updated: number } }>(
      `/messages/${otherUserId}/read`,
    );
    return res.data.data;
  }

  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ data: { unread: number } }>(
      '/messages/unread-count',
    );
    return res.data.data.unread;
  }
}

export const messageService = new MessageService();
export default messageService;
