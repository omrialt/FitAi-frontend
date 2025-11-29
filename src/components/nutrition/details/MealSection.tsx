/**
 * MealSection - Display meals grouped by meal type with food details
 */

import { Activity } from 'react';

import { Stack, Title, Card, Text, Group, Badge, Table, Box, SimpleGrid } from '@mantine/core';
import type { Meal, MealType } from '../../../types/nutrition.types';

interface MealSectionProps {
  meals: Meal[];
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const mealTypeIcons: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '🌞',
  dinner: '🌙',
  snack: '🍎',
};

export function MealSection({ meals }: MealSectionProps) {
  return (
    <Stack gap="lg" mb="xl">
      <Title order={2}>Meals</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {meals.map((meal, mealIndex) => {
          const totalMealCalories = meal.foods.reduce(
            (sum, food) => sum + food.calories,
            0
          );
          const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
          const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
          const totalFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);

          return (
            <Card key={mealIndex} shadow="sm" p="md" withBorder>
              <Group justify="space-between" mb="md" wrap="wrap">
                <Group gap="xs">
                  <Text size="lg">{mealTypeIcons[meal.mealType]}</Text>
                  <Title order={3}>Meal {mealIndex + 1} - {mealTypeLabels[meal.mealType]}</Title>
                </Group>
                <Group gap="md" wrap="wrap">
                  <Badge variant="light" color="orange">
                    {totalMealCalories.toFixed(0)} kcal
                  </Badge>
                  <Badge variant="light" color="blue">
                    P: {totalProtein.toFixed(0)}g
                  </Badge>
                  <Badge variant="light" color="yellow">
                    C: {totalCarbs.toFixed(0)}g
                  </Badge>
                  <Badge variant="light" color="green">
                    F: {totalFat.toFixed(0)}g
                  </Badge>
                </Group>
              </Group>

              <Activity mode={meal.foods.length > 0 ? "visible" : "hidden"}>
                <Box style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Food</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                        <Table.Th>Calories</Table.Th>
                        <Table.Th>Protein</Table.Th>
                        <Table.Th>Carbs</Table.Th>
                        <Table.Th>Fat</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {meal.foods.map((food, foodIndex) => (
                        <Table.Tr key={foodIndex}>
                          <Table.Td>
                            <Text fw={500}>{food.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            {food.quantity && food.unit
                              ? `${food.quantity} ${food.unit}`
                              : '-'}
                          </Table.Td>
                          <Table.Td>{food.calories.toFixed(0)} kcal</Table.Td>
                          <Table.Td>{food.protein.toFixed(1)}g</Table.Td>
                          <Table.Td>{food.carbs.toFixed(1)}g</Table.Td>
                          <Table.Td>{food.fat.toFixed(1)}g</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              </Activity>
              <Activity mode={meal.foods.length === 0 ? "visible" : "hidden"}>
                <Text c="dimmed" size="sm">
                  No foods added yet
                </Text>
              </Activity>
            </Card>
          );
        })}
      </SimpleGrid>

      <Activity mode={meals.length === 0 ? "visible" : "hidden"}>
        <Text c="dimmed" size="sm" ta="center">
          No meals added to this plan yet
        </Text>
      </Activity>
    </Stack>
  );
}
