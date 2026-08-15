import api from './api';

/** What the server reports it removed, per collection. */
export interface DeletionReport {
  removed: Record<string, number>;
  scrubbed: Record<string, number>;
}

/** Confirmation the server requires before erasing an account. */
export interface DeleteAccountConfirmation {
  /** Email/password accounts confirm with their current password. */
  password?: string;
  /** Google accounts have no password, so they retype their address. */
  email?: string;
}

class AccountService {
  /**
   * Download everything the service stores about the signed-in user.
   *
   * Asks for a Blob rather than parsed JSON: the response is saved straight to
   * a file, so parsing it into objects only to re-serialise them would risk
   * changing what the user receives.
   */
  async exportData(): Promise<Blob> {
    const response = await api.get<Blob>('/account/export', {
      responseType: 'blob',
    });
    return response.data;
  }

  /** Permanently delete the signed-in user's account and all its data. */
  async deleteAccount(
    confirmation: DeleteAccountConfirmation,
  ): Promise<DeletionReport> {
    const response = await api.delete<{ data: DeletionReport }>('/account', {
      data: confirmation,
    });
    return response.data.data ?? response.data;
  }
}

export const accountService = new AccountService();
export default accountService;
