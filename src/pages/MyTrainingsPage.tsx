/**
 * MyTrainingsPage - Main trainings page with filters, table/cards, and pagination
 */

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Container, Box, Center, Loader, SimpleGrid, Paper, Text, Title, Button, Group, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { useApi } from "../hooks/useApi";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { trainingPlanService } from "../services/training-plan.service";
import {
  DeleteTrainingModal,
  EditTrainingModal,
  TrainingsCardList,
  TrainingsTable,
  TrainingsFilters,
  TrainingsHeader,
  TrainingsBreadcrumbs,
} from "../components/trainings/index";
import { PaginationControls } from "../components/common/PaginationControls";
import { useExport } from "../hooks/useExport";
import { useAuthStore } from "../store/authStore";
import type { TrainingPlan, TrainingFilters } from "../types/training.types";
import type { TrainingPlansResponse } from "../types/training-plan.types";
import userService from "../services/user.service";
import type { User } from "../types/user.types";

export default function MyTrainingsPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Fetch all users once on page load
    useEffect(() => {
      userService.findAll().then(setAllUsers).catch(() => setAllUsers([]));
    }, []);
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
  const {
    data: trainingsData,
    loading: isLoading,
    execute: fetchTrainings,
  } = useApi<TrainingPlansResponse>({
    showErrorToast: true,
  });
  const { execute: updateTraining } = useApi<TrainingPlan>({
    showSuccessToast: true,
    successMessage: "Training updated successfully",
  });
  const { execute: deleteTraining } = useApi<{ message: string }>({
    showSuccessToast: true,
    successMessage: "Training deleted successfully",
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

  // Refetch trainings function
  const refetchTrainings = useCallback(async () => {
    await fetchTrainings("/training-plans?page=1&limit=100");
  }, [fetchTrainings]);

  // Export hook
  const { exportToPDF, exportToExcel } = useExport({
    filename: "my-trainings",
    onSuccess: () => toast.success("Export completed successfully"),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
  });

  // Handler for creating a new plan
  const handleCreateNew = useCallback(() => {
    setEditModalOpened(true);
  }, []);

  // Save handler for create modal
  const handleSaveCreate = useCallback(
    async (data: Partial<TrainingPlan>) => {
      try {
        await trainingPlanService.create(data);
        await refetchTrainings();
        setEditModalOpened(false);
        toast.success("Training plan created successfully");
      } catch {
        toast.error("Failed to create training plan");
      }
    },
    [refetchTrainings]
  );

  // Fetch trainings from API
  useEffect(() => {
    fetchTrainings("/training-plans?page=1&limit=100");

  }, [user?._id, fetchTrainings]);

  // Filter and search trainings
  const trainings = useMemo(() => {
    let filtered = [...allTrainings];

    // Apply filters
    if (filters.creator) {
      filtered = filtered.filter((t) => {
        const userId = typeof t.userId === "string" ? t.userId : t.userId._id;
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
    if (filters.target) {
      filtered = filtered.filter((t) => t.target === filters.target);
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
  const handleView = useCallback(
    (id: string) => {
      navigate(`/training-plans/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const training = trainings.find((t) => t._id === id);
      if (!training) return;

      // Check if user has edit permission
      const userId =
        typeof training.userId === "string"
          ? training.userId
          : training.userId?._id;
      const trainerId =
        typeof training.trainerId === "string"
          ? training.trainerId
          : training.trainerId?._id;
      const isOwner =
        userId === user?._id ||
        trainerId === user?._id ||
        user?.role === "admin";

      if (!isOwner) {
        toast.error("You do not have permission to edit this training plan");
        return;
      }

      setSelectedTraining(training);
      setEditModalOpened(true);
    },
    [trainings, user?._id, user?.role]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const training = trainings.find((t) => t._id === id);
      if (!training) return;

      // Only owner can delete
      const userId =
        typeof training.userId === "string"
          ? training.userId
          : training.userId?._id;
      const trainerId =
        typeof training.trainerId === "string"
          ? training.trainerId
          : training.trainerId?._id;
      const isOwner =
        userId === user?._id ||
        trainerId === user?._id ||
        user?.role === "admin";

      if (!isOwner) {
        toast.error("You do not have permission to delete this training plan");
        return;
      }

      setSelectedTraining(training);
      setDeleteModalOpened(true);
    },
    [trainings, user?._id, user?.role]
  );

  const handleSaveEdit = useCallback(
    async (data: Partial<TrainingPlan>) => {
      if (!selectedTraining) return;

      try {
        await updateTraining(`/training-plans/${selectedTraining._id}`, {
          method: "PUT",
          data,
        });
        await refetchTrainings();
        setEditModalOpened(false);
      } catch (error) {
        console.error("Failed to update training:", error);
      }
    },
    [selectedTraining, updateTraining, refetchTrainings]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTraining) return;

    try {
      await deleteTraining(`/training-plans/${selectedTraining._id}`, {
        method: "DELETE",
      });
      await refetchTrainings();
      setDeleteModalOpened(false);
    } catch (error) {
      console.error("Failed to delete training:", error);
    }
  }, [selectedTraining, deleteTraining, refetchTrainings]);

  const handleOnClose = useCallback(() => {
    setEditModalOpened(false);
    setSelectedTraining(null);
  }, []);

  const handleExportPDF = useCallback(
    (training: TrainingPlan) => {
      exportToPDF([training]);
    },
    [exportToPDF]
  );

  const handleExportExcel = useCallback(
    (training: TrainingPlan) => {
      exportToExcel([training]);
    },
    [exportToExcel]
  );

  const handleActivate = useCallback(
    async (id: string) => {
      try {
        await trainingPlanService.activate(id);
        // Force a fresh fetch to ensure activeByUsers is properly updated
        await fetchTrainings("/training-plans?page=1&limit=100");
        toast.success("Training plan activated successfully");
      } catch (error) {
        toast.error("Failed to activate training plan");
        console.error("Failed to activate training plan:", error);
      }
    },
    [fetchTrainings]
  );

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <TrainingsBreadcrumbs />
        <TrainingsHeader onCreateNew={handleCreateNew} />
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
                  onActivate={handleActivate}
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
                  onActivate={handleActivate}
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

        {/* AI Insights + Volume */}
        <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl" spacing="md">
          {/* AI Optimized Training Load */}
          <Paper
            p="xl"
            radius="md"
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-violet-7) 100%)',
              color: '#fff',
            }}
          >
            <Stack gap="xs">
              <Title order={4} c="white">AI Optimized Training Load</Title>
              <Text size="sm" c="rgba(255,255,255,0.85)" style={{ lineHeight: 1.6 }}>
                Your current training plans average a <strong>84% recovery compliance rate</strong>. FitAi recommends adding a Restorative Flow day to your Peak Power block.
              </Text>
              <Button mt="sm" variant="white" color="indigo" size="sm" style={{ alignSelf: 'flex-start' }}>
                Apply Suggestion
              </Button>
            </Stack>
          </Paper>

          {/* Training Volume */}
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Training Volume</Text>
              <Text size="xs" c="dimmed">Mon{'\u2014'}Sun</Text>
            </Group>
            <Text size="2.5rem" fw={800} lh={1}>
              {(allTrainings.reduce((s, t) => s + (t.days?.length || 0), 0) * 1.2).toFixed(1)}
              <Text span size="md" fw={400} c="dimmed"> hrs</Text>
            </Text>
            <Text size="xs" c="dimmed" mt={4}>Weekly training volume across all active plans</Text>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* Modals */}
      <EditTrainingModal
        opened={editModalOpened}
        onClose={handleOnClose}
        training={selectedTraining}
        onSave={handleSaveEdit}
        onCreate={handleSaveCreate}
        createMode={!selectedTraining}
        allUsers={allUsers}
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
