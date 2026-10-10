import { useEffect, useRef, useState } from 'react';
import { Modal, NumberInput, Stack, Group, Button, Text, Loader, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import trainerDashboardService from '../../services/trainer-dashboard.service';
import {
  ALERT_SETTING_BOUNDS,
  DEFAULT_ALERT_SETTINGS,
  type TrainerAlertSettings,
} from '../../types/trainer-dashboard.types';

interface AlertSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  /** Called after a save, so the roster can be re-judged by the new numbers. */
  onSaved: () => void;
}

/**
 * The roster's thresholds, in the trainer's hands.
 *
 * They were constants — 7 and 10 days idle, half a kilo over 21 days — which
 * suit a client who trains four times a week and nag about one who trains
 * twice. The defaults are still the defaults; this only lets a coach say
 * "not for my clients" once instead of learning to ignore an alert.
 */
export function AlertSettingsModal({ opened, onClose, onSaved }: AlertSettingsModalProps) {
  const { t } = useTranslation();
  // Read through a ref so the loader depends only on `opened` — a changed `t`
  // must not refetch and throw away numbers being edited.
  const tRef = useRef(t);
  tRef.current = t;
  const [values, setValues] = useState<TrainerAlertSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!opened) return;
    let cancelled = false;
    setValues(null);

    trainerDashboardService
      .getSettings()
      .then((settings) => {
        if (!cancelled) setValues(settings);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error(tRef.current('trainerDashboard.settings.loadFailed'));
        setValues(DEFAULT_ALERT_SETTINGS);
      });

    return () => {
      cancelled = true;
    };
  }, [opened]);

  const set = (key: keyof TrainerAlertSettings) => (value: string | number) =>
    setValues((current) => (current ? { ...current, [key]: Number(value) } : current));

  // The server refuses the same, but saying so before the request means the
  // trainer sees which field is wrong rather than a toast about "the settings".
  const orderError =
    values && values.idleWarnDays <= values.idleInfoDays
      ? t('trainerDashboard.settings.warnAfterInfo')
      : null;

  const save = async () => {
    if (!values || orderError) return;
    setSaving(true);
    try {
      await trainerDashboardService.saveSettings(values);
      toast.success(t('trainerDashboard.settings.saved'));
      onSaved();
      onClose();
    } catch {
      toast.error(t('trainerDashboard.settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const { idleDays, stallMinSpanDays, stallMaxChangeKg } = ALERT_SETTING_BOUNDS;

  return (
    <Modal opened={opened} onClose={onClose} title={t('trainerDashboard.settings.title')}>
      {!values ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('trainerDashboard.settings.intro')}
          </Text>

          <NumberInput
            label={t('trainerDashboard.settings.idleInfoDays')}
            description={t('trainerDashboard.settings.idleInfoDaysHint')}
            min={idleDays.min}
            max={idleDays.max}
            allowDecimal={false}
            value={values.idleInfoDays}
            onChange={set('idleInfoDays')}
          />
          <NumberInput
            label={t('trainerDashboard.settings.idleWarnDays')}
            description={t('trainerDashboard.settings.idleWarnDaysHint')}
            min={idleDays.min}
            max={idleDays.max}
            allowDecimal={false}
            value={values.idleWarnDays}
            onChange={set('idleWarnDays')}
            error={orderError}
          />
          <NumberInput
            label={t('trainerDashboard.settings.stallMinSpanDays')}
            description={t('trainerDashboard.settings.stallMinSpanDaysHint')}
            min={stallMinSpanDays.min}
            max={stallMinSpanDays.max}
            allowDecimal={false}
            value={values.stallMinSpanDays}
            onChange={set('stallMinSpanDays')}
          />
          <NumberInput
            label={t('trainerDashboard.settings.stallMaxChangeKg')}
            description={t('trainerDashboard.settings.stallMaxChangeKgHint')}
            min={stallMaxChangeKg.min}
            max={stallMaxChangeKg.max}
            step={0.1}
            decimalScale={1}
            value={values.stallMaxChangeKg}
            onChange={set('stallMaxChangeKg')}
          />

          <Group justify="space-between" wrap="wrap">
            <Button variant="subtle" onClick={() => setValues(DEFAULT_ALERT_SETTINGS)}>
              {t('trainerDashboard.settings.reset')}
            </Button>
            <Group gap="xs">
              <Button variant="default" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button onClick={save} loading={saving} disabled={!!orderError}>
                {t('common.save')}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
