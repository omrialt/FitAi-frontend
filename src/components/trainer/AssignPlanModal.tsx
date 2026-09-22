import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  MultiSelect,
  Text,
  Badge,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { trainingPlanService } from '../../services/training-plan.service';
import trainerConnectionService from '../../services/trainer-connection.service';
import { getConnectionParty } from '../../types/trainer-connection.types';
import type { AssignmentResult } from '../../types/training-plan.types';

interface AssignPlanModalProps {
  opened: boolean;
  onClose: () => void;
  templateId: string | null;
  templateTitle?: string;
}

interface AssignPlanBodyProps {
  onClose: () => void;
  templateId: string | null;
  /** The modal only mounts the body while it is open; this re-arms it. */
  active: boolean;
}

/**
 * Hand one template to several clients.
 *
 * The modal does not close on completion, and that is the point. The server
 * answers with a row per client — created, already had it, not your client —
 * and closing on "success" would throw away the only place that information
 * exists. The trainer decides when they have read it.
 */
export function AssignPlanModal({
  opened,
  onClose,
  templateId,
  templateTitle,
}: AssignPlanModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={templateTitle ?? t('planLibrary.assignTitle')}
      size="lg"
    >
      <AssignPlanBody
        onClose={onClose}
        templateId={templateId}
        active={opened}
      />
    </Modal>
  );
}

/**
 * The form itself, separated from the modal chrome so it can be rendered — and
 * tested — without a portal, an overlay and a focus trap around it.
 */
export function AssignPlanBody({
  onClose,
  templateId,
  active,
}: AssignPlanBodyProps) {
  const { t } = useTranslation();

  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<AssignmentResult[] | null>(null);

  useEffect(() => {
    if (!active) return;

    setResults(null);
    setSelected([]);

    (async () => {
      try {
        const connections = await trainerConnectionService.getClients();
        setOptions(
          connections
            // Accepted only. A pending invite is not yet a client, and the
            // server would skip them anyway — better not to offer the row.
            .filter((connection) => connection.status === 'accepted')
            .map((connection) => getConnectionParty(connection.clientId))
            .filter((client): client is NonNullable<typeof client> =>
              Boolean(client),
            )
            .map((client) => ({
              value: client._id,
              label: `${client.fullName} (${client.email})`,
            })),
        );
      } catch {
        toast.error(t('clients.loadFailed'));
      }
    })();
  }, [active, t]);

  const handleAssign = useCallback(async () => {
    if (!templateId || selected.length === 0) return;

    setSubmitting(true);
    try {
      const assigned = await trainingPlanService.assignToClients(
        templateId,
        selected,
        startDate ? { startDate: startDate.toISOString() } : {},
      );
      setResults(assigned);
    } catch {
      toast.error(t('planLibrary.assignFailed'));
    } finally {
      setSubmitting(false);
    }
  }, [templateId, selected, startDate, t]);

  const labelFor = (clientId: string) =>
    options.find((option) => option.value === clientId)?.label ?? clientId;

  const created =
    results?.filter((row) => row.status === 'created').length ?? 0;

  return (
    <Stack gap="md">
      {results ? (
        <>
          <Alert color={created > 0 ? 'green' : 'yellow'}>
            {t('planLibrary.assignSummary', {
              created,
              total: results.length,
            })}
          </Alert>

          <Stack gap="xs">
            {results.map((row) => (
              <Group key={row.clientId} justify="space-between" wrap="nowrap">
                <Text size="sm" truncate>
                  {labelFor(row.clientId)}
                </Text>
                <Badge
                  color={
                    row.status === 'created'
                      ? 'green'
                      : row.status === 'skipped'
                        ? 'gray'
                        : 'red'
                  }
                  variant="light"
                >
                  {row.reason
                    ? t(`planLibrary.reason.${row.reason}`)
                    : t(`planLibrary.status.${row.status}`)}
                </Badge>
              </Group>
            ))}
          </Stack>

          <Group justify="flex-end">
            <Button onClick={onClose}>{t('common.close')}</Button>
          </Group>
        </>
      ) : (
        <>
          <MultiSelect
            label={t('planLibrary.pickClients')}
            placeholder={t('planLibrary.pickClientsPlaceholder')}
            data={options}
            value={selected}
            onChange={setSelected}
            searchable
            nothingFoundMessage={t('clients.noClients')}
          />

          <DateInput
            label={t('planLibrary.startDate')}
            description={t('planLibrary.startDateHint')}
            value={startDate}
            onChange={(value) => setStartDate(value ? new Date(value) : null)}
            clearable
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAssign}
              loading={submitting}
              disabled={selected.length === 0}
            >
              {t('planLibrary.assign')}
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}
