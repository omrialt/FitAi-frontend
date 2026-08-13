import { useState } from 'react';
import { Modal, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { StitchIcon } from '../common/StitchIcon';
import accountService from '../../services/account.service';
import { useAuthStore } from '../../store/authStore';

/**
 * Data export and account deletion.
 *
 * These are regulatory obligations rather than features: the product stores
 * weight, body-fat percentage, measurements, photos and a full training
 * history, which is health data, and until now there was no way for a person
 * to get a copy of it or to have it erased.
 *
 * Deletion is guarded three ways — a separate confirmation modal, retyping a
 * secret, and a summary of exactly what was destroyed — because it cannot be
 * undone and the account it destroys may be the one reading this.
 */
export function AccountDataPanel() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [secret, setSecret] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Google accounts have no password to check, so the server asks them to
  // retype their email address instead.
  const isGoogleAuth = user?.authProvider === 'google';

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await accountService.exportData();

      // Object URL rather than a plain link to the endpoint: the request needs
      // the Authorization header, so it has to go through the API client and
      // the result is turned into a download here.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitai-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoking frees the blob; without it the whole export stays in memory
      // for the life of the tab.
      URL.revokeObjectURL(url);

      toast.success(t('account.exportReady'));
    } catch {
      toast.error(t('account.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const report = await accountService.deleteAccount(
        isGoogleAuth ? { email: secret } : { password: secret },
      );

      const total = Object.values(report?.removed ?? {}).reduce(
        (sum, n) => sum + n,
        0,
      );
      // Interpolated as `total`, not `count`: `count` switches i18next into
      // plural resolution, and Hebrew needs one/two/many forms that this
      // message does not have.
      toast.success(t('account.deleted', { total }));

      setConfirmOpen(false);
      // The account no longer exists, so every stored token is now worthless;
      // clearing local state is what stops the app rendering a ghost session.
      await logout();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t('account.deleteFailed');
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-ghost bg-surface-container-lowest p-6">
      <h2 className="text-lg font-bold text-on-surface">
        {t('account.sectionTitle')}
      </h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        {t('account.sectionSubtitle')}
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-on-surface">
            {t('account.exportTitle')}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('account.exportDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-ghost px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container disabled:opacity-60"
        >
          <StitchIcon name="download" />
          {exporting ? t('account.exporting') : t('account.exportAction')}
        </button>
      </div>

      <hr className="my-5 border-ghost" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-error">
            {t('account.deleteTitle')}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('account.deleteDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSecret('');
            setConfirmOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-on-error transition hover:opacity-90"
        >
          <StitchIcon name="delete" />
          {t('account.deleteAction')}
        </button>
      </div>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('account.deleteTitle')}
        centered
      >
        <p className="text-sm text-on-surface">{t('account.deleteConfirm')}</p>
        <p className="mt-2 text-sm font-semibold text-error">
          {t('account.deleteWarning')}
        </p>

        <TextInput
          className="mt-4"
          type={isGoogleAuth ? 'text' : 'password'}
          // Not `autoFocus`: this is a destructive dialog, and focusing the
          // field invites typing before the warning above has been read.
          label={
            isGoogleAuth
              ? t('account.confirmEmailLabel')
              : t('account.confirmPasswordLabel')
          }
          placeholder={isGoogleAuth ? user?.email : undefined}
          value={secret}
          onChange={(event) => setSecret(event.currentTarget.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="rounded-lg border border-ghost px-4 py-2 text-sm font-semibold text-on-surface"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || secret.trim() === ''}
            className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-on-error disabled:opacity-60"
          >
            {deleting ? t('account.deleting') : t('account.deleteAction')}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AccountDataPanel;
