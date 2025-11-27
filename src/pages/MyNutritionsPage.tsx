/**
 * MyNutritionsPage - Main nutrition plans page with filters, table/cards, and pagination
 */

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Container, Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
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
import type { NutritionPlan, NutritionFilters } from "../types/nutrition.types";
import userService from "../services/user.service";
import type { User } from "../types/user.types";

// API response wrapper type for array endpoints
interface NutritionPlansArrayResponse {
  data: NutritionPlan[];
  timestamp: string;
  path: string;
}

export default function MyNutritionsPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Fetch all users once on page load
  useEffect(() => {
    userService.findAll().then(setAllUsers).catch(() => setAllUsers([]));
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
    successMessage: "Nutrition plan updated successfully",
  });
  const { execute: deleteNutritionPlan } = useApi<{ message: string }>({
    showSuccessToast: true,
    successMessage: "Nutrition plan deleted successfully",
  });

  const allNutritionPlans = useMemo(() => {
    return nutritionData?.data || [];
  }, [nutritionData]);

  // Modals state
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<NutritionPlan | null>(
    null
  );

  // Refetch nutrition plans function
  const refetchNutritionPlans = useCallback(async () => {
    if (!user?._id) return;
    await fetchNutritionPlans(`/nutrition-plans/user/${user._id}/with-shared`);
  }, [fetchNutritionPlans, user?._id]);

  // Export hook
  const { exportToPDF, exportToExcel } = useNutritionExport({
    filename: "my-nutrition-plans",
    onSuccess: () => toast.success("Export completed successfully"),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
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
        toast.success("Nutrition plan created successfully");
      } catch {
        toast.error("Failed to create nutrition plan");
      }
    },
    [refetchNutritionPlans]
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
      filtered = filtered.filter((plan) => plan.averageRating >= (filters.minRating || 0));
    }
    if (filters.minCalories !== undefined) {
      filtered = filtered.filter((plan) => plan.totalCalories >= (filters.minCalories || 0));
    }
    if (filters.maxCalories !== undefined) {
      filtered = filtered.filter((plan) => plan.totalCalories <= (filters.maxCalories || Infinity));
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((plan) => {
        const titleMatch = plan.title.toLowerCase().includes(query);
        const descriptionMatch = plan.description?.toLowerCase().includes(query);

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
      const userId = typeof plan.userId === "string" ? plan.userId : plan.userId?._id;
      const isOwner = userId === user?._id || user?.role === "admin";

      if (!isOwner) {
        toast.error("You do not have permission to edit this nutrition plan");
        return;
      }

      setSelectedNutritionPlan(plan);
      setEditModalOpened(true);
    },
    [nutritionPlans, user?._id, user?.role]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const plan = nutritionPlans.find((p) => p._id === id);
      if (!plan) return;

      // Only owner can delete
      const userId = typeof plan.userId === "string" ? plan.userId : plan.userId?._id;
      const isOwner = userId === user?._id || user?.role === "admin";

      if (!isOwner) {
        toast.error("You do not have permission to delete this nutrition plan");
        return;
      }

      setSelectedNutritionPlan(plan);
      setDeleteModalOpened(true);
    },
    [nutritionPlans, user?._id, user?.role]
  );

  const handleSaveEdit = useCallback(
    async (data: Partial<NutritionPlan>) => {
      if (!selectedNutritionPlan) return;

      try {
        await updateNutritionPlan(`/nutrition-plans/${selectedNutritionPlan._id}`, {
          method: "PUT",
          data,
        });
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
      await deleteNutritionPlan(`/nutrition-plans/${selectedNutritionPlan._id}`, {
        method: "DELETE",
      });
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
