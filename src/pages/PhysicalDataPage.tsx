/**
 * PhysicalDataPage - Complete physical data tracking page
 */

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack, Center, Loader, Alert, SimpleGrid } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/AppLayout';
import { AppBreadcrumbs } from '../components/common/AppBreadcrumbs';
import { PhysicalDataHeader } from '../components/profile/physical-data/PhysicalDataHeader';
import { LatestRecordCard } from '../components/profile/physical-data/cards/LatestRecordCard';
import { NoRecordsMessage } from '../components/profile/physical-data/cards/NoRecordsMessage';
import { MeasurementsChart } from '../components/profile/physical-data/charts/MeasurementsChart';
import { MeasurementsTable } from '../components/profile/physical-data/table/MeasurementsTable';
import { MeasurementModal } from '../components/profile/physical-data/modals/MeasurementModal';
import { DeleteMeasurementModal } from '../components/profile/physical-data/modals/DeleteMeasurementModal';
import { TargetsList } from '../components/profile/physical-data/targets/TargetsList';
import { TargetModal } from '../components/profile/physical-data/targets/TargetModal';
import { DeleteTargetModal } from '../components/profile/physical-data/targets/DeleteTargetModal';
import { useAuth } from '../hooks/useAuth';
import physicalDataService from '../services/physical-data.service';
import physicalTargetService from '../services/physical-target.service';
import type { PhysicalData, CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../types/physical-data.types';
import type {
  PhysicalTarget,
  CreatePhysicalTargetDto,
  UpdatePhysicalTargetDto,
  TargetProgress,
} from '../types/physical-target.types';
import { BodyPhotoTimeline } from '../components/profile/BodyPhotoTimeline';

export default function PhysicalDataPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [physicalData, setPhysicalData] = useState<PhysicalData[]>([]);
  const [latestRecord, setLatestRecord] = useState<PhysicalData | null>(null);
  const [bmiData, setBmiData] = useState<{ bmi: number; category: string } | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<PhysicalData | null>(null);
  const [targets, setTargets] = useState<PhysicalTarget[]>([]);
  const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<PhysicalTarget | null>(null);

  // Modal states
  const [measurementModalOpened, setMeasurementModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [targetModalOpened, setTargetModalOpened] = useState(false);
  const [deleteTargetModalOpened, setDeleteTargetModalOpened] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    // The dashboard is mounted at '/', not '/dashboard' — the old href fell
    // through to the 404 page.
    { label: t('nav.dashboard'), href: '/' },
    { label: t('layout.profile'), href: '/profile' },
    { label: t('physicalData.title') },
  ];

  // Fetch all data for the user
  const loadPhysicalData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const records = await physicalDataService.getByUserId(user._id);
      const latest = await physicalDataService.getLatestByUserId(user._id);
      const bmi = await physicalDataService.calculateBMI(user._id).catch(() => null);
      const userTargets = await physicalTargetService.getByUserId(user._id).catch(() => []);
      const progress = await physicalTargetService.getProgress(user._id).catch(() => []);

      setPhysicalData(records);
      setLatestRecord(latest);
      setBmiData(bmi);
      setTargets(userTargets);
      setTargetProgress(progress);
    } catch (error) {
      console.error('Error loading physical data:', error);
      toast.error(t('physicalData.loadFailed'));
    } finally {
      setLoadingData(false);
    }
  }, [user, t]);

  // Initial load
  useEffect(() => {
    loadPhysicalData();
  }, [loadPhysicalData]);

  // Handlers
  const handleAddMeasurement = async (data: CreatePhysicalDataDto) => {
    try {
      await physicalDataService.create(data);
      await loadPhysicalData();
      toast.success(t('physicalData.addedSuccess'));
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast.error(t('physicalData.addFailed'));
    }
  };

  const handleEditMeasurement = async (id: string, data: UpdatePhysicalDataDto) => {
    try {
      await physicalDataService.update(id, data);
      await loadPhysicalData();
      toast.success(t('physicalData.updatedSuccess'));
    } catch (error) {
      console.error('Error updating measurement:', error);
      toast.error(t('physicalData.updateFailed'));
    }
  };

  const handleDeleteMeasurement = async () => {
    if (!selectedMeasurement) return;

    try {
      await physicalDataService.delete(selectedMeasurement._id);
      await loadPhysicalData();
      setDeleteModalOpened(false);
      setSelectedMeasurement(null);
      toast.success(t('physicalData.deletedSuccess'));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error(t('physicalData.deleteFailed'));
    }
  };

  const openEditModal = (measurement: PhysicalData) => {
    setSelectedMeasurement(measurement);
    setMeasurementModalOpened(true);
  };

  const openDeleteModal = (measurement: PhysicalData) => {
    setSelectedMeasurement(measurement);
    setDeleteModalOpened(true);
  };

  // Target handlers
  const handleAddTarget = async (data: CreatePhysicalTargetDto) => {
    try {
      await physicalTargetService.create(data);
      await loadPhysicalData();
      toast.success(t('physicalTargets.addedSuccess'));
    } catch (error) {
      console.error('Error adding target:', error);
      toast.error(t('physicalTargets.addFailed'));
    }
  };

  const handleEditTarget = async (id: string, data: UpdatePhysicalTargetDto) => {
    try {
      await physicalTargetService.update(id, data);
      await loadPhysicalData();
      toast.success(t('physicalTargets.updatedSuccess'));
    } catch (error) {
      console.error('Error updating target:', error);
      toast.error(t('physicalTargets.updateFailed'));
    }
  };

  const handleDeleteTarget = async () => {
    if (!selectedTarget) return;

    try {
      await physicalTargetService.delete(selectedTarget._id);
      await loadPhysicalData();
      setDeleteTargetModalOpened(false);
      setSelectedTarget(null);
      toast.success(t('physicalTargets.deletedSuccess'));
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error(t('physicalTargets.deleteFailed'));
    }
  };

  const openEditTargetModal = (target: PhysicalTarget) => {
    setSelectedTarget(target);
    setTargetModalOpened(true);
  };

  const openDeleteTargetModal = (target: PhysicalTarget) => {
    setSelectedTarget(target);
    setDeleteTargetModalOpened(true);
  };

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        {/* Breadcrumbs */}
        <AppBreadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <PhysicalDataHeader
          onAddMeasurement={() => {
            setSelectedMeasurement(null);
            setMeasurementModalOpened(true);
          }}
          onSetTarget={() => {
            setSelectedTarget(null);
            setTargetModalOpened(true);
          }}
        />

        {/* Loading State */}
        {loadingData && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {/* Error State */}
        {!loadingData && !user && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title={t('common.error')}>
            {t('physicalData.notAuthenticated')}
          </Alert>
        )}

        {/* Content */}
        {!loadingData && user && (
          <Stack gap="xl">
            {/* Top row: Latest Metrics + Chart side by side */}
            {latestRecord ? (
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
                <LatestRecordCard 
                  record={latestRecord} 
                  previousRecord={physicalData.length > 1 ? physicalData[1] : null}
                  bmi={bmiData || undefined} 
                />
                {physicalData.length > 0 && (
                  <MeasurementsChart data={physicalData} />
                )}
              </SimpleGrid>
            ) : (
              <NoRecordsMessage onAddMeasurement={() => {
                setSelectedMeasurement(null);
                setMeasurementModalOpened(true);
              }} />
            )}

            {/* Targets */}
            <TargetsList
              targets={targets}
              progress={targetProgress}
              onEdit={openEditTargetModal}
              onDelete={openDeleteTargetModal}
            />

            {/* Table */}
            {physicalData.length > 0 && (
              <MeasurementsTable
                data={physicalData}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            )}

            {/* Sits with the measurements because it is the same question
                asked differently — but sharing is decided per photo here and
                is never inherited from whatever the measurements allow. */}
            <BodyPhotoTimeline />
          </Stack>
        )}

        {/* Modals */}
        <MeasurementModal
          opened={measurementModalOpened}
          onClose={() => {
            setMeasurementModalOpened(false);
            setSelectedMeasurement(null);
          }}
          measurement={selectedMeasurement}
          lastRecord={latestRecord}
          onSave={handleAddMeasurement}
          onUpdate={handleEditMeasurement}
        />

        <DeleteMeasurementModal
          opened={deleteModalOpened}
          onClose={() => {
            setDeleteModalOpened(false);
            setSelectedMeasurement(null);
          }}
          measurement={selectedMeasurement}
          onConfirm={handleDeleteMeasurement}
        />

        <TargetModal
          opened={targetModalOpened}
          onClose={() => {
            setTargetModalOpened(false);
            setSelectedTarget(null);
          }}
          target={selectedTarget}
          onSave={handleAddTarget}
          onUpdate={handleEditTarget}
        />

        <DeleteTargetModal
          opened={deleteTargetModalOpened}
          onClose={() => {
            setDeleteTargetModalOpened(false);
            setSelectedTarget(null);
          }}
          target={selectedTarget}
          onConfirm={handleDeleteTarget}
        />
      </Container>
    </AppLayout>
  );
}
