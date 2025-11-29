/**
 * EditNutritionModal - Modal for creating/editing nutrition plan
 */

"use client";

import {
  Modal,
  Button,
  Stack,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Text,
} from "@mantine/core";
import { useState, useEffect, Activity } from "react";
import type {
  NutritionPlan,
  Meal,
  Food,
  MealType,
  Target,
} from "../../types/nutrition.types";
import type { User } from "../../types/auth.types";
import { useAuth } from "../../hooks/useAuth";
import { MealsSection } from "./edit-modal/MealsSection";
import { SharedAccessSection } from "../common/SharedAccessSection";

interface EditNutritionModalProps {
  opened: boolean;
  onClose: () => void;
  nutritionPlan: NutritionPlan | null;
  onSave: (data: Partial<NutritionPlan>) => void;
  onCreate?: (data: Partial<NutritionPlan>) => void;
  createMode?: boolean;
  allUsers: User[];
}

export function EditNutritionModal({
  opened,
  onClose,
  nutritionPlan,
  onSave,
  onCreate,
  createMode = false,
  allUsers,
}: EditNutritionModalProps) {
  const titleText = createMode
    ? "Create Nutrition Plan"
    : "Edit Nutrition Plan";
  const submitButtonText = createMode ? "Create" : "Save Changes";
  const { user: currentUser } = useAuth();

  // Form field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<Target | undefined>();
  const [localMeals, setLocalMeals] = useState<Meal[]>([]);
  const [sharedAccess, setSharedAccess] = useState<
    Array<{ accessLevel: string; userId: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canShowSharedAccess =
    createMode ||
    currentUser?.role === "admin" ||
    (typeof nutritionPlan?.userId === "string"
      ? nutritionPlan?.userId
      : nutritionPlan?.userId?._id) === currentUser?._id;

  // Calculate total calories from meals
  const calculateTotalCalories = (meals: Meal[]): number => {
    return meals.reduce((total, meal) => {
      const mealCalories = meal.foods.reduce(
        (sum, food) => sum + food.calories,
        0
      );
      return total + mealCalories;
    }, 0);
  };

  // Load data when modal opens or nutrition plan changes
  useEffect(() => {
    if (opened) {
      if (nutritionPlan && !createMode) {
        setTitle(nutritionPlan.title);
        setDescription(nutritionPlan.description);
        setTarget(nutritionPlan.target);
        setLocalMeals(nutritionPlan.meals || []);
        setSharedAccess(nutritionPlan.sharedAccess || []);
      } else {
        // Reset to defaults for create mode
        setTitle("");
        setDescription("");
        setTarget(undefined);
        setLocalMeals([]);
        setSharedAccess([]);
      }
    }
  }, [nutritionPlan, opened, createMode]);

  // Meal handlers
  const addMeal = (mealType: MealType) => {
    const newMeals = [
      ...localMeals,
      {
        mealType,
        foods: [],
      },
    ];
    setLocalMeals(newMeals);
  };

  const removeMeal = (index: number) => {
    const newMeals = [...localMeals];
    newMeals.splice(index, 1);
    setLocalMeals(newMeals);
  };

  const updateMeal = (index: number, updates: Partial<Meal>) => {
    const newMeals = [...localMeals];
    newMeals[index] = { ...newMeals[index], ...updates };
    setLocalMeals(newMeals);
  };

  const reorderMeals = (meals: Meal[]) => {
    setLocalMeals(meals);
  };

  // Food handlers
  const addFood = (mealIndex: number) => {
    const newMeals = JSON.parse(JSON.stringify(localMeals));
    newMeals[mealIndex].foods.push({
      name: "",
      quantity: null,
      unit: null,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    setLocalMeals(newMeals);
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    const newMeals = JSON.parse(JSON.stringify(localMeals));
    newMeals[mealIndex].foods.splice(foodIndex, 1);
    setLocalMeals(newMeals);
  };

  const updateFood = (
    mealIndex: number,
    foodIndex: number,
    updates: Partial<Food>
  ) => {
    const newMeals = JSON.parse(JSON.stringify(localMeals));
    newMeals[mealIndex].foods[foodIndex] = {
      ...newMeals[mealIndex].foods[foodIndex],
      ...updates,
    };
    setLocalMeals(newMeals);
  };

  // Shared access handler
  const handleViewAccessChange = (userIds: string[]) => {
    const newSharedAccess = userIds.map((userId: string) => ({
      userId,
      accessLevel: "view",
      objectType: "nutritionPlan" as const,
    }));
    setSharedAccess(newSharedAccess);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const totalCalories = calculateTotalCalories(localMeals);

    const data: Partial<NutritionPlan> = {
      title,
      description,
      target,
      totalCalories,
      meals: localMeals,
      sharedAccess: sharedAccess.map((sa) => ({
        userId: sa.userId,
        accessLevel: "view" as const,
        objectType: "nutritionPlan" as const,
      })),
    };

    try {
      if (createMode && onCreate) {
        await onCreate(data);
      } else {
        await onSave(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save nutrition plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCalories = calculateTotalCalories(localMeals);

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
      <Stack gap="md">
        {/* Basic Info Section */}
        <TextInput
          label="Title"
          placeholder="Enter nutrition plan title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe your nutrition plan"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
          required
        />

        <Select
          label="Goal"
          placeholder="Select your goal"
          data={[
            { value: "maintain", label: "Maintain" },
            { value: "cut", label: "Cut (Fat Loss)" },
            { value: "bulk", label: "Bulk (Muscle Gain)" },
          ]}
          value={target || null}
          onChange={(value) => setTarget(value as Target | undefined)}
          clearable
        />

        <NumberInput
          label="Total Calories"
          value={totalCalories}
          disabled
          readOnly
          suffix=" kcal"
          description="Automatically calculated from meals"
        />

        {/* Shared Access Section */}
        <Activity mode={canShowSharedAccess ? "visible" : "hidden"}>
          <SharedAccessSection
            allUsers={allUsers}
            sharedAccess={sharedAccess}
            handleViewAccessChange={handleViewAccessChange}
            objectType="nutritionPlan"
          />
        </Activity>

        {/* Meals Section */}
        <MealsSection
          meals={localMeals}
          onAddMeal={addMeal}
          onRemoveMeal={removeMeal}
          onUpdateMeal={updateMeal}
          onReorderMeals={reorderMeals}
          onAddFood={addFood}
          onRemoveFood={removeFood}
          onUpdateFood={updateFood}
        />

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {submitButtonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
