/**
 * MealsSection - Component for managing meals in nutrition plan with drag and drop
 */

"use client";

import { Stack, Title, Button, Group, Menu, Paper, Text, Badge } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import { MealCard } from "./MealCard";
import type { Meal, Food, MealType } from "../../../types/nutrition.types";
import type { MealsSectionProps } from '../../../types/nutrition-components.types';

export function MealsSection({
  meals,
  onAddMeal,
  onRemoveMeal,
  onUpdateMeal,
  onAddFood,
  onRemoveFood,
  onUpdateFood,
  onReorderMeals,
}: MealsSectionProps) {
  const { t } = useTranslation();

  const mealTypeOptions: { value: MealType; label: string }[] = [
    { value: "breakfast", label: t('nutrition.breakfast') },
    { value: "lunch", label: t('nutrition.lunch') },
    { value: "dinner", label: t('nutrition.dinner') },
    { value: "snack", label: t('nutrition.snack') },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = meals.findIndex((_, index) => `meal-${index}` === active.id);
      const newIndex = meals.findIndex((_, index) => `meal-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedMeals = arrayMove(meals, oldIndex, newIndex);
        onReorderMeals(reorderedMeals);
      }
    }
  };

  const totalCalories = meals.reduce((total, meal) => {
    const mealCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
    return total + mealCalories;
  }, 0);

  const totalProtein = meals.reduce((total, meal) => {
    const mealProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
    return total + mealProtein;
  }, 0);

  const totalCarbs = meals.reduce((total, meal) => {
    const mealCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    return total + mealCarbs;
  }, 0);

  const totalFat = meals.reduce((total, meal) => {
    const mealFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);
    return total + mealFat;
  }, 0);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={4}>{t('nutrition.meals')}</Title>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              {t('nutrition.addMeal')}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {mealTypeOptions.map((option) => (
              <Menu.Item key={option.value} onClick={() => onAddMeal(option.value)}>
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      {meals.length === 0 ? (
        <Paper p="md" withBorder>
          <Text c="dimmed" ta="center">
            {t('nutrition.noMealsYet', { action: t('nutrition.addMeal') })}
          </Text>
        </Paper>
      ) : (
        <>
          <Group>
            <Badge size="lg" variant="light">
              {t('nutrition.mealCount', { count: meals.length })}
            </Badge>
            <Badge size="lg" variant="light" color="orange">
              {totalCalories.toFixed(0)} {t('nutrition.kcal')}
            </Badge>
            <Badge size="lg" variant="light" color="blue">
              {t('nutrition.protein')}: {totalProtein.toFixed(1)}g
            </Badge>
            <Badge size="lg" variant="light" color="green">
              {t('nutrition.carbs')}: {totalCarbs.toFixed(1)}g
            </Badge>
            <Badge size="lg" variant="light" color="red">
              {t('nutrition.fats')}: {totalFat.toFixed(1)}g
            </Badge>
          </Group>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={meals.map((_, index) => `meal-${index}`)} strategy={verticalListSortingStrategy}>
              {meals.map((meal, index) => (
                <MealCard
                  key={`meal-${index}`}
                  id={`meal-${index}`}
                  meal={meal}
                  mealIndex={index}
                  onRemove={() => onRemoveMeal(index)}
                  onUpdate={(updates: Partial<Meal>) => onUpdateMeal(index, updates)}
                  onAddFood={() => onAddFood(index)}
                  onRemoveFood={(foodIndex: number) => onRemoveFood(index, foodIndex)}
                  onUpdateFood={(foodIndex: number, updates: Partial<Food>) => onUpdateFood(index, foodIndex, updates)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </>
      )}
    </Stack>
  );
}
