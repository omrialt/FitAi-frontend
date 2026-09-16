/**
 * TargetModal - Unified modal for creating or editing a physical target.
 *
 * A target bundles a target date with one or more metric goals (e.g. weight
 * + waist together for a single deadline), so the metric list is rendered as
 * checkable rows that reveal a value field once selected.
 */

import { Modal, Checkbox, NumberInput, Textarea, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthField } from '../../../auth/AuthField';
import { StitchIcon, type StitchIconName } from '../../../common/StitchIcon';
import type {
  CreatePhysicalTargetDto,
  UpdatePhysicalTargetDto,
  TargetMetric,
} from '../../../../types/physical-target.types';
import type { TargetModalProps } from '../../../../types/physical-target-components.types';

const METRICS: { key: TargetMetric; labelKey: string; icon: StitchIconName }[] = [
  { key: 'weightKg', labelKey: 'physicalData.weightKgHeader', icon: 'scale' },
  { key: 'bodyFatPercent', labelKey: 'physicalData.bodyFatPct', icon: 'water_drop' },
  { key: 'chest', labelKey: 'physicalData.chestCm', icon: 'exercise' },
  { key: 'waist', labelKey: 'physicalData.waistCm', icon: 'exercise' },
  { key: 'hips', labelKey: 'physicalData.hipsCm', icon: 'exercise' },
  { key: 'arms', labelKey: 'physicalData.armsCm', icon: 'exercise' },
  { key: 'legs', labelKey: 'physicalData.legsCm', icon: 'exercise' },
];

type MetricValues = Partial<Record<TargetMetric, number | ''>>;

export function TargetModal({ opened, onClose, target, onSave, onUpdate }: TargetModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!target;

  const [name, setName] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [values, setValues] = useState<MetricValues>({});

  useEffect(() => {
    if (!opened) return;

    if (target) {
      setName(target.name ?? '');
      setTargetDate(new Date(target.targetDate));
      setNotes(target.notes ?? '');
      // Copy only known metrics so a stray `_id` key is never sent back.
      const loaded: MetricValues = {};
      for (const { key } of METRICS) {
        const value = target.targetValues[key];
        if (value !== undefined) loaded[key] = value;
      }
      setValues(loaded);
    } else {
      setName('');
      setTargetDate(null);
      setNotes('');
      setValues({});
    }
  }, [opened, target]);

  const toggleMetric = (metric: TargetMetric, checked: boolean) => {
    setValues((prev) => {
      const next = { ...prev };
      if (checked) {
        next[metric] = prev[metric] ?? '';
      } else {
        delete next[metric];
      }
      return next;
    });
  };

  const selectedMetricValues = Object.entries(values).filter(
    ([, value]) => value !== undefined,
  ) as [TargetMetric, number | ''][];
  const hasValidMetric = selectedMetricValues.some(([, value]) => value !== '');
  const canSubmit = hasValidMetric && !!targetDate && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !targetDate) return;

    const targetValues: Partial<Record<TargetMetric, number>> = {};
    for (const [metric, value] of selectedMetricValues) {
      if (value !== '') targetValues[metric] = value;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && target) {
        const data: UpdatePhysicalTargetDto = {
          name: name.trim() || undefined,
          targetDate: targetDate.toISOString(),
          targetValues,
          notes: notes.trim() || undefined,
        };
        await onUpdate(target._id, data);
      } else {
        const data: CreatePhysicalTargetDto = {
          name: name.trim() || undefined,
          targetDate: targetDate.toISOString(),
          targetValues,
          notes: notes.trim() || undefined,
        };
        await onSave(data);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? t('physicalTargets.editTitle') : t('physicalTargets.addTitle')}
      centered
      size="500"
    >
      <div className="space-y-4">
        <AuthField
          id="targetName"
          label={t('physicalTargets.name')}
          icon="track_changes"
          type="text"
          placeholder={t('physicalTargets.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <DateInput
          label={t('physicalTargets.targetDate')}
          placeholder={t('physicalTargets.selectDate')}
          minDate={new Date()}
          // Day-first reads naturally in Hebrew ("30 נובמבר 2026") and matches
          // the app's dd/mm dates elsewhere; the default is US month-first.
          valueFormat="D MMMM YYYY"
          value={targetDate}
          onChange={(date) => setTargetDate(date ? new Date(date) : null)}
          required
          clearable
        />

        <div className="space-y-2">
          <p className="text-[11.5px] font-bold text-on-surface-variant mx-1">
            {t('physicalTargets.selectMetrics')}
          </p>
          <Stack gap="xs">
            {METRICS.map(({ key, labelKey, icon }) => {
              const checked = values[key] !== undefined;
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest"
                >
                  <Checkbox
                    checked={checked}
                    onChange={(e) => toggleMetric(key, e.currentTarget.checked)}
                  />
                  <StitchIcon name={icon} size={18} />
                  <span className="text-sm font-bold text-on-surface flex-1">{t(labelKey)}</span>
                  {checked && (
                    <NumberInput
                      value={values[key]}
                      onChange={(v) =>
                        setValues((prev) => ({
                          ...prev,
                          [key]: typeof v === 'number' ? v : '',
                        }))
                      }
                      min={0}
                      step={0.1}
                      decimalScale={1}
                      w={110}
                      size="sm"
                      hideControls
                    />
                  )}
                </div>
              );
            })}
          </Stack>
        </div>

        <Textarea
          label={t('physicalTargets.notes')}
          placeholder={t('physicalTargets.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-60"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary-gradient text-white shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {isEditMode ? t('common.saveChanges') : t('physicalTargets.setTarget')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
