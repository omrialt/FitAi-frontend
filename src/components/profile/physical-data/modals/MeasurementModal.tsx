/**
 * MeasurementModal - Unified modal for adding or editing physical data measurements
 */

import { Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { AuthField } from '../../../auth/AuthField';
import type { CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../../../../types/physical-data.types';
import type { MeasurementModalProps } from '../../../../types/physical-data-components.types';

export function MeasurementModal({ 
  opened, 
  onClose, 
  measurement,
  lastRecord,
  onSave,
  onUpdate
}: MeasurementModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!measurement;

  // Form states
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number | string>('');
  const [bodyFatPercent, setBodyFatPercent] = useState<number | string>('');
  const [dateRecorded, setDateRecorded] = useState<Date | null>(new Date());
  
  // Measurements
  const [chest, setChest] = useState<number | string>('');
  const [waist, setWaist] = useState<number | string>('');
  const [hips, setHips] = useState<number | string>('');
  const [arms, setArms] = useState<number | string>('');
  const [legs, setLegs] = useState<number | string>('');

  // Load data when modal opens
  useEffect(() => {
    if (opened) {
      if (isEditMode && measurement) {
        // Edit mode: load measurement data
        setHeightCm(measurement.heightCm);
        setWeightKg(measurement.weightKg);
        setBodyFatPercent(measurement.bodyFatPercent || '');
        setDateRecorded(new Date(measurement.dateRecorded));
        setChest(measurement.measurements?.chest || '');
        setWaist(measurement.measurements?.waist || '');
        setHips(measurement.measurements?.hips || '');
        setArms(measurement.measurements?.arms || '');
        setLegs(measurement.measurements?.legs || '');
      } else if (!isEditMode && lastRecord) {
        // Add mode: load initial data from last record
        setHeightCm(lastRecord.heightCm);
        setWeightKg(lastRecord.weightKg);
        setBodyFatPercent(lastRecord.bodyFatPercent || '');
        setDateRecorded(new Date());
        setChest(lastRecord.measurements?.chest || '');
        setWaist(lastRecord.measurements?.waist || '');
        setHips(lastRecord.measurements?.hips || '');
        setArms(lastRecord.measurements?.arms || '');
        setLegs(lastRecord.measurements?.legs || '');
      } else if (!isEditMode && !lastRecord) {
        // Add mode: no last record, use defaults
        setHeightCm(user?.height || 170);
        setWeightKg('');
        setBodyFatPercent('');
        setDateRecorded(new Date());
        setChest('');
        setWaist('');
        setHips('');
        setArms('');
        setLegs('');
      }
    }
  }, [opened, isEditMode, measurement, lastRecord, user]);

  const handleSubmit = async () => {
    if (!weightKg || !heightCm) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && measurement && onUpdate) {
        // Edit mode
        const data: UpdatePhysicalDataDto = {
          heightCm,
          weightKg: typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg,
          bodyFatPercent: bodyFatPercent ? (typeof bodyFatPercent === 'string' ? parseFloat(bodyFatPercent) : bodyFatPercent) : undefined,
          dateRecorded: dateRecorded?.toISOString(),
          measurements: {
            chest: chest ? (typeof chest === 'string' ? parseFloat(chest) : chest) : undefined,
            waist: waist ? (typeof waist === 'string' ? parseFloat(waist) : waist) : undefined,
            hips: hips ? (typeof hips === 'string' ? parseFloat(hips) : hips) : undefined,
            arms: arms ? (typeof arms === 'string' ? parseFloat(arms) : arms) : undefined,
            legs: legs ? (typeof legs === 'string' ? parseFloat(legs) : legs) : undefined,
          },
        };
        await onUpdate(measurement._id, data);
      } else if (!isEditMode && user) {
        // Add mode
        const data: CreatePhysicalDataDto = {
          userId: user._id,
          heightCm,
          weightKg: typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg,
          bodyFatPercent: bodyFatPercent ? (typeof bodyFatPercent === 'string' ? parseFloat(bodyFatPercent) : bodyFatPercent) : undefined,
          dateRecorded: dateRecorded?.toISOString(),
          measurements: {
            chest: chest ? (typeof chest === 'string' ? parseFloat(chest) : chest) : undefined,
            waist: waist ? (typeof waist === 'string' ? parseFloat(waist) : waist) : undefined,
            hips: hips ? (typeof hips === 'string' ? parseFloat(hips) : hips) : undefined,
            arms: arms ? (typeof arms === 'string' ? parseFloat(arms) : arms) : undefined,
            legs: legs ? (typeof legs === 'string' ? parseFloat(legs) : legs) : undefined,
          },
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
      title={isEditMode ? t('physicalData.editMeasurement') : t('physicalData.addMeasurement')}
      centered
      size="500"
    >
      <div className="space-y-4">
        <AuthField
          id="dateRecorded"
          label={t('physicalData.dateRecorded')}
          icon="event"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={dateRecorded ? dateRecorded.toISOString().split('T')[0] : ''}
          onChange={(e) => setDateRecorded(e.target.value ? new Date(e.target.value) : null)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <AuthField
            id="heightCm"
            label={t('physicalData.heightCm')}
            icon="monitor_weight"
            type="number"
            min={100}
            max={250}
            step="0.1"
            placeholder="170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value === '' ? 170 : Number(e.target.value))}
            required
          />
          <AuthField
            id="weightKg"
            label={t('physicalData.weightKgHeader')}
            icon="scale"
            type="number"
            min={30}
            max={300}
            step="0.1"
            placeholder="70.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />
        </div>

        <AuthField
          id="bodyFatPercent"
          label={t('physicalData.bodyFatPct')}
          icon="water_drop"
          type="number"
          min={0}
          max={100}
          step="0.1"
          placeholder="15.5"
          value={bodyFatPercent}
          onChange={(e) => setBodyFatPercent(e.target.value === '' ? '' : Number(e.target.value))}
        />

        <div className="grid grid-cols-2 gap-4">
          <AuthField
            id="chest"
            label={t('physicalData.chestCm')}
            icon="exercise"
            type="number"
            min={0}
            max={200}
            step="0.1"
            placeholder="100"
            value={chest}
            onChange={(e) => setChest(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <AuthField
            id="waist"
            label={t('physicalData.waistCm')}
            icon="exercise"
            type="number"
            min={0}
            max={200}
            step="0.1"
            placeholder="80"
            value={waist}
            onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <AuthField
            id="hips"
            label={t('physicalData.hipsCm')}
            icon="exercise"
            type="number"
            min={0}
            max={200}
            step="0.1"
            placeholder="95"
            value={hips}
            onChange={(e) => setHips(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <AuthField
            id="arms"
            label={t('physicalData.armsCm')}
            icon="exercise"
            type="number"
            min={0}
            max={100}
            step="0.1"
            placeholder="35"
            value={arms}
            onChange={(e) => setArms(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AuthField
            id="legs"
            label={t('physicalData.legsCm')}
            icon="exercise"
            type="number"
            min={0}
            max={150}
            step="0.1"
            placeholder="60"
            value={legs}
            onChange={(e) => setLegs(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

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
            disabled={!weightKg || !heightCm || isSubmitting}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary-gradient text-white shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {isEditMode ? t('common.saveChanges') : t('physicalData.addMeasurement')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
