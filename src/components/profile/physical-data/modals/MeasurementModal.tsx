/**
 * MeasurementModal - Unified modal for adding or editing physical data measurements
 */

import { Modal, Button, Stack, Group, NumberInput, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import type { PhysicalData, CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../../../../types/physical-data.types';

interface MeasurementModalProps {
  opened: boolean;
  onClose: () => void;
  measurement?: PhysicalData | null;
  lastRecord?: PhysicalData | null;
  onSave: (data: CreatePhysicalDataDto) => Promise<void>;
  onUpdate?: (id: string, data: UpdatePhysicalDataDto) => Promise<void>;
}

export function MeasurementModal({ 
  opened, 
  onClose, 
  measurement,
  lastRecord,
  onSave,
  onUpdate
}: MeasurementModalProps) {
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
      title={isEditMode ? "Edit Measurement" : "Add Measurement"}
      centered
      size="lg"
    >
      <Stack gap="md">
        <DateInput
          label="Date Recorded"
          placeholder="Select date"
          value={dateRecorded}
          onChange={(value) => setDateRecorded(value ? new Date(value) : null)}
          required
          maxDate={new Date()}
        />

        <Group grow>
          <NumberInput
            label="Height (cm)"
            placeholder="170"
            value={heightCm}
            onChange={(val) => setHeightCm(typeof val === 'number' ? val : 170)}
            required
            min={100}
            max={250}
            decimalScale={1}
          />
          <NumberInput
            label="Weight (kg)"
            placeholder="70.5"
            value={weightKg}
            onChange={setWeightKg}
            required
            min={30}
            max={300}
            decimalScale={1}
          />
        </Group>

        <NumberInput
          label="Body Fat %"
          placeholder="15.5"
          value={bodyFatPercent}
          onChange={setBodyFatPercent}
          min={0}
          max={100}
          decimalScale={1}
        />

        
        <Group grow>
          <NumberInput
            label="Chest (cm)"
            placeholder="100"
            value={chest}
            onChange={setChest}
            min={0}
            max={200}
            decimalScale={1}
          />
          <NumberInput
            label="Waist (cm)"
            placeholder="80"
            value={waist}
            onChange={setWaist}
            min={0}
            max={200}
            decimalScale={1}
          />
        </Group>

        <Group grow>
          <NumberInput
            label="Hips (cm)"
            placeholder="95"
            value={hips}
            onChange={setHips}
            min={0}
            max={200}
            decimalScale={1}
          />
          <NumberInput
            label="Arms (cm)"
            placeholder="35"
            value={arms}
            onChange={setArms}
            min={0}
            max={100}
            decimalScale={1}
          />
        </Group>

        <NumberInput
          label="Legs (cm)"
          placeholder="60"
          value={legs}
          onChange={setLegs}
          min={0}
          max={150}
          decimalScale={1}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!weightKg || !heightCm}
            loading={isSubmitting}
          >
            {isEditMode ? "Save Changes" : "Add Measurement"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
