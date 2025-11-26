/**
 * MyTrainingsPage - Main trainings page with filters, table/cards, and pagination
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { Container, Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { useApi, useApiMutation } from "../hooks/useApi";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { TrainingsBreadcrumbs } from "../components/trainings/TrainingsBreadcrumbs";
import { TrainingsHeader } from "../components/trainings/TrainingsHeader";
import { TrainingsFilters } from "../components/trainings/TrainingsFilters";
import { TrainingsTable } from "../components/trainings/TrainingsTable";
import { TrainingsCardList } from "../components/trainings/TrainingsCardList";
import { PaginationControls } from "../components/trainings/PaginationControls";
import { EditTrainingModal } from "../components/trainings/EditTrainingModal";
import { DeleteTrainingModal } from "../components/trainings/DeleteTrainingModal";
import { useExport } from "../hooks/useExport";
import { useAuthStore } from "../store/authStore";
import type { TrainingPlan, TrainingFilters } from "../types/training.types";
import type { TrainingPlansResponse } from "../types/training-plan.types";

export default function MyTrainingsPage() {
  const { user } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState<TrainingFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API hooks
  const { data: trainingsData, loading: isLoading, execute: fetchTrainings } = useApi<TrainingPlansResponse>({
    showErrorToast: true,
  });
  const { mutate: updateTraining } = useApiMutation<TrainingPlan>({
    showSuccessToast: true,
    successMessage: 'Training updated successfully',
  });
  const { mutate: deleteTraining } = useApiMutation<{ message: string }>({
    showSuccessToast: true,
    successMessage: 'Training deleted successfully',
  });

  const allTrainings = useMemo(() => {
    return trainingsData?.data.items || [];
  }, [trainingsData]);

  // Modals state
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(
    null
  );

  // Export hook
  const { exportToPDF, exportToExcel } = useExport({
    filename: "my-trainings",
    onSuccess: () => toast.success("Export completed successfully"),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
  });

  // Fetch trainings from API
  useEffect(() => {
    fetchTrainings('/training-plans?page=1&limit=100');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Refetch trainings function
  const refetchTrainings = async () => {
    await fetchTrainings('/training-plans?page=1&limit=100');
  };

  // Filter and search trainings
  const trainings = useMemo(() => {
    let filtered = [...allTrainings];

    // Apply filters
    if (filters.creator) {
      filtered = filtered.filter((t) => {
        const userId = typeof t.userId === 'string' ? t.userId : t.userId._id;
        const isOwnPlan = userId === user?._id;
        const isCoachPlan = !!t.trainerId;
        if (filters.creator === "me") return isOwnPlan;
        if (filters.creator === "coach") return isCoachPlan;
        return !isOwnPlan && !isCoachPlan;
      });
    }
    if (filters.difficulty) {
      filtered = filtered.filter((t) => t.difficulty === filters.difficulty);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(query);
        const focusMatch = t.focus?.toLowerCase().includes(query);

        // Search in creator name
        let creatorMatch = false;
        if (typeof t.userId === "object" && t.userId?.fullName) {
          creatorMatch = t.userId.fullName.toLowerCase().includes(query);
        }
        if (
          !creatorMatch &&
          typeof t.trainerId === "object" &&
          t.trainerId?.fullName
        ) {
          creatorMatch = t.trainerId.fullName.toLowerCase().includes(query);
        }

        return titleMatch || focusMatch || creatorMatch;
      });
    }

    return filtered;
  }, [allTrainings, filters, debouncedSearch, user?._id]);

  // Pagination
  const totalPages = Math.ceil(trainings.length / pageSize);
  const paginatedTrainings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const result = trainings.slice(start, start + pageSize);
    return result;
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
    const userId = typeof training.userId === 'string' ? training.userId : training.userId?._id;
    const trainerId = typeof training.trainerId === 'string' ? training.trainerId : training.trainerId?._id;
    const isOwner = userId === user?._id || trainerId === user?._id || user?.role === 'admin';
   
    if (!isOwner) {
      toast.error("You do not have permission to edit this training plan");
      return;
    }

    setSelectedTraining(training);
    setEditModalOpened(true);
  };

  const handleDelete = (id: string) => {
    const training = trainings.find((t) => t._id === id);
    if (!training) return;

    // Only owner can delete
    const userId = typeof training.userId === 'string' ? training.userId : training.userId?._id;
    const trainerId = typeof training.trainerId === 'string' ? training.trainerId : training.trainerId?._id;
    const isOwner = userId === user?._id || trainerId === user?._id || user?.role === 'admin';

    if (!isOwner) {
      toast.error("You do not have permission to delete this training plan");
      return;
    }

    setSelectedTraining(training);
    setDeleteModalOpened(true);
  };

  const handleSaveEdit = async (data: Partial<TrainingPlan>) => {
    if (!selectedTraining) return;

    const result = await updateTraining(`/training-plans/${selectedTraining._id}`, {
      method: 'PUT',
      data,
    });

    if (result) {
      await refetchTrainings();
      setEditModalOpened(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTraining) return;

    const result = await deleteTraining(`/training-plans/${selectedTraining._id}`, {
      method: 'DELETE',
    });

    if (result) {
      await refetchTrainings();
      setDeleteModalOpened(false);
    }
  };

  const handleExportPDF = (training: TrainingPlan) => {
    exportToPDF([training]);
  };

  const handleExportExcel = (training: TrainingPlan) => {
    exportToExcel([training]);
  };

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <TrainingsBreadcrumbs />
        <TrainingsHeader />

        <TrainingsFilters
          filters={filters}
          onFiltersChange={setFilters}
          search={searchQuery}
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
                  isAdmin={user?.role === "admin"}
                  currentUserId={user?._id}
                  onView={handleView}
                  onEdit={handleEdit}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={handleDelete}
                />
              ) : (
                <TrainingsTable
                  trainings={paginatedTrainings}
                  isAdmin={user?.role === "admin"}
                  currentUserId={user?._id}
                  onView={handleView}
                  onEdit={handleEdit}
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onDelete={handleDelete}
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
