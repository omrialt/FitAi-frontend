/**
 * EditTrainingModal - Modal for editing training plan
 */

"use client";

import { Modal, Button, Stack, Group, Text, Checkbox } from "@mantine/core";
import { useState, useEffect } from "react";
import type {
  TrainingPlan,
  TrainingDay,
  Difficulty,
  ProgramType,
  AccessLevel,
} from "../../types/training-plan.types";
import type { User } from "../../types/auth.types";
import userService from "../../services/user.service";
import { useAuth } from "../../hooks/useAuth";
import { BasicInfoSection } from "./edit-modal/BasicInfoSection";
import { ProgramDetailsSection } from "./edit-modal/ProgramDetailsSection";
import { SharedAccessSection } from "./edit-modal/SharedAccessSection";
import { TrainingDaysSection } from "./edit-modal/TrainingDaysSection";

interface EditTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: TrainingPlan | null;
  onSave: (data: Partial<TrainingPlan>) => void;
}

export function EditTrainingModal({
  opened,
  onClose,
  training,
  onSave,
}: EditTrainingModalProps) {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [localDays, setLocalDays] = useState<TrainingDay[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [programType, setProgramType] = useState<ProgramType>("fixedDays");
  const [focus, setFocus] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<
    number | undefined
  >();
  const [estimatedCalories, setEstimatedCalories] = useState<
    number | undefined
  >();
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [rotationCycleLength, setRotationCycleLength] = useState<
    number | undefined
  >();
  const [sharedAccess, setSharedAccess] = useState<
    Array<{ accessLevel: string; userId: string }>
  >([]);
  const [syncWithParent, setSyncWithParent] = useState(false);

  // Fetch all users for shared access selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.findAll();
        setAllUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (opened) {
      fetchUsers();
    }
  }, [opened]);

  // Reset form when training changes
  useEffect(() => {
    if (training && opened) {
      setTitle(training.title || "");
      setDescription(training.description || "");
      setDifficulty(training.difficulty || "beginner");
      setProgramType(training.programType || "fixedDays");
      setFocus(training.focus || "");
      setEstimatedDuration(training.estimatedDuration);
      setEstimatedCalories(training.estimatedCalories);
      setIsActive(training.isActive ?? true);
      setStartDate(training.startDate);
      setEndDate(training.endDate);
      setRotationCycleLength(training.rotationCycleLength);
      setLocalDays(training.days || []);
      setSharedAccess(training.sharedAccess || []);
      setSyncWithParent(training.syncWithParent || false);
    }
  }, [training, opened]);

  // Training Days handlers - use local state
  const addDay = () => {
    const newDays = [
      ...localDays,
      {
        dayName: `Day ${localDays.length + 1}`,
        dayOfWeek: localDays.length % 7,
        exercises: [],
      },
    ];
    setLocalDays(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = [...localDays];
    newDays.splice(index, 1);
    setLocalDays(newDays);
  };

  const updateDay = (index: number, updates: Partial<TrainingDay>) => {
    const newDays = [...localDays];
    newDays[index] = { ...newDays[index], ...updates };
    setLocalDays(newDays);
  };

  // Exercise handlers
  const addExercise = (dayIndex: number) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises.push({
      name: "",
      muscleGroup: "",
      type: "regular",
      sets: [],
    });
    setLocalDays(newDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setLocalDays(newDays);
  };

  const updateExerciseField = (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: unknown
  ) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises[exerciseIndex][field] = value;
    setLocalDays(newDays);
  };

  // Set handlers
  const addSet = (dayIndex: number, exerciseIndex: number) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises[exerciseIndex].sets.push({
      targetReps: 10,
      targetWeight: 0,
      history: [],
    });
    setLocalDays(newDays);
  };

  const removeSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
    setLocalDays(newDays);
  };

  const updateSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    updates: Record<string, unknown>
  ) => {
    const newDays = JSON.parse(JSON.stringify(localDays));
    newDays[dayIndex].exercises[exerciseIndex].sets[setIndex] = {
      ...newDays[dayIndex].exercises[exerciseIndex].sets[setIndex],
      ...updates,
    };
    setLocalDays(newDays);
  };

  // Shared access handlers
  const handleViewAccessChange = (userIds: string[]) => {
    const newSharedAccess = userIds.map((userId: string) => ({
      userId,
      accessLevel: "view" as AccessLevel,
      objectType: "trainingPlan" as const,
    }));
    setSharedAccess(newSharedAccess);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanedData: Partial<TrainingPlan> = {
        title,
        description,
        difficulty,
        programType,
        focus,
        estimatedDuration,
        estimatedCalories,
        isActive,
        startDate,
        endDate,
        rotationCycleLength,
        days: localDays,
        syncWithParent,
        sharedAccess: sharedAccess.map((sa) => ({
          userId: sa.userId,
          accessLevel: sa.accessLevel as AccessLevel,
          objectType: "trainingPlan" as const,
        })),
      };

      // Remove undefined fields
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key as keyof TrainingPlan] === undefined) {
          delete cleanedData[key as keyof TrainingPlan];
        }
      });

      onSave(cleanedData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Edit Training Plan
        </Text>
      }
      size="xl"
      styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <BasicInfoSection
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            programType={programType}
            setProgramType={setProgramType}
            focus={focus}
            setFocus={setFocus}
            rotationCycleLength={rotationCycleLength}
            setRotationCycleLength={setRotationCycleLength}
          />
          <ProgramDetailsSection
            estimatedDuration={estimatedDuration}
            setEstimatedDuration={setEstimatedDuration}
            estimatedCalories={estimatedCalories}
            setEstimatedCalories={setEstimatedCalories}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            isActive={isActive}
            setIsActive={setIsActive}
          />
          {(currentUser?.role === "admin" ||
            training?.trainerId === currentUser?._id) && (
            <SharedAccessSection
              allUsers={allUsers}
              sharedAccess={sharedAccess}
              handleViewAccessChange={handleViewAccessChange}
              handleEditAccessChange={handleViewAccessChange}
            />
          )}
          {/* Sync checkbox - only show for owners and if not a clone */}
          {!training?.initialParentId && training?.userId === currentUser?._id && (
            <Checkbox
              label="Sync updates to shared copies"
              description="When enabled, changes to this plan will automatically update all shared copies (except their workout history)"
              checked={syncWithParent}
              onChange={(e) => setSyncWithParent(e.currentTarget.checked)}
            />
          )}
          <TrainingDaysSection
            localDays={localDays}
            addDay={addDay}
            removeDay={removeDay}
            updateDay={updateDay}
            addExercise={addExercise}
            removeExercise={removeExercise}
            updateExerciseField={updateExerciseField}
            addSet={addSet}
            removeSet={removeSet}
            updateSet={updateSet}
          />
          {/* Action Buttons */}
          <Group justify="flex-end" gap="xs">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
