/**
 * TargetsList - grid of active/past physical targets.
 */

import { useTranslation } from 'react-i18next';
import { SimpleGrid } from '@mantine/core';

import { TargetCard } from './TargetCard';
import { StitchIcon } from '../../../common/StitchIcon';
import type { TargetsListProps } from '../../../../types/physical-target-components.types';

export function TargetsList({ targets, progress, onEdit, onDelete }: TargetsListProps) {
  const { t } = useTranslation();

  if (targets.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-dashed border-outline-variant/30 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <StitchIcon name="track_changes" size={22} />
        </div>
        <p className="font-bold text-on-surface">{t('physicalTargets.noTargets')}</p>
        <p className="text-sm text-on-surface-variant mt-1">{t('physicalTargets.noTargetsText')}</p>
      </div>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
      {targets.map((target) => (
        <TargetCard
          key={target._id}
          target={target}
          progress={progress.find((p) => p.targetId === target._id)}
          onEdit={() => onEdit(target)}
          onDelete={() => onDelete(target)}
        />
      ))}
    </SimpleGrid>
  );
}
