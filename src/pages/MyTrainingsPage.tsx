/**
 * MyTrainingsPage - Main trainings page with filters, table/cards, and pagination
 */

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Container, Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
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
  const { t } = useTranslation();
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
    successMessage: t("trainings.updatedSuccess"),
  });
  const { execute: deleteTraining } = useApi<{ message: string }>({
    showSuccessToast: true,
    successMessage: t("trainings.deletedSuccess"),
  });

  const allTrainings = useMemo(() => {
    return trainingsData?.data.items || [];
  }, [trainingsData]);

  // Per-weekday share of scheduled training days (0..1), for the volume mini chart
  const weekdayVolume = useMemo(() => {
    const counts = new Array<number>(7).fill(0);
    allTrainings.forEach((t) => {
      if (!t.isActive) return;
      t.days?.forEach((d) => {
        const dow = (d as { dayOfWeek?: number }).dayOfWeek;
        if (typeof dow === 'number' && dow >= 0 && dow <= 6) counts[dow] += 1;
      });
    });
    const max = Math.max(...counts, 1);
    return counts.map((c) => c / max);
  }, [allTrainings]);

  /**
   * Weekly training volume in hours, summed from each active plan's
   * `estimatedDuration` (minutes per session) across its scheduled days.
   * Plans without an estimate contribute nothing rather than being guessed at.
   */
  const totalVolumeHours = useMemo(() => {
    const minutes = allTrainings.reduce((sum, plan) => {
      if (!plan.isActive || !plan.estimatedDuration) return sum;
      return sum + plan.estimatedDuration * (plan.days?.length || 0);
    }, 0);
    return minutes / 60;
  }, [allTrainings]);

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
    onSuccess: () => toast.success(t("common.exportSuccess")),
    onError: (error) => toast.error(t("common.exportFailed", { error: error.message })),
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
        toast.success(t("trainings.createdSuccess"));
      } catch {
        toast.error(t("trainings.createFailed"));
      }
    },
    [refetchTrainings, t]
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
    if (filters.status === 'archived') {
      filtered = filtered.filter((t) => !t.isActive);
    } else {
      filtered = filtered.filter((t) => t.isActive);
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
        toast.error(t("trainings.noEditPermission"));
        return;
      }

      setSelectedTraining(training);
      setEditModalOpened(true);
    },
    [trainings, user?._id, user?.role, t]
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
        toast.error(t("trainings.noDeletePermission"));
        return;
      }

      setSelectedTraining(training);
      setDeleteModalOpened(true);
    },
    [trainings, user?._id, user?.role, t]
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
        toast.success(t("trainings.activatedSuccess"));
      } catch (error) {
        toast.error(t("trainings.activateFailed"));
        console.error("Failed to activate training plan:", error);
      }
    },
    [fetchTrainings, t]
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* AI Optimized Training Load */}
          <div className="bg-primary-gradient rounded-xl p-8 text-white">
            <h3 className="text-2xl font-black tracking-tight mb-3">
              {t('trainings.aiCardTitle')}
            </h3>
            <p className="text-sm leading-relaxed text-white/85 mb-6">
              <Trans i18nKey="trainings.aiCardText" components={{ strong: <strong /> }} />
            </p>
            <button
              type="button"
              disabled
              title={t('common.comingSoon')}
              className="bg-surface-container-lowest text-primary px-6 py-3 rounded-lg font-bold text-sm disabled:opacity-70"
            >
              {t('trainings.applySuggestion')}
            </button>
          </div>

          {/* Training Volume */}
          <div className="bg-surface-container-high rounded-xl p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                {t('trainings.trainingVolume')}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                {t('trainings.monSun')}
              </span>
            </div>

            <p className="text-5xl font-black text-on-surface leading-none">
              {totalVolumeHours.toFixed(1)}
              <span className="text-base font-normal text-on-surface-variant ms-1">
                {t('trainings.hrs')}
              </span>
            </p>

            <div className="flex items-end gap-1.5 h-12 mt-6">
              {weekdayVolume.map((count, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded ${count > 0 ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  style={{ height: `${8 + count * 36}px` }}
                />
              ))}
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-on-surface-variant">
                {t('trainings.mon')}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                {t('trainings.sun')}
              </span>
            </div>
          </div>
        </section>
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
