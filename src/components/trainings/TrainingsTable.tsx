/**
 * TrainingsTable — desktop table view. "Performance Lab" design.
 *
 * Rows are separated by background shift and generous padding rather than
 * divider lines, per the "No-Line" rule in DESIGN.md.
 */

"use client";

import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { StitchIcon, type StitchIconName } from "../common/StitchIcon";
import { TrainingsActionsMenu } from "./TrainingsActionsMenu";
import type { TrainingsTableProps } from '../../types/trainings-components.types';

const getDifficultyMeta = (
  difficulty: string,
): { labelKey: string | null; pill: string } => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return { labelKey: "trainings.beginner", pill: "bg-surface-container-high text-on-surface-variant" };
    case "intermediate":
      return { labelKey: "trainings.intermediate", pill: "bg-secondary-container text-on-secondary-container" };
    case "advanced":
      return { labelKey: "trainings.advanced", pill: "bg-secondary-container text-on-secondary-container" };
    case "elite":
      return { labelKey: "trainings.elite", pill: "bg-error-container text-on-error-container" };
    default:
      return { labelKey: null, pill: "bg-surface-container-high text-on-surface-variant" };
  }
};

const getPlanIcon = (difficulty: string): StitchIconName => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "person";
    case "advanced":
    case "elite":
      return "bolt";
    default:
      return "fitness_center";
  }
};

/** Icon chip tint, mirroring the design's per-plan colour coding. */
const getPlanChip = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-tertiary-container text-on-tertiary-container";
    case "intermediate":
      return "bg-secondary-container text-on-secondary-container";
    case "advanced":
      return "bg-warning-container text-on-warning-container";
    case "elite":
      return "bg-error-container text-on-error-container";
    default:
      return "bg-primary/10 text-primary";
  }
};

const formatModified = (t: TFunction, lng: string, date?: string | Date) => {
  if (!date) return null;
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return t('trainings.modifiedToday');
  if (days === 1) return t('trainings.modifiedYesterday');
  if (days < 7) return t('trainings.modifiedDaysAgo', { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return t('trainings.modifiedWeeksAgo', { count: weeks });
  const formatted = d.toLocaleDateString(lng === 'he' ? 'he-IL' : 'en-GB', {
    month: 'short',
    day: 'numeric',
  });
  return t('trainings.modifiedOn', { date: formatted });
};

const TH =
  "text-start text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-6 py-4";

export function TrainingsTable({
  trainings,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: TrainingsTableProps) {
  const { t, i18n } = useTranslation();

  if (trainings.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('trainings.noTrainings')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className={TH}>{t('trainings.planDetails')}</th>
              <th className={TH}>{t('trainings.difficulty')}</th>
              <th className={TH}>{t('trainings.target')}</th>
              <th className={TH}>{t('trainings.days')}</th>
              <th className={TH}>{t('trainings.leadTrainer')}</th>
              <th className={TH}>{t('trainings.status')}</th>
              <th className={TH}>{t('trainings.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((training) => {
              const diffMeta = getDifficultyMeta(training.difficulty);
              const trainerName =
                training.trainerId && typeof training.trainerId === "object"
                  ? training.trainerId.fullName
                  : training.userId && typeof training.userId === "object"
                    ? training.userId.fullName
                    : null;
              const modifiedText = formatModified(
                t,
                i18n.language,
                (training as { updatedAt?: string }).updatedAt || training.createdAt,
              );

              return (
                <tr
                  key={training._id}
                  onClick={() => onView(training._id)}
                  className="cursor-pointer hover:bg-surface-container-low/60 transition-colors"
                >
                  {/* Plan details */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getPlanChip(training.difficulty)}`}
                      >
                        <StitchIcon name={getPlanIcon(training.difficulty)} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate">
                          {training.title}
                        </p>
                        {modifiedText && (
                          <p className="text-xs text-on-surface-variant">
                            {modifiedText}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="px-6 py-5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${diffMeta.pill}`}
                    >
                      {diffMeta.labelKey
                        ? t(diffMeta.labelKey)
                        : training.difficulty || t('common.none')}
                    </span>
                  </td>

                  {/* Target */}
                  <td className="px-6 py-5">
                    <span className="text-sm text-on-surface capitalize">
                      {training.focus || training.target || t('common.none')}
                    </span>
                  </td>

                  {/* Days */}
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-primary">
                      {training.days?.length || 0}
                    </span>
                  </td>

                  {/* Lead trainer */}
                  <td className="px-6 py-5">
                    {trainerName ? (
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                          {trainerName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="text-sm text-on-surface">{trainerName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-on-surface-variant">
                        {t('common.none')}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          training.isActive ? 'bg-success' : 'bg-outline'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          training.isActive
                            ? 'text-success'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {training.isActive
                          ? t('trainings.active')
                          : t('trainings.inactive')}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <TrainingsActionsMenu
                      training={training}
                      isAdmin={isAdmin}
                      currentUserId={currentUserId}
                      onView={onView}
                      onEdit={onEdit}
                      onExportPDF={onExportPDF}
                      onExportExcel={onExportExcel}
                      onDelete={onDelete}
                      onActivate={onActivate}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
