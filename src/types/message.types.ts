/**
 * Trainer↔client messaging.
 *
 * Dates are ISO strings: the server types them as `Date`, JSON has no such
 * thing, and the difference only shows up at the call to `.getTime()`.
 */

export interface Message {
  _id: string;
  trainerId: string;
  clientId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadSummary {
  /** The other person, from the current user's point of view. */
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  callerIsTrainer: boolean;
  lastMessage: {
    body: string;
    createdAt: string;
    fromMe: boolean;
  } | null;
  unread: number;
}
