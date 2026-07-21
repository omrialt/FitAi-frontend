import type { ReactNode } from 'react';
import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from './StitchIcon';

/**
 * Shared destructive-confirmation modal — "Performance Lab" design.
 *
 * The training, nutrition and measurement delete dialogs were three near-copies
 * of the same markup; they now share this shell and supply only their own
 * detail lines via `children`.
 */

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Modal title, also used on the confirm button. */
  title: string;
  /** Lead question, e.g. "Are you sure you want to delete this plan?" */
  question: string;
  /** Consequence line, rendered in the error tone. */
  warning: string;
  /** Optional detail (name, summary) shown between question and warning. */
  children?: ReactNode;
  /** Label for the confirm button; defaults to `title`. */
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title,
  question,
  warning,
  children,
  confirmLabel,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      title={
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {title}
        </h3>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <StitchIcon name="warning" size={20} />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="font-bold text-on-surface">{question}</p>
            {children}
            <p className="text-sm text-error">{warning}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-error text-on-error hover:opacity-90 transition-opacity"
          >
            {confirmLabel ?? title}
          </button>
        </div>
      </div>
    </Modal>
  );
}
