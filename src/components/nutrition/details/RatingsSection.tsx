/**
 * RatingsSection - Athlete testimonials and performance rating
 */

import { Stack, Title, Paper, Text, Group, Box, Avatar, Progress } from '@mantine/core';

import { useTranslation } from 'react-i18next';
import { StarRating } from '../../common/StarRating';

import type { User } from '../../../types/auth.types';
import type { RatingsSectionProps } from '../../../types/nutrition-components.types';

export function RatingsSection({ ratings }: RatingsSectionProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const locale = i18n.language === 'he' ? 'he-IL' : 'en-GB';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const avgRating = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;

  return (
    <Stack gap="lg" mb="xl">
      {/* Performance Rating summary */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="md" mb="md" align="flex-start">
          <Box>
            <Text size="3rem" fw={800} lh={1}>{avgRating > 0 ? avgRating.toFixed(1) : '\u2014'}</Text>
            <StarRating rating={avgRating} readonly size={18} />
            <Text size="xs" c="dimmed" mt={4}>{t('nutrition.basedOn', { count: ratings.length })}</Text>
          </Box>
          <Box style={{ flex: 1 }} ml="xl">
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" w={60}>{t('nutrition.satiety')}</Text>
                <Progress value={Math.min(avgRating / 5 * 100, 100)} color="indigo" radius="xl" style={{ flex: 1 }} size="md" />
                <Text size="sm" fw={600} w={36}>{(avgRating / 5 * 100).toFixed(0)}%</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" w={60}>{t('nutrition.energy')}</Text>
                <Progress value={Math.min(avgRating / 5 * 92, 100)} color="cyan" radius="xl" style={{ flex: 1 }} size="md" />
                <Text size="sm" fw={600} w={36}>{(avgRating / 5 * 92).toFixed(0)}%</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" w={60}>{t('nutrition.prep')}</Text>
                <Progress value={Math.min(avgRating / 5 * 74, 100)} color="violet" radius="xl" style={{ flex: 1 }} size="md" />
                <Text size="sm" fw={600} w={36}>{(avgRating / 5 * 74).toFixed(0)}%</Text>
              </Group>
            </Stack>
          </Box>
        </Group>
      </Paper>

      {/* Testimonials */}
      <Title order={3}>{t('nutrition.reviews')}</Title>

      {ratings.length === 0 ? (
        <Text c="dimmed" size="sm" ta="center">{t('nutrition.noRatings')}</Text>
      ) : (
        <Stack gap="md">
          {ratings.map((rating, index) => {
            const user = typeof rating.userId === 'string' ? null : (rating.userId as User);
            const userName = user?.fullName || t('nutrition.anonymousAthlete');
            const initial = userName.charAt(0).toUpperCase();

            return (
              <Paper key={index} p="lg" radius="md" withBorder>
                <Group align="flex-start" gap="md">
                  <Avatar color="indigo" radius="xl" size="md">{initial}</Avatar>
                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between" mb={4}>
                      <Text fw={600}>{userName}</Text>
                      <Text size="xs" c="dimmed">{formatDate(rating.createdAt)}</Text>
                    </Group>
                    <StarRating rating={rating.rating} readonly size={14} />
                    {rating.comment && (
                      <Text size="sm" c="dimmed" mt="xs" style={{ fontStyle: 'italic' }}>
                        "{rating.comment}"
                      </Text>
                    )}
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
