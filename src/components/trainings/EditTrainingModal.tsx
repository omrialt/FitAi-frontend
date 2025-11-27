/**
 * EditTrainingModal - Modal for editing training plan
 */

"use client";

import { Modal, Button, Stack, Group, Text, Checkbox } from "@mantine/core";
import { useState, useEffect, Activity } from "react";
import type {
  TrainingPlan,
  TrainingDay,
  Difficulty,
  Target,
  ProgramType,
  AccessLevel,
} from "../../types/training-plan.types";
import type { User } from "../../types/auth.types";
import { useAuth } from "../../hooks/useAuth";
import {
  BasicInfoSection,
  ProgramDetailsSection,
  SharedAccessSection,
  TrainingDaysSection,
} from "./edit-modal/index";

interface EditTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: TrainingPlan | null;
  onSave: (data: Partial<TrainingPlan>) => void;
  onCreate?: (data: Partial<TrainingPlan>) => void;
  createMode?: boolean;
  allUsers: User[];
}

export function EditTrainingModal({
  opened,
  onClose,
  training,
  onSave,
  onCreate,
  createMode = false,
  allUsers,
}: EditTrainingModalProps) {
  const titleText = createMode ? "Create Training Plan" : "Edit Training Plan";
  const submitButtonText = createMode ? "Create" : "Save Changes";
  const { user: currentUser } = useAuth();
  const [localDays, setLocalDays] = useState<TrainingDay[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [target, setTarget] = useState<Target | undefined>();
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
  const [endDate, setEndDate] = useState<string | undefined | null>();
  const [rotationCycleLength, setRotationCycleLength] = useState<
    number | undefined | null
  >();
  const [sharedAccess, setSharedAccess] = useState<
    Array<{ accessLevel: string; userId: string }>
  >([]);
  const [syncWithParent, setSyncWithParent] = useState(false);
  const canShowSharedAccess =
    createMode ||
    currentUser?.role === "admin" ||
    (typeof training?.trainerId === "object" &&
      training?.trainerId?._id === currentUser?._id);
  const canShowSyncCheckbox =
    !createMode &&
    !training?.initialParentId &&
    (typeof training?.userId === "string"
      ? training?.userId
      : training?.userId?._id) === currentUser?._id;


  // Reset form when training changes or when switching to create mode
  useEffect(() => {
    if (opened) {
      if (training) {
        setTitle(training.title || "");
        setDescription(training.description || "");
        setDifficulty(training.difficulty || "beginner");
        setTarget(training.target);
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
      } else {
        // Reset to defaults for create mode
        setTitle("");
        setDescription("");
        setDifficulty("beginner");
        setTarget(undefined);
        setProgramType("fixedDays");
        setFocus("");
        setEstimatedDuration(undefined);
        setEstimatedCalories(undefined);
        setIsActive(true);
        setStartDate(undefined);
        setEndDate(undefined);
        setRotationCycleLength(undefined);
        setLocalDays([]);
        setSharedAccess([]);
        setSyncWithParent(false);
      }
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
        target,
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
      if (createMode && onCreate) {
        onCreate(cleanedData);
      } else {
        onSave(cleanedData);
      }
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
          {titleText}
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
            target={target}
            setTarget={setTarget}
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
          <Activity mode={canShowSharedAccess ? "visible" : "hidden"}>
            <SharedAccessSection
              allUsers={allUsers}
              sharedAccess={sharedAccess}
              handleViewAccessChange={handleViewAccessChange}
              handleEditAccessChange={handleViewAccessChange}
            />
          </Activity>
          {/* Sync checkbox - only show for owners and if not a clone */}
          <Activity mode={canShowSyncCheckbox ? "visible" : "hidden"}>
            <Checkbox
              label="Sync updates to shared copies"
              description="When enabled, changes to this plan will automatically update all shared copies (except their workout history)"
              checked={syncWithParent}
              onChange={(e) => setSyncWithParent(e.currentTarget.checked)}
            />
          </Activity>
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
              {submitButtonText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
