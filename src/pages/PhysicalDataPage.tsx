/**
 * PhysicalDataPage - Complete physical data tracking page
 */

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack, Alert, SimpleGrid, Tabs } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { TrainingProgressTab, InsightsProgressTab } from '../components/progress/ProgressTabs';
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
  PhysicalTargetStatus,
  CreatePhysicalTargetDto,
  UpdatePhysicalTargetDto,
  TargetProgress,
} from '../types/physical-target.types';
import { BodyPhotoTimeline } from '../components/profile/BodyPhotoTimeline';

export default function PhysicalDataPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab = tabParam === 'training' || tabParam === 'insights' ? tabParam : 'body';
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

  // Quick weigh-in from the app's log sheet: /physical-data?add=weight opens
  // the measurement form straight away, prefilled from the last record, with
  // the cursor in the weight field. The param is dropped so a refresh or a
  // back navigation does not reopen it.
  useEffect(() => {
    if (searchParams.get('add') !== 'weight') return;
    setSelectedMeasurement(null);
    setMeasurementModalOpened(true);
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // The active target says which way the scale should move. Undefined when
  // there is no weight target, so the change is shown without a verdict.
  const activeWeightTarget = targets.find(
    (target) => target.status === 'active' && target.targetValues.weightKg != null,
  )?.targetValues.weightKg;
  const weightLowerIsBetter =
    activeWeightTarget != null && latestRecord
      ? activeWeightTarget < latestRecord.weightKg
      : undefined;

  // Breadcrumb items
  const breadcrumbItems = [
    // The dashboard is mounted at '/', not '/dashboard' — the old href fell
    // through to the 404 page.
    { label: t('nav.dashboard'), href: '/' },
    { label: t('layout.profile'), href: '/profile' },
    { label: t('progress.title') },
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

  /**
   * Finish a target, or reopen one. Its own handler rather than going through
   * the edit modal: closing a goal is one tap on the card, and the toast says
   * which of the three things just happened.
   */
  const handleTargetStatus = async (target: PhysicalTarget, status: PhysicalTargetStatus) => {
    try {
      await physicalTargetService.update(target._id, { status });
      await loadPhysicalData();
      toast.success(t(`physicalTargets.statusChanged.${status}`));
    } catch (error) {
      console.error('Error changing target status:', error);
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

        {/* Progress = body + training + insights, one tab at a time (direction
            B). The tab lives in the URL so Today can link straight to one. */}
        <Tabs
          value={tab}
          onChange={(v) => setSearchParams(v && v !== 'body' ? { tab: v } : {}, { replace: true })}
          keepMounted={false}
          className="progress-tabs mb-6"
        >
          <Tabs.List grow>
            <Tabs.Tab value="body">{t('progress.tabBody')}</Tabs.Tab>
            <Tabs.Tab value="training">{t('progress.tabTraining')}</Tabs.Tab>
            <Tabs.Tab value="insights">{t('progress.tabInsights')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="training" pt="lg">
            {user && <TrainingProgressTab userId={user._id} />}
          </Tabs.Panel>
          <Tabs.Panel value="insights" pt="lg">
            <InsightsProgressTab />
          </Tabs.Panel>
        </Tabs>

        {/* Loading State — the shape of the body tab, not a spinner. */}
        {tab === 'body' && loadingData && (
          <div className="flex flex-col gap-4" aria-busy="true">
            <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
            <div className="skeleton h-64 w-full rounded-[var(--radius-card)]" />
          </div>
        )}

        {/* Error State */}
        {tab === 'body' && !loadingData && !user && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title={t('common.error')}>
            {t('physicalData.notAuthenticated')}
          </Alert>
        )}

        {/* Content */}
        {tab === 'body' && !loadingData && user && (
          <Stack gap="xl">
            {/* Top row: Latest Metrics + Chart side by side */}
            {latestRecord ? (
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
                <LatestRecordCard 
                  record={latestRecord} 
                  previousRecord={physicalData.length > 1 ? physicalData[1] : null}
                  bmi={bmiData || undefined}
                  weightLowerIsBetter={weightLowerIsBetter}
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
              onStatusChange={handleTargetStatus}
              attributionFor={(target) =>
                target.createdBy && target.createdBy !== user?._id
                  ? t('physicalTargets.setByTrainer')
                  : null
              }
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
