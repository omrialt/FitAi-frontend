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
import { DuplicateTrainingModal } from '../components/trainings/DuplicateTrainingModal';
import { DeleteTrainingModal } from '../components/trainings/DeleteTrainingModal';
import { useExport } from '../hooks/useExport';
import { useAuthStore } from '../store/authStore';
import { trainingPlanService } from '../services/training-plan.service';
import type { TrainingPlan, TrainingFilters } from '../types/training.types';

export default function MyTrainingsPage() {
  const { user } = useAuthStore();
  const isCoach = user?.role === 'trainer';
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
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [duplicateModalOpened, setDuplicateModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

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
        
        const mapped = response.items.map((plan) => 
          mapTrainingPlanToTraining(plan, user?._id)
        );
        setAllTrainings(mapped);
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
      
      const mapped = response.items.map((plan) => 
        mapTrainingPlanToTraining(plan, user?._id)
      );
      setAllTrainings(mapped);
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
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.creator) {
      filtered = filtered.filter((t) => t.creator === filters.creator);
    }
    if (filters.difficulty) {
      filtered = filtered.filter((t) => t.difficulty === filters.difficulty);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => new Date(t.createdAt) <= filters.dateTo!);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.trainingType.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allTrainings, filters, debouncedSearch]);

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
    const training = trainings.find((t) => t.id === id);
    setSelectedTraining(training || null);
    setEditModalOpened(true);
  };

  const handleDuplicate = (id: string) => {
    const training = trainings.find((t) => t.id === id);
    setSelectedTraining(training || null);
    setDuplicateModalOpened(true);
  };

  const handleDelete = (id: string) => {
    const training = trainings.find((t) => t.id === id);
    setSelectedTraining(training || null);
    setDeleteModalOpened(true);
  };

  const handleShare = (id: string) => {
    // TODO: Implement share modal/dialog
    toast.info(`Share training ${id} - Feature coming soon`);
  };

  const handleMakePublic = async (id: string) => {
    try {
      // For now, we'll use the share functionality
      toast.info(`Make public feature coming soon for training ${id}`);
    } catch {
      toast.error('Failed to make training public');
    }
  };

  const handleSaveEdit = async (data: Partial<Training>) => {
    if (!selectedTraining) return;
    
    try {
      // Map UI difficulty to backend difficulty
      let backendDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (data.difficulty === 'easy' || data.difficulty === 'beginner') {
        backendDifficulty = 'beginner';
      } else if (data.difficulty === 'medium' || data.difficulty === 'intermediate') {
        backendDifficulty = 'intermediate';
      } else if (data.difficulty === 'hard' || data.difficulty === 'advanced') {
        backendDifficulty = 'advanced';
      }
      
      await trainingPlanService.update(selectedTraining.id, {
        title: data.name,
        description: data.description,
        difficulty: backendDifficulty,
        estimatedDuration: data.duration,
      });
      
      toast.success('Training updated successfully');
      await refetchTrainings();
      setEditModalOpened(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update training';
      toast.error(errorMessage);
    }
  };

  const handleConfirmDuplicate = async (name: string) => {
    if (!selectedTraining) return;
    
    try {
      await trainingPlanService.duplicate(selectedTraining.id, name);
      
      toast.success(`Training "${name}" duplicated successfully`);
      await refetchTrainings();
      setDuplicateModalOpened(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate training';
      toast.error(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTraining) return;
    
    try {
      await trainingPlanService.delete(selectedTraining.id);
      
      toast.success('Training deleted successfully');
      await refetchTrainings();
      setDeleteModalOpened(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete training';
      toast.error(errorMessage);
    }
  };

  const handleExportPDF = (training: Training) => {
    const columns = [
      'Name',
      'Type',
      'Workouts/Week',
      'Status',
      'Creator',
      'Difficulty',
      'Created',
    ];
    exportToPDF([training], columns);
  };

  const handleExportExcel = (training: Training) => {
    const columns = [
      'Name',
      'Type',
      'Workouts/Week',
      'Status',
      'Creator',
      'Difficulty',
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
                  onDuplicate={handleDuplicate}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={isCoach ? handleDelete : undefined}
                  onShare={isCoach ? handleShare : undefined}
                  onMakePublic={isCoach ? handleMakePublic : undefined}
                />
              ) : (
                <TrainingsTable
                  trainings={paginatedTrainings}
                  isCoach={isCoach}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={isCoach ? handleDelete : undefined}
                  onShare={isCoach ? handleShare : undefined}
                  onMakePublic={isCoach ? handleMakePublic : undefined}
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

      <DuplicateTrainingModal
        opened={duplicateModalOpened}
        onClose={() => setDuplicateModalOpened(false)}
        training={selectedTraining}
        onDuplicate={handleConfirmDuplicate}
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
