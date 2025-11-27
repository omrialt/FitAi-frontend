/**
 * StarRating - Reusable star rating component for display and input
 */

import { Group, ActionIcon, Text } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
  color?: string;
}

export function StarRating({
  rating,
  onChange,
  readonly = false,
  size = 20,
  showValue = false,
  color = 'yellow',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = readonly ? rating : (hoverRating || rating);

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  return (
    <Group gap="xs">
      {[1, 2, 3, 4, 5].map((value) => (
        <ActionIcon
          key={value}
          variant="transparent"
          color={color}
          size={size}
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readonly && setHoverRating(value)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          {displayRating >= value ? (
            <IconStarFilled size={size} />
          ) : (
            <IconStar size={size} />
          )}
        </ActionIcon>
      ))}
      {showValue && (
        <Text size="sm" c="dimmed">
          {rating.toFixed(1)}
        </Text>
      )}
    </Group>
  );
}
