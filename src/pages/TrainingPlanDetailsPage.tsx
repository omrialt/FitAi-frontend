/**
 * TrainingPlanDetailsPage - Complete training plan details with days, exercises, and sharing
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Center, Loader, Alert } from "@mantine/core";
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
import { useExport } from "../hooks/useExport";
import userService from "../services/user.service";
import type { TrainingPlan } from "../types/training-plan.types";
import type { User } from "../types/auth.types";
import { DaysSection, VideoModal } from "../components/trainings/details";
import { EditTrainingModal } from "../components/trainings/EditTrainingModal";

export default function TrainingPlanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  // State
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [videoModalOpened, setVideoModalOpened] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [trainerName, setTrainerName] = useState<string>("");

  // API hooks
  const { loading: loadingPlan, execute: fetchPlan } = useApi<{
    data: TrainingPlan;
  }>({
    showErrorToast: true,
  });
  const { execute: updatePlan } = useApi<{ data: TrainingPlan }>({
    showSuccessToast: true,
    successMessage: t("trainings.planUpdated"),
  });

  // Export hook
  const { exportToPDF, exportToExcel } = useExport({
    filename: `training-plan-${id}`,
    onSuccess: () => toast.success(t("common.exportSuccess")),
    onError: (error) => toast.error(t("common.exportFailed", { error: error.message })),
  });

  // Check if current user is owner or trainer
  const isOwner =
    plan && currentUser
      ? (typeof plan.userId === "string" ? plan.userId : plan.userId._id) ===
        currentUser._id
      : false;

  const isTrainer =
    plan && currentUser && plan.trainerId
      ? (typeof plan.trainerId === "string"
          ? plan.trainerId
          : plan.trainerId._id) === currentUser._id
      : false;

  const canEdit = isOwner || isTrainer;
  const canViewShared = isTrainer;

  // Fetch plan details
  const loadPlan = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchPlan(`/training-plans/${id}`);
      if (data?.data) {
        setPlan(data.data);

        // Fetch trainer name if trainerId exists and is a string
        if (data.data.trainerId) {
          if (typeof data.data.trainerId === "string") {
            try {
              const trainer = await userService.findOne(data.data.trainerId);
              setTrainerName(trainer.fullName);
            } catch {
              setTrainerName(t("common.unknown"));
            }
          } else {
            setTrainerName(data.data.trainerId.fullName);
          }
        }
      }
    } catch {
      toast.error(t("trainings.loadFailed"));
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
  const handleEditPlan = async (data: Partial<TrainingPlan>) => {
    if (!id) return;

    try {
      const updated = await updatePlan(`/training-plans/${id}`, {
        method: "PUT",
        data,
      });
      if (updated?.data) {
        setPlan(updated.data);
      }
    } catch {
      toast.error(t("trainings.updateFailed"));
    }
  };

  // Handle video click
  const handleVideoClick = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setVideoModalOpened(true);
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
          <Alert icon={<IconAlertCircle size={16} />} title={t("common.error")} color="red">
            {t("trainings.loadError")}
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
            { label: t("nav.home"), href: "/" },
            { label: t("nav.trainingPlans"), href: "/my-trainings" },
            { label: plan.title },
          ]}
        />

        <div className="hidden md:block mb-6">
          <button
            type="button"
            onClick={() => navigate("/my-trainings")}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <StitchIcon name="chevron_left" size={16} />
            {t("trainings.backToPlans")}
          </button>
        </div>

        {/* Plan Header */}
        <PlanHeader
          planType="training"
          plan={plan}
          isOwner={canEdit}
          onEdit={() => setEditModalOpened(true)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          creatorName={trainerName}
        />

        {/* Days Section */}
        <DaysSection 
          days={plan.days} 
          onVideoClick={handleVideoClick}
        />

        {/* Active Users Section - visible to trainers/admins */}
        {(currentUser?.role === 'trainer' || currentUser?.role === 'admin') && plan.activeByUsers && plan.activeByUsers.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-success-container text-on-success-container flex items-center justify-center">
                  <StitchIcon name="check_circle" size={18} />
                </span>
                <h2 className="text-lg font-extrabold tracking-tight text-on-surface">
                  {t("common.activeUsers")}
                </h2>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-success-container text-on-success-container">
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
                      <span className="w-10 h-10 rounded-full bg-success-container text-on-success-container flex items-center justify-center shrink-0">
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
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-success-container text-on-success-container shrink-0">
                        {t("trainings.active")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* Shared With Section (Trainer Only) */}
        {canViewShared && (
          <SharedWithSection
            sharedAccess={plan.sharedAccess}
            allUsers={allUsers}
            title={t("common.sharedWith")}
            emptyMessage={t("common.notShared")}
            showActions={false}
          />
        )}

        {/* Edit Modal */}
        <EditTrainingModal
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          training={plan!}
          onSave={handleEditPlan}
          createMode={false}
          allUsers={allUsers}
        />

        {/* Video Modal */}
        <VideoModal
          opened={videoModalOpened}
          onClose={() => setVideoModalOpened(false)}
          videoUrl={currentVideoUrl}
        />
      </Container>
    </AppLayout>
  );
}
