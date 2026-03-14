/**
 * MealCard - Component for a single meal with foods and drag-drop support
 */

"use client";

import { Paper, Stack, Group, Button, Text, Select, Badge, ActionIcon, Divider, Box, Collapse } from "@mantine/core";
import { IconTrash, IconPlus, IconGripVertical, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FoodItem } from "./FoodItem";
import type { Meal, Food, MealType } from "../../../types/nutrition.types";
import type { MealCardProps } from '../../../types/nutrition-components.types';

const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const getMealTypeColor = (mealType: MealType) => {
  switch (mealType) {
    case "breakfast":
      return "yellow";
    case "lunch":
      return "green";
    case "dinner":
      return "blue";
    case "snack":
      return "grape";
    default:
      return "gray";
  }
};

export function MealCard({
  id,
  meal,
  onRemove,
  onUpdate,
  onAddFood,
  onRemoveFood,
  onUpdateFood,
}: MealCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const mealCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
  const mealProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
  const mealCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
  const mealFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);

  return (
    <Paper ref={setNodeRef} style={style} p="md" withBorder>
      <Stack gap="md">
        {/* Meal Header */}
        <Group justify="space-between">
          <Group>
            <Box
              {...attributes}
              {...listeners}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', display: 'flex', alignItems: 'center' }}
            >
              <IconGripVertical size={20} style={{ color: 'var(--mantine-color-gray-5)' }} />
            </Box>
            <Select
              data={mealTypeOptions}
              value={meal.mealType}
              onChange={(value) => onUpdate({ mealType: value as MealType })}
              styles={{ input: { fontWeight: 500 } }}
            />
            <Badge color={getMealTypeColor(meal.mealType)} variant="light">
              {meal.foods.length} {meal.foods.length === 1 ? "food" : "foods"}
            </Badge>
          </Group>
          <Group gap="xs">
            <ActionIcon 
              variant="subtle" 
              onClick={() => setIsOpen(!isOpen)}
              size="sm"
            >
              {isOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            </ActionIcon>
            <ActionIcon color="red" variant="subtle" onClick={onRemove}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Meal Totals */}
        <Group gap="xs">
          <Badge variant="filled" color="orange">
            {mealCalories.toFixed(0)} kcal
          </Badge>
          <Badge variant="outline">P: {mealProtein.toFixed(1)}g</Badge>
          <Badge variant="outline">C: {mealCarbs.toFixed(1)}g</Badge>
          <Badge variant="outline">F: {mealFat.toFixed(1)}g</Badge>
        </Group>

        <Divider />

        <Collapse in={isOpen}>
          {/* Foods List */}
          {meal.foods.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center">
              No foods added yet
            </Text>
          ) : (
            <Stack gap="sm">
              {meal.foods.map((food, foodIndex) => (
                <FoodItem
                  key={foodIndex}
                  food={food}
                  onRemove={() => onRemoveFood(foodIndex)}
                  onUpdate={(updates: Partial<Food>) => onUpdateFood(foodIndex, updates)}
                />
              ))}
            </Stack>
          )}

          {/* Add Food Button */}
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            size="sm"
            onClick={onAddFood}
            mt="sm"
          >
            Add Food
          </Button>
        </Collapse>
      </Stack>
    </Paper>
  );
}
