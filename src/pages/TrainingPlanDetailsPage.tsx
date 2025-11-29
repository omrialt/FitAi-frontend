/**
 * TrainingPlanDetailsPage - Complete training plan details with days, exercises, and sharing
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
    successMessage: "Plan updated successfully",
  });

  // Export hook
  const { exportToPDF, exportToExcel } = useExport({
    filename: `training-plan-${id}`,
    onSuccess: () => toast.success("Export completed successfully"),
    onError: (error) => toast.error(`Export failed: ${error.message}`),
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
              setTrainerName("Unknown");
            }
          } else {
            setTrainerName(data.data.trainerId.fullName);
          }
        }
      }
    } catch {
      toast.error("Failed to load training plan");
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
      toast.error("Failed to update plan");
    }
  };

  // Handle video click
  const handleVideoClick = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setVideoModalOpened(true);
  };

  // Handle exercise update (for history changes)
  const handleExerciseUpdate = async (dayIndex: number, exerciseIndex: number, updatedExercise: any) => {
    if (!plan || !id) return;

    // Create updated days array
    const updatedDays = [...plan.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: [
        ...updatedDays[dayIndex].exercises.slice(0, exerciseIndex),
        updatedExercise,
        ...updatedDays[dayIndex].exercises.slice(exerciseIndex + 1),
      ],
    };

    try {
      const updated = await updatePlan(`/training-plans/${id}`, {
        method: 'PUT',
        data: { days: updatedDays },
      });
      if (updated?.data) {
        setPlan(updated.data);
        toast.success('Exercise history updated successfully');
      }
    } catch {
      toast.error('Failed to update exercise history');
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
            Failed to load training plan. Please try again.
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
            { label: "Training Plans", href: "/my-trainings" },
            { label: plan.title },
          ]}
        />

        <Box mb="lg" display={{ base: "none", md: "block" }}>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/my-trainings")}
          >
            Back to Training Plans
          </Button>
        </Box>

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
          onExerciseUpdate={canEdit ? handleExerciseUpdate : undefined}
        />

        {/* Shared With Section (Trainer Only) */}
        <Activity mode={canViewShared ? "visible" : "hidden"}>
          <SharedWithSection
            sharedAccess={plan.sharedAccess}
            allUsers={allUsers}
            title="Shared With"
            emptyMessage="This plan is not shared with anyone yet"
            showActions={false}
          />
        </Activity>

        {/* Edit Modal */}
        <Activity mode={plan ? "visible" : "hidden"}>
          <EditTrainingModal
            opened={editModalOpened}
            onClose={() => setEditModalOpened(false)}
            training={plan!}
            onSave={handleEditPlan}
            createMode={false}
            allUsers={allUsers}
          />
        </Activity>

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
