/**
 * Trainer↔client connection types (invite / accept model).
 */
import type { UserRole } from './auth.types';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
export type ConnectionInitiator = 'trainer' | 'client';

/** The other party, as populated by the backend on list endpoints. */
export interface ConnectionParty {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role?: UserRole;
}

/**
 * A connection record. `trainerId`/`clientId` come back as a plain id string on
 * write endpoints, or as a populated {@link ConnectionParty} on list endpoints
 * (`/clients` populates the client, `/my-connections` populates the trainer).
 */
export interface TrainerConnection {
  _id: string;
  trainerId: string | ConnectionParty;
  clientId: string | ConnectionParty;
  status: ConnectionStatus;
  initiatedBy: ConnectionInitiator;
  createdAt: string;
  updatedAt: string;
}

/** Narrow a possibly-populated id field to its populated object, or null. */
export function getConnectionParty(
  value: string | ConnectionParty,
): ConnectionParty | null {
  return typeof value === 'object' && value !== null ? value : null;
}
