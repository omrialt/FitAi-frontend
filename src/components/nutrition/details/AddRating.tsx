/**
 * AddRating - Form to add a new rating with stars and comment
 */

import { Stack, Textarea, Button, Card, Title, Group } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StarRating } from '../../common/StarRating';
import type { AddRatingProps } from '../../../types/nutrition-components.types';

export function AddRating({ onSubmit, loading = false }: AddRatingProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card shadow="sm" p="md" withBorder>
      <Title order={3} mb="md">
        {t('nutrition.addYourRating')}
      </Title>

      <Stack gap="md">
        <div>
          <StarRating
            rating={rating}
            onChange={setRating}
            size={24}
            color="yellow"
          />
        </div>

        <Textarea
          label={t('nutrition.commentLabel')}
          placeholder={t('nutrition.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
          minRows={3}
          maxRows={6}
        />

        <Group justify="flex-end">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting || loading}
            loading={isSubmitting || loading}
          >
            {t('nutrition.submitRating')}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
