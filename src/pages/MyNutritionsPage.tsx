/**
 * MyNutritionsPage - Main nutrition plans page with filters, table/cards, and pagination
 */

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Container, Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { StitchIcon } from "../components/common/StitchIcon";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../hooks/useDebounce";
import { useApi } from "../hooks/useApi";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { nutritionPlanService } from "../services/nutrition-plan.service";
import { useNutritionExport } from "../hooks/useNutritionExport";
import {
  DeleteNutritionModal,
  EditNutritionModal,
  NutritionsCardList,
  NutritionsTable,
  NutritionsFilters,
  NutritionsHeader,
  NutritionsBreadcrumbs,
} from "../components/nutrition/index";
import { PaginationControls } from "../components/common/PaginationControls";
import { useAuthStore } from "../store/authStore";
import type { NutritionPlan, NutritionFilters, NutritionPlansArrayResponse } from "../types/nutrition.types";
import userService from "../services/user.service";
import type { User } from "../types/user.types";

export default function MyNutritionsPage() {
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Fetch all users once on page load
  useEffect(() => {
    userService
      .findAll()
      .then(setAllUsers)
      .catch(() => setAllUsers([]));
  }, []);

  const { user } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState<NutritionFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API hooks
  const {
    data: nutritionData,
    loading: isLoading,
    execute: fetchNutritionPlans,
  } = useApi<NutritionPlansArrayResponse>({
    showErrorToast: true,
  });
  const { execute: updateNutritionPlan } = useApi<NutritionPlan>({
    showSuccessToast: true,
    successMessage: t('nutrition.updatedSuccess'),
  });
  const { execute: deleteNutritionPlan } = useApi<{ message: string }>({
    showSuccessToast: true,
    successMessage: t('nutrition.deletedSuccess'),
  });

  const allNutritionPlans = useMemo(() => {
    return nutritionData?.data || [];
  }, [nutritionData]);

  // Modals state
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedNutritionPlan, setSelectedNutritionPlan] =
    useState<NutritionPlan | null>(null);

  // Refetch nutrition plans function
  const refetchNutritionPlans = useCallback(async () => {
    if (!user?._id) return;
    await fetchNutritionPlans(`/nutrition-plans/user/${user._id}/with-shared`);
  }, [fetchNutritionPlans, user?._id]);

  // Export hook
  const { exportToPDF, exportToExcel } = useNutritionExport({
    filename: "my-nutrition-plans",
    onSuccess: () => toast.success(t('common.exportSuccess')),
    onError: (error) => toast.error(t('common.exportFailed', { error: error.message })),
  });

  // Handler for creating a new plan
  const handleCreateNew = useCallback(() => {
    setEditModalOpened(true);
  }, []);

  // Save handler for create modal
  const handleSaveCreate = useCallback(
    async (data: Partial<NutritionPlan>) => {
      try {
        await nutritionPlanService.create(data);
        await refetchNutritionPlans();
        setEditModalOpened(false);
        toast.success(t('nutrition.createdSuccess'));
      } catch {
        toast.error(t('nutrition.createFailed'));
      }
    },
    [refetchNutritionPlans, t]
  );

  // Fetch nutrition plans from API
  useEffect(() => {
    if (!user?._id) return;
    fetchNutritionPlans(`/nutrition-plans/user/${user._id}/with-shared`);
  }, [user?._id, fetchNutritionPlans]);

  // Filter and search nutrition plans
  const nutritionPlans = useMemo(() => {
    let filtered = [...allNutritionPlans];

    // Apply filters
    if (filters.target) {
      filtered = filtered.filter((plan) => plan.target === filters.target);
    }
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(
        (plan) => plan.averageRating >= (filters.minRating || 0)
      );
    }
    if (filters.minCalories !== undefined) {
      filtered = filtered.filter(
        (plan) => plan.totalCalories >= (filters.minCalories || 0)
      );
    }
    if (filters.maxCalories !== undefined) {
      filtered = filtered.filter(
        (plan) => plan.totalCalories <= (filters.maxCalories || Infinity)
      );
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((plan) => {
        const titleMatch = plan.title.toLowerCase().includes(query);
        const descriptionMatch = plan.description
          ?.toLowerCase()
          .includes(query);

        // Search in creator name
        let creatorMatch = false;
        if (typeof plan.userId === "object" && plan.userId?.fullName) {
          creatorMatch = plan.userId.fullName.toLowerCase().includes(query);
        }

        return titleMatch || descriptionMatch || creatorMatch;
      });
    }

    return filtered;
  }, [allNutritionPlans, filters, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(nutritionPlans.length / pageSize);
  const paginatedNutritionPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const result = nutritionPlans.slice(start, start + pageSize);
    return result;
  }, [nutritionPlans, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearch]);

  // Action handlers
  const handleView = useCallback(
    (id: string) => {
      navigate(`/nutrition-plans/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const plan = nutritionPlans.find((p) => p._id === id);
      if (!plan) return;

      // Check if user has edit permission (only owner can edit)
      const userId =
        typeof plan.userId === "string" ? plan.userId : plan.userId?._id;
      const isOwner = userId === user?._id || user?.role === "admin";

      if (!isOwner) {
        toast.error(t('nutrition.noEditPermission'));
        return;
      }

      setSelectedNutritionPlan(plan);
      setEditModalOpened(true);
    },
    [nutritionPlans, user?._id, user?.role, t]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const plan = nutritionPlans.find((p) => p._id === id);
      if (!plan) return;

      // Only owner can delete
      const userId =
        typeof plan.userId === "string" ? plan.userId : plan.userId?._id;
      const isOwner = userId === user?._id || user?.role === "admin";

      if (!isOwner) {
        toast.error(t('nutrition.noDeletePermission'));
        return;
      }

      setSelectedNutritionPlan(plan);
      setDeleteModalOpened(true);
    },
    [nutritionPlans, user?._id, user?.role, t]
  );

  const handleSaveEdit = useCallback(
    async (data: Partial<NutritionPlan>) => {
      if (!selectedNutritionPlan) return;

      try {
        await updateNutritionPlan(
          `/nutrition-plans/${selectedNutritionPlan._id}`,
          {
            method: "PUT",
            data,
          }
        );
        await refetchNutritionPlans();
        setEditModalOpened(false);
      } catch (error) {
        console.error("Failed to update nutrition plan:", error);
      }
    },
    [selectedNutritionPlan, updateNutritionPlan, refetchNutritionPlans]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedNutritionPlan) return;

    try {
      await deleteNutritionPlan(
        `/nutrition-plans/${selectedNutritionPlan._id}`,
        {
          method: "DELETE",
        }
      );
      await refetchNutritionPlans();
      setDeleteModalOpened(false);
    } catch (error) {
      console.error("Failed to delete nutrition plan:", error);
    }
  }, [selectedNutritionPlan, deleteNutritionPlan, refetchNutritionPlans]);

  const handleOnClose = useCallback(() => {
    setEditModalOpened(false);
    setSelectedNutritionPlan(null);
  }, []);

  const handleExportPDF = useCallback(
    (plan: NutritionPlan) => {
      exportToPDF([plan]);
    },
    [exportToPDF]
  );

  const handleExportExcel = useCallback(
    (plan: NutritionPlan) => {
      exportToExcel([plan]);
    },
    [exportToExcel]
  );

  const handleActivate = useCallback(
    async (id: string) => {
      try {
        await nutritionPlanService.activate(id);
        await refetchNutritionPlans();
        toast.success(t('nutrition.activatedSuccess'));
      } catch (error) {
        toast.error(t('nutrition.activateFailed'));
        console.error("Failed to activate nutrition plan:", error);
      }
    },
    [refetchNutritionPlans, t]
  );

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <NutritionsBreadcrumbs />
        <NutritionsHeader onCreateNew={handleCreateNew} />
        <NutritionsFilters
          filters={filters}
          onFiltersChange={setFilters}
          search={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Box pos="relative">
          {/* Loading State */}
          {isLoading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              {/* Responsive View */}
              {isMobile ? (
                <NutritionsCardList
                  nutritionPlans={paginatedNutritionPlans}
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
                <NutritionsTable
                  nutritionPlans={paginatedNutritionPlans}
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
          total={nutritionPlans.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Stats Bento */}
        <NutritionStatsBento nutritionPlans={allNutritionPlans} />
      </Container>

      {/* Modals */}
      <EditNutritionModal
        opened={editModalOpened}
        onClose={handleOnClose}
        nutritionPlan={selectedNutritionPlan}
        onSave={handleSaveEdit}
        onCreate={handleSaveCreate}
        createMode={!selectedNutritionPlan}
        allUsers={allUsers}
      />

      <DeleteNutritionModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        nutritionPlan={selectedNutritionPlan}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}

// --- Stats Bento Component ---

function NutritionStatsBento({ nutritionPlans }: { nutritionPlans: NutritionPlan[] }) {
  const { t } = useTranslation();

  const avgKcal = useMemo(() => {
    if (!nutritionPlans.length) return 0;
    return Math.round(
      nutritionPlans.reduce((sum, p) => sum + (p.totalCalories || 0), 0) / nutritionPlans.length
    );
  }, [nutritionPlans]);

  const avgRating = useMemo(() => {
    const rated = nutritionPlans.filter((p) => p.averageRating > 0);
    if (!rated.length) return 0;
    return rated.reduce((sum, p) => sum + p.averageRating, 0) / rated.length;
  }, [nutritionPlans]);

  const totalPlans = nutritionPlans.length;
  const ratingPct = Math.round((avgRating / 5) * 100);
  // Decorative Mon–Fri initials, taken from the translated weekday names
  const weekDays = [1, 2, 3, 4, 5].map((d) => t(`common.weekday${d}`).charAt(0));

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
      {/* Weekly Average */}
      <div className="bg-primary-gradient rounded-xl p-8 text-white shadow-lg shadow-primary/25">
        <div className="flex items-center justify-between mb-4">
          <span className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <StitchIcon name="bolt" size={20} />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {t('nutrition.weeklyAverage')}
          </span>
        </div>

        <p className="text-4xl font-black leading-none mb-1">
          {avgKcal.toLocaleString()}
        </p>
        <p className="text-xs opacity-80">{t('nutrition.dailyKcalAcrossPlans')}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/15">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {t('nutrition.plansTotal', { count: totalPlans })}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] font-bold opacity-90">
              {t('common.active')}
            </span>
          </span>
        </div>
      </div>

      {/* Total Plans */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-4">
          <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <StitchIcon name="restaurant_menu" size={20} />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('nutrition.totalPlans')}
          </span>
        </div>

        <div className="flex items-end gap-2 mb-1">
          <p className="text-4xl font-black leading-none text-on-surface">
            {totalPlans}
          </p>
          <span className="text-sm font-bold text-on-surface-variant pb-1">
            {t('nutrition.plansLabel')}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          {t('nutrition.plansInCollection')}
        </p>

        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-primary h-full"
            style={{ width: `${Math.min((totalPlans / 20) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-4">
          <span className="w-10 h-10 rounded-lg bg-success-container text-on-success-container flex items-center justify-center">
            <StitchIcon name="check_circle" size={20} />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('nutrition.avgRating')}
          </span>
        </div>

        <p className="text-4xl font-black leading-none text-on-surface mb-1">
          {avgRating > 0 ? `${avgRating.toFixed(1)}★` : t('common.none')}
        </p>
        <p className="text-xs text-on-surface-variant">
          {t('nutrition.averagePlanRating')}
        </p>

        <div className="flex mt-4">
          {weekDays.map((day, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full text-[8px] font-bold text-white flex items-center justify-center border-2 border-surface-container-lowest ${
                i !== 3 && ratingPct > (i / weekDays.length) * 100
                  ? 'bg-success'
                  : 'bg-surface-container-highest'
              }`}
              style={{ marginInlineStart: i > 0 ? -6 : 0 }}
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
