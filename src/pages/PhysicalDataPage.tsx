/**
 * PhysicalDataPage - Complete physical data tracking page
 */

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack, Center, Loader, Alert, SimpleGrid } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { AppLayout } from '../components/AppLayout';
import { AppBreadcrumbs } from '../components/common/AppBreadcrumbs';
import { PhysicalDataHeader } from '../components/profile/physical-data/PhysicalDataHeader';
import { LatestRecordCard } from '../components/profile/physical-data/cards/LatestRecordCard';
import { NoRecordsMessage } from '../components/profile/physical-data/cards/NoRecordsMessage';
import { MeasurementsChart } from '../components/profile/physical-data/charts/MeasurementsChart';
import { MeasurementsTable } from '../components/profile/physical-data/table/MeasurementsTable';
import { MeasurementModal } from '../components/profile/physical-data/modals/MeasurementModal';
import { DeleteMeasurementModal } from '../components/profile/physical-data/modals/DeleteMeasurementModal';
import { useAuth } from '../hooks/useAuth';
import physicalDataService from '../services/physical-data.service';
import type { PhysicalData, CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../types/physical-data.types';

export default function PhysicalDataPage() {
  const { user } = useAuth();
  const [physicalData, setPhysicalData] = useState<PhysicalData[]>([]);
  const [latestRecord, setLatestRecord] = useState<PhysicalData | null>(null);
  const [bmiData, setBmiData] = useState<{ bmi: number; category: string } | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<PhysicalData | null>(null);

  // Modal states
  const [measurementModalOpened, setMeasurementModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Physical Data' },
  ];

  // Fetch all data for the user
  const loadPhysicalData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const records = await physicalDataService.getByUserId(user._id);
      const latest = await physicalDataService.getLatestByUserId(user._id);
      const bmi = await physicalDataService.calculateBMI(user._id).catch(() => null);

      setPhysicalData(records);
      setLatestRecord(latest);
      setBmiData(bmi);
    } catch (error) {
      console.error('Error loading physical data:', error);
      toast.error('Failed to load physical data');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadPhysicalData();
  }, [loadPhysicalData]);

  // Handlers
  const handleAddMeasurement = async (data: CreatePhysicalDataDto) => {
    try {
      await physicalDataService.create(data);
      await loadPhysicalData();
      toast.success('Measurement added successfully');
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast.error('Failed to add measurement');
    }
  };

  const handleEditMeasurement = async (id: string, data: UpdatePhysicalDataDto) => {
    try {
      await physicalDataService.update(id, data);
      await loadPhysicalData();
      toast.success('Measurement updated successfully');
    } catch (error) {
      console.error('Error updating measurement:', error);
      toast.error('Failed to update measurement');
    }
  };

  const handleDeleteMeasurement = async () => {
    if (!selectedMeasurement) return;

    try {
      await physicalDataService.delete(selectedMeasurement._id);
      await loadPhysicalData();
      setDeleteModalOpened(false);
      setSelectedMeasurement(null);
      toast.success('Measurement deleted successfully');
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error('Failed to delete measurement');
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

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        {/* Breadcrumbs */}
        <AppBreadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <PhysicalDataHeader onAddMeasurement={() => {
          setSelectedMeasurement(null);
          setMeasurementModalOpened(true);
        }} />

        {/* Loading State */}
        {loadingData && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {/* Error State */}
        {!loadingData && !user && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            User not authenticated
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

            {/* Table */}
            {physicalData.length > 0 && (
              <MeasurementsTable
                data={physicalData}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            )}
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
      </Container>
    </AppLayout>
  );
}
