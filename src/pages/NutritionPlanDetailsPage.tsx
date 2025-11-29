/**
 * NutritionPlanDetailsPage - Complete nutrition plan details with ratings and sharing
 */

import { useState, useEffect, useCallback, Activity } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, Center, Loader, Alert, Button } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { AppBreadcrumbs } from "../components/common/AppBreadcrumbs";
import { SharedWithSection } from "../components/common/SharedWithSection";
import { PlanHeader } from "../components/common/PlanHeader";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useNutritionExport } from "../hooks/useNutritionExport";
import userService from "../services/user.service";
import type { NutritionPlan } from "../types/nutrition.types";
import type { User } from "../types/auth.types";
import {
  MealSection,
  RatingsSection,
  AddRating,
} from "../components/nutrition/details";
import { EditNutritionModal } from "../components/nutrition/EditNutritionModal";

export default function NutritionPlanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // State
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [creatorName, setCreatorName] = useState<string>("");

  // API hooks
  const { loading: loadingPlan, execute: fetchPlan } = useApi<{
    data: NutritionPlan;
  }>({
    showErrorToast: true,
  });
  const { execute: updatePlan } = useApi<{ data: NutritionPlan }>({
    showSuccessToast: true,
    successMessage: "Plan updated successfully",
  });
  const { loading: loadingRating, execute: addRatingRequest } = useApi<{
    data: NutritionPlan;
  }>({
    showErrorToast: true,
  });
  const { loading: loadingShare, execute: sharePlanRequest } = useApi<{
    data: NutritionPlan;
  }>({
    showSuccessToast: true,
    successMessage: "Plan shared successfully",
  });
  const { loading: loadingRevoke, execute: revokePlanRequest } = useApi<{
    message: string;
  }>({
    showSuccessToast: true,
    successMessage: "Access revoked successfully",
  });

  // Export hook
  const { exportToPDF, exportToExcel } = useNutritionExport({
    filename: `nutrition-plan-${id}`,
    onSuccess: () => toast.success("Export completed successfully"),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
  });

  // Check if current user is owner
  const isOwner =
    plan && currentUser
      ? (typeof plan.userId === "string" ? plan.userId : plan.userId._id) ===
        currentUser._id
      : false;

  // Fetch plan details
  const loadPlan = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchPlan(`/nutrition-plans/${id}`);
      if (data?.data) {
        setPlan(data.data);

        // Fetch creator name if userId is a string
        if (typeof data.data.userId === "string") {
          try {
            const creator = await userService.findOne(data.data.userId);
            setCreatorName(creator.fullName);
          } catch {
            setCreatorName("Unknown");
          }
        } else {
          setCreatorName(data.data.userId.fullName);
        }
      }
    } catch {
      toast.error("Failed to load nutrition plan");
    }
  }, [id, fetchPlan]);

  // Fetch all users for sharing
  useEffect(() => {
    userService
      .findAll()
      .then(setAllUsers)
      .catch(() => setAllUsers([]));
  }, []);

  // Load plan on mount
  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // Handle edit plan
  const handleEditPlan = async (data: Partial<NutritionPlan>) => {
    if (!id) return;

    try {
      const updated = await updatePlan(`/nutrition-plans/${id}`, {
        method: "PUT",
        data,
      });
      if (updated?.data) {
        setPlan(updated.data);
      }
    } catch {
      toast.error("Failed to update plan");
    }
  };

  // Handle add rating
  const handleAddRating = async (rating: number, comment: string) => {
    if (!id) return;

    try {
      const updated = await addRatingRequest(`/nutrition-plans/${id}/ratings`, {
        method: "POST",
        data: { rating, comment },
      });
      console.log("Add rating response:", updated);
      if (updated?.data) {
        setPlan(updated.data);
        toast.success("Rating added successfully!");
      }
    } catch {
      toast.error("Failed to add rating");
    }
  };

  // Handle share plan
  const handleSharePlan = async (userId: string, accessLevel: string) => {
    if (!id) return;

    try {
      const updated = await sharePlanRequest("/share/nutrition-plan", {
        method: "POST",
        data: {
          planId: id,
          userId,
          accessLevel,
        },
      });
      if (updated?.data) {
        setPlan(updated.data);
      }
    } catch {
      toast.error("Failed to share plan");
    }
  };

  // Handle revoke access
  const handleRevokeAccess = async (userId: string) => {
    if (!id) return;

    try {
      await revokePlanRequest(`/nutrition-plans/${id}/share/${userId}`, {
        method: "DELETE",
      });
      // Reload plan to get updated sharedAccess
      await loadPlan();
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    if (plan) {
      exportToPDF([plan]);
    }
  };

  const handleExportExcel = () => {
    if (plan) {
      exportToExcel([plan]);
    }
  };

  // Loading state
  if (loadingPlan || !plan) {
    return (
      <AppLayout>
        <Container size="xl" py="xl">
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  // Error state
  if (!plan && !loadingPlan) {
    return (
      <AppLayout>
        <Container size="xl" py="xl">
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            Failed to load nutrition plan. Please try again.
          </Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        {/* Breadcrumbs */}
        <AppBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Nutrition Plans", href: "/nutrition-plans" },
            { label: plan.title },
          ]}
        />

        <Box mb="lg">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/nutrition-plans")}
          >
            Back to Nutrition Plans
          </Button>
        </Box>

        {/* Plan Header */}
        <PlanHeader
          planType="nutrition"
          plan={plan}
          isOwner={isOwner}
          onEdit={() => setEditModalOpened(true)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          creatorName={creatorName}
        />

        {/* Meals Section */}
        <MealSection meals={plan.meals} />

        {/* Ratings Section */}
        <RatingsSection ratings={plan.ratings} />
        <Activity mode={isOwner ? "visible" : "hidden"}>
          {/* Add Rating Form - Only show for non-owners */}

          <AddRating onSubmit={handleAddRating} loading={loadingRating} />

          {/* Share Section (Owner Only) */}

          <SharedWithSection
            sharedAccess={plan.sharedAccess}
            allUsers={allUsers}
            title="Shared With"
            emptyMessage="This plan is not shared with anyone yet"
            showActions={true}
            onShare={handleSharePlan}
            onRevoke={handleRevokeAccess}
            loading={loadingShare || loadingRevoke}
          />
        </Activity>
        {/* Edit Modal */}
        {plan && (
          <EditNutritionModal
            opened={editModalOpened}
            onClose={() => setEditModalOpened(false)}
            nutritionPlan={plan}
            onSave={handleEditPlan}
            createMode={false}
            allUsers={allUsers}
          />
        )}
      </Container>
    </AppLayout>
  );
}
