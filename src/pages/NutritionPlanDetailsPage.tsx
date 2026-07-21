/**
 * NutritionPlanDetailsPage - Complete nutrition plan details with ratings and sharing
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Center, Loader, Alert } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import { StitchIcon } from "../components/common/StitchIcon";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    successMessage: t('nutrition.planUpdated'),
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
    successMessage: t('nutrition.planShared'),
  });
  const { loading: loadingRevoke, execute: revokePlanRequest } = useApi<{
    message: string;
  }>({
    showSuccessToast: true,
    successMessage: t('nutrition.accessRevoked'),
  });

  // Export hook
  const { exportToPDF, exportToExcel } = useNutritionExport({
    filename: `nutrition-plan-${id}`,
    onSuccess: () => toast.success(t('common.exportSuccess')),
    onError: (error) => toast.error(t('common.exportFailed', { error: error.message })),
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
            setCreatorName(t('common.unknown'));
          }
        } else {
          setCreatorName(data.data.userId.fullName);
        }
      }
    } catch {
      toast.error(t('nutrition.loadFailed'));
    }
  }, [id, fetchPlan, t]);

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
      toast.error(t('nutrition.updateFailed'));
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
      if (updated?.data) {
        setPlan(updated.data);
        toast.success(t('nutrition.ratingAdded'));
      }
    } catch {
      toast.error(t('nutrition.ratingFailed'));
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
      toast.error(t('nutrition.shareFailed'));
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
      toast.error(t('nutrition.revokeFailed'));
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
          <Alert icon={<IconAlertCircle size={16} />} title={t('common.error')} color="red">
            {t('nutrition.loadError')}
          </Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="xl" py={isMobile ? "md" : "xl"} px={isMobile ? "xs" : undefined}>
        {/* Breadcrumbs + back button - desktop only for a compact mobile view */}
        {!isMobile && (
          <>
            <AppBreadcrumbs
              items={[
                { label: t('nav.home'), href: "/" },
                { label: t('nav.nutritionPlans'), href: "/nutrition-plans" },
                { label: plan.title },
              ]}
            />

            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate("/nutrition-plans")}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <StitchIcon name="chevron_left" size={16} />
                {t('nutrition.backToNutritionPlans')}
              </button>
            </div>
          </>
        )}

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

        {/* Total Daily Fuel */}
        {(() => {
          const totalKcal = plan.meals.reduce((s, m) => s + m.foods.reduce((ss, f) => ss + f.calories, 0), 0);
          const totalP    = plan.meals.reduce((s, m) => s + m.foods.reduce((ss, f) => ss + f.protein, 0), 0);
          const totalC    = plan.meals.reduce((s, m) => s + m.foods.reduce((ss, f) => ss + f.carbs, 0), 0);
          const totalF    = plan.meals.reduce((s, m) => s + m.foods.reduce((ss, f) => ss + f.fat, 0), 0);
          return (
            <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 mb-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
                {t('nutrition.totalDailyFuel')}
              </p>
              <p className="text-6xl font-black leading-none text-primary">
                {totalKcal.toFixed(0)}
                <span className="text-lg font-normal text-on-surface-variant ms-2">
                  {t('nutrition.kcal')}
                </span>
              </p>

              <div className="flex items-center justify-center gap-10 mt-6 flex-wrap">
                {[
                  { label: t('nutrition.protein'), value: totalP, color: 'text-primary' },
                  { label: t('nutrition.carbs'), value: totalC, color: 'text-on-secondary-container' },
                  { label: t('nutrition.fats'), value: totalF, color: 'text-orange-500' },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {m.label}
                    </p>
                    <p className={`text-xl font-black ${m.color}`}>
                      {m.value.toFixed(0)}g
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Meals Section */}
        <MealSection meals={plan.meals} />

        {/* Active Users Section - visible to trainers/admins */}
        {(currentUser?.role === 'trainer' || currentUser?.role === 'admin') && (
          plan.activeByUsers && plan.activeByUsers.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <StitchIcon name="check_circle" size={18} />
                </span>
                <h2 className="text-lg font-extrabold tracking-tight text-on-surface">
                  {t('common.activeUsers')}
                </h2>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {plan.activeByUsers.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {plan.activeByUsers.map((user, index) => {
                  const userName = typeof user === 'string'
                    ? allUsers.find(u => u._id === user)?.fullName || t('common.unknownUser')
                    : user.fullName || t('common.unknownUser');
                  const userEmail = typeof user === 'string'
                    ? allUsers.find(u => u._id === user)?.email || ''
                    : user.email || '';

                  return (
                    <div
                      key={index}
                      className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 flex items-center gap-4"
                    >
                      <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <StitchIcon name="person" size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface truncate">{userName}</p>
                        {userEmail && (
                          <p className="text-sm text-on-surface-variant truncate">
                            {userEmail}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
                        {t('common.active')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )}

        {/* Ratings Section */}
        <RatingsSection ratings={plan.ratings} />

        {/* Add Rating — any signed-in non-owner can review the plan */}
        {currentUser && !isOwner && (
          <AddRating onSubmit={handleAddRating} loading={loadingRating} />
        )}

        {/* Share — owner only */}
        {isOwner && (
          <SharedWithSection
            sharedAccess={plan.sharedAccess}
            allUsers={allUsers}
            title={t('common.sharedWith')}
            emptyMessage={t('common.notShared')}
            showActions={true}
            onShare={handleSharePlan}
            onRevoke={handleRevokeAccess}
            loading={loadingShare || loadingRevoke}
          />
        )}
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
