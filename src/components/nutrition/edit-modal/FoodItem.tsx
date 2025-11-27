/**
 * FoodItem - Component for a single food item
 */

"use client";

import { Group, TextInput, NumberInput, ActionIcon, Paper, Select } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { Food } from "../../../types/nutrition.types";

interface FoodItemProps {
  food: Food;
  onRemove: () => void;
  onUpdate: (updates: Partial<Food>) => void;
}

export function FoodItem({ food, onRemove, onUpdate }: FoodItemProps) {
  return (
    <Paper p="sm" withBorder bg="gray.0">
      <Group gap="xs" align="flex-start" wrap="wrap">
        {/* Food Name */}
        <TextInput
          placeholder="Food name"
          value={food.name}
          onChange={(e) => onUpdate({ name: e.currentTarget.value })}
          style={{ flex: "1 1 200px", minWidth: "150px" }}
          size="sm"
        />

        {/* Quantity */}
        <NumberInput
          placeholder="Qty"
          value={food.quantity ?? 0}
          onChange={(value) => onUpdate({ quantity: typeof value === 'number' ? value : 0 })}
          min={0}
          prefix="Qty: "
          style={{ flex: "0 1 100px" }}
          size="sm"
        />

        {/* Unit */}
        <Select
          placeholder="Unit"
          value={food.unit || null}
          onChange={(value) => onUpdate({ unit: value as Food['unit'] })}
          data={[
            { value: 'g', label: 'g' },
            { value: 'kg', label: 'kg' },
            { value: 'ml', label: 'ml' },
            { value: 'l', label: 'l' },
            { value: 'oz', label: 'oz' },
            { value: 'lb', label: 'lb' },
            { value: 'cup', label: 'cup' },
            { value: 'tbsp', label: 'tbsp' },
            { value: 'tsp', label: 'tsp' },
            { value: 'unit', label: 'unit' },
          ]}
          style={{ flex: "0 1 100px" }}
          size="sm"
          clearable
        />

        {/* Calories */}
        <NumberInput
          placeholder="Calories"
          value={food.calories}
          onChange={(value) => onUpdate({ calories: typeof value === 'number' ? value : 0 })}
          min={0}
          prefix="Cal: "
          suffix=" kcal"
          style={{ flex: "0 1 120px" }}
          size="sm"
        />

        {/* Protein */}
        <NumberInput
          placeholder="Protein"
          value={food.protein}
          onChange={(value) => onUpdate({ protein: typeof value === 'number' ? value : 0 })}
          min={0}
          step={0.1}
          prefix="P: "
          suffix=" g"
          style={{ flex: "0 1 100px" }}
          size="sm"
        />

        {/* Carbs */}
        <NumberInput
          placeholder="Carbs"
          value={food.carbs}
          onChange={(value) => onUpdate({ carbs: typeof value === 'number' ? value : 0 })}
          min={0}
          step={0.1}
          prefix="C: "
          suffix=" g"
          style={{ flex: "0 1 100px" }}
          size="sm"
        />

        {/* Fat */}
        <NumberInput
          placeholder="Fat"
          value={food.fat}
          onChange={(value) => onUpdate({ fat: typeof value === 'number' ? value : 0 })}
          min={0}
          step={0.1}
          prefix="F: "
          suffix=" g"
          style={{ flex: "0 1 100px" }}
          size="sm"
        />

        {/* Delete Button */}
        <ActionIcon color="red" variant="subtle" onClick={onRemove} size="sm">
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
