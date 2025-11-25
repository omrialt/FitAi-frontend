/**
 * MyTrainingsPage - Main trainings page with filters, table/cards, and pagination
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Container, Box, Center, Loader } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';
import { AppLayout } from '../components/AppLayout';
import { TrainingsBreadcrumbs } from '../components/trainings/TrainingsBreadcrumbs';
import { TrainingsHeader } from '../components/trainings/TrainingsHeader';
import { TrainingsFilters } from '../components/trainings/TrainingsFilters';
import { TrainingsTable } from '../components/trainings/TrainingsTable';
import { TrainingsCardList } from '../components/trainings/TrainingsCardList';
import { PaginationControls } from '../components/trainings/PaginationControls';
import { EditTrainingModal } from '../components/trainings/EditTrainingModal';
import { DeleteTrainingModal } from '../components/trainings/DeleteTrainingModal';
import { useExport } from '../hooks/useExport';
import { useAuthStore } from '../store/authStore';
import { trainingPlanService } from '../services/training-plan.service';
import type { TrainingPlan, TrainingFilters } from '../types/training.types';

export default function MyTrainingsPage() {
  const { user } = useAuthStore();
  const isCoach = user?.role === 'trainer' || user?.role === 'admin';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState<TrainingFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Data state
  const [allTrainings, setAllTrainings] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(null);

  // Export hook
  const { exportToPDF, exportToExcel } = useExport({
    filename: 'my-trainings',
    onSuccess: () => toast.success('Export completed successfully'),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
  });

  // Fetch trainings from API
  useEffect(() => {
    const loadTrainings = async () => {
      try {
        setIsLoading(true);
        const response = await trainingPlanService.getAll({
          page: 1,
          limit: 100,
        });

        console.log('Fetched trainings:', response);
        
        setAllTrainings(response.items);
      } catch (error) {
        console.error('Failed to fetch trainings:', error);
        toast.error('Failed to load trainings');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrainings();
  }, [user?._id]);

  // Refetch trainings function
  const refetchTrainings = async () => {
    try {
      setIsLoading(true);
      const response = await trainingPlanService.getAll({
        page: 1,
        limit: 100,
      });
      
      setAllTrainings(response.items);
    } catch (error) {
      console.error('Failed to refetch trainings:', error);
      toast.error('Failed to refresh trainings');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search trainings
  const trainings = useMemo(() => {
    let filtered = [...allTrainings];

    // Apply filters
    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter((t) => t.isActive === isActive);
    }
    if (filters.creator) {
      filtered = filtered.filter((t) => {
        const isOwnPlan = t.userId === user?._id;
        const isCoachPlan = !!t.trainerId;
        if (filters.creator === 'me') return isOwnPlan && !isCoachPlan;
        if (filters.creator === 'coach') return isCoachPlan;
        return !isOwnPlan && !isCoachPlan;
      });
    }
    if (filters.difficulty) {
      filtered = filtered.filter((t) => t.difficulty === filters.difficulty);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt || '') >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => new Date(t.createdAt || '') <= filters.dateTo!);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.focus?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allTrainings, filters, debouncedSearch, user?._id]);

  // Pagination
  const totalPages = Math.ceil(trainings.length / pageSize);
  const paginatedTrainings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return trainings.slice(start, start + pageSize);
  }, [trainings, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearch]);

  // Action handlers
  const handleView = (id: string) => {
    navigate(`/training-plans/${id}`);
  };

  const handleEdit = (id: string) => {
    const training = trainings.find((t) => t._id === id);
    if (!training) return;
    
    // Check if user has edit permission
    const isOwner = training.userId === user?._id || training.trainerId === user?._id;
    const hasEditAccess = training.sharedAccess?.some(
      (access) => access.userId === user?._id && access.accessLevel === 'edit'
    );
    
    if (!isOwner && !hasEditAccess) {
      toast.error('You do not have permission to edit this training plan');
      return;
    }
    
    setSelectedTraining(training);
    setEditModalOpened(true);
  };

  

  const handleDelete = (id: string) => {
    const training = trainings.find((t) => t._id === id);
    if (!training) return;
    
    // Only owner can delete
    const isOwner = training.userId === user?._id || training.trainerId === user?._id;
    if (!isOwner) {
      toast.error('You do not have permission to delete this training plan');
      return;
    }
    
    setSelectedTraining(training);
    setDeleteModalOpened(true);
  };


  const handleSaveEdit = async (data: Partial<TrainingPlan>) => {
    if (!selectedTraining) return;
    
    try {
      await trainingPlanService.update(selectedTraining._id, data);
      
      toast.success('Training updated successfully');
      await refetchTrainings();
      setEditModalOpened(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update training';
      toast.error(errorMessage);
    }
  };

 
  const handleConfirmDelete = async () => {
    if (!selectedTraining) return;
    
    try {
      await trainingPlanService.delete(selectedTraining._id);
      
      toast.success('Training deleted successfully');
      await refetchTrainings();
      setDeleteModalOpened(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete training';
      toast.error(errorMessage);
    }
  };

  const handleExportPDF = (training: TrainingPlan) => {
    const columns = [
      'Title',
      'Difficulty',
      'Status',
      'Days',
      'Focus',
      'Created',
    ];
    exportToPDF([training], columns);
  };

  const handleExportExcel = (training: TrainingPlan) => {
    const columns = [
      'Title',
      'Difficulty',
      'Status',
      'Days',
      'Focus',
      'Created',
    ];
    exportToExcel([training], columns);
  };

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <TrainingsBreadcrumbs />
        <TrainingsHeader />

        <TrainingsFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearchChange={setSearchQuery}
        />

        <Box pos="relative">
          {/* Loading State */}
          {isLoading && (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          )}

          {/* Responsive View */}
          {!isLoading && (
            <>
              {isMobile ? (
                <TrainingsCardList
                  trainings={paginatedTrainings}
                  isCoach={isCoach}
                  onView={handleView}
                  onEdit={handleEdit}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={isCoach ? handleDelete : undefined}
                />
              ) : (
                <TrainingsTable
                  trainings={paginatedTrainings}
                  isCoach={isCoach}
                  isAdmin={user?.role === 'admin'}
                  onView={handleView}
                  onEdit={handleEdit}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={isCoach ? handleDelete : undefined}
    
                />
              )}
            </>
          )}
        </Box>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          total={trainings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Container>

      {/* Modals */}
      <EditTrainingModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        training={selectedTraining}
        onSave={handleSaveEdit}
      />

    
      <DeleteTrainingModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        training={selectedTraining}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
