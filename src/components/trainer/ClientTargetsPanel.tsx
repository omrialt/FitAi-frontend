import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { StitchIcon } from '../common/StitchIcon';
import { TargetsList } from '../profile/physical-data/targets/TargetsList';
import { TargetModal } from '../profile/physical-data/targets/TargetModal';
import { DeleteTargetModal } from '../profile/physical-data/targets/DeleteTargetModal';
import physicalTargetService from '../../services/physical-target.service';
import { useAuthStore } from '../../store/authStore';
import type {
  CreatePhysicalTargetDto,
  PhysicalTarget,
  PhysicalTargetStatus,
  TargetProgress,
  UpdatePhysicalTargetDto,
} from '../../types/physical-target.types';

interface ClientTargetsPanelProps {
  clientId: string;
}

/**
 * A client's goals, seen — and set — by their trainer.
 *
 * The target belongs to the client: it is created with their id, measured
 * from their latest weigh-in, and shown on their own Physical Data page. What
 * the trainer may then do with it is narrower than what the client may (the
 * server enforces this; the screen only mirrors it): edit, close or delete the
 * targets *they* set, and read the ones the client set for themselves.
 */
export function ClientTargetsPanel({ clientId }: ClientTargetsPanelProps) {
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;
  const me = useAuthStore((state) => state.user?._id);

  const [targets, setTargets] = useState<PhysicalTarget[]>([]);
  const [progress, setProgress] = useState<TargetProgress[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<PhysicalTarget | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, prog] = await Promise.all([
        physicalTargetService.getByUserId(clientId),
        physicalTargetService.getProgress(clientId),
      ]);
      setTargets(list);
      setProgress(prog);
    } catch {
      toast.error(tRef.current('physicalTargets.loadFailed'));
    } finally {
      setLoaded(true);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const mine = (target: PhysicalTarget) => !!me && target.createdBy === me;

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      await load();
      toast.success(t(success));
    } catch {
      toast.error(t(failure));
    }
  };

  const create = (data: CreatePhysicalTargetDto) =>
    run(
      () => physicalTargetService.create({ ...data, userId: clientId }),
      'physicalTargets.addedSuccess',
      'physicalTargets.addFailed',
    );

  const update = (id: string, data: UpdatePhysicalTargetDto) =>
    run(
      () => physicalTargetService.update(id, data),
      'physicalTargets.updatedSuccess',
      'physicalTargets.updateFailed',
    );

  const changeStatus = (target: PhysicalTarget, status: PhysicalTargetStatus) =>
    run(
      () => physicalTargetService.update(target._id, { status }),
      `physicalTargets.statusChanged.${status}`,
      'physicalTargets.updateFailed',
    );

  const remove = async () => {
    if (!selected) return;
    await run(
      () => physicalTargetService.delete(selected._id),
      'physicalTargets.deletedSuccess',
      'physicalTargets.deleteFailed',
    );
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
        >
          <StitchIcon name="add" size={16} />
          {t('physicalTargets.setGoal')}
        </button>
      </div>

      {loaded && (
        <TargetsList
          targets={targets}
          progress={progress}
          onEdit={(target) => {
            setSelected(target);
            setModalOpen(true);
          }}
          onDelete={(target) => {
            setSelected(target);
            setDeleteOpen(true);
          }}
          onStatusChange={changeStatus}
          canManage={mine}
          attributionFor={(target) =>
            t(mine(target) ? 'physicalTargets.setByYou' : 'physicalTargets.setByClient')
          }
          emptyTitle={t('physicalTargets.clientNoTargets')}
          emptyText={t('physicalTargets.clientNoTargetsText')}
        />
      )}

      <TargetModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        target={selected}
        onSave={create}
        onUpdate={update}
      />
      <DeleteTargetModal
        opened={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        target={selected}
        onConfirm={remove}
      />
    </div>
  );
}
