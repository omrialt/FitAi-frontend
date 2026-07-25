import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Card,
  Avatar,
  Badge,
  Modal,
  Select,
  Loader,
  Center,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconUserPlus, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import trainerConnectionService from "../services/trainer-connection.service";
import userService from "../services/user.service";
import {
  getConnectionParty,
  type TrainerConnection,
} from "../types/trainer-connection.types";
import type { User } from "../types/auth.types";

/**
 * Trainer roster — accepted clients and outstanding invites, with an invite
 * flow that picks a plain user from the directory. Gated to trainer/admin.
 */
export default function MyClientsPage() {
  const { t } = useTranslation();

  const [connections, setConnections] = useState<TrainerConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<TrainerConnection | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerConnectionService.getClients();
      setConnections(data);
    } catch {
      toast.error(t("clients.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => connections.filter((c) => c.status === "pending"),
    [connections],
  );
  const active = useMemo(
    () => connections.filter((c) => c.status === "accepted"),
    [connections],
  );

  // Users already connected (accepted or pending) — excluded from the picker
  const connectedIds = useMemo(
    () =>
      new Set(
        connections
          .map((c) => getConnectionParty(c.clientId)?._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [connections],
  );

  const openInvite = useCallback(async () => {
    setSelectedUser(null);
    setInviteOpen(true);
    try {
      const users = await userService.findAll();
      setCandidates(users.filter((u) => u.role === "user"));
    } catch {
      toast.error(t("clients.loadFailed"));
    }
  }, [t]);

  const candidateOptions = useMemo(
    () =>
      candidates
        .filter((u) => !connectedIds.has(u._id))
        .map((u) => ({ value: u._id, label: `${u.fullName} (${u.email})` })),
    [candidates, connectedIds],
  );

  const handleInvite = useCallback(async () => {
    if (!selectedUser) return;
    setInviting(true);
    try {
      await trainerConnectionService.invite(selectedUser);
      toast.success(t("clients.inviteSent"));
      setInviteOpen(false);
      await load();
    } catch {
      toast.error(t("clients.inviteFailed"));
    } finally {
      setInviting(false);
    }
  }, [selectedUser, t, load]);

  const handleRemove = useCallback(async () => {
    if (!removeTarget) return;
    try {
      await trainerConnectionService.remove(removeTarget._id);
      toast.success(t("clients.clientRemoved"));
      await load();
    } catch {
      toast.error(t("clients.removeFailed"));
    }
  }, [removeTarget, t, load]);

  const renderRow = (c: TrainerConnection, isPending: boolean) => {
    const client = getConnectionParty(c.clientId);
    return (
      <Card key={c._id} withBorder radius="md" padding="md">
        <Group justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
            <Avatar src={client?.avatarUrl} radius="xl" color="indigo">
              {client?.fullName?.[0]?.toUpperCase()}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text fw={600} truncate>
                {client?.fullName ?? t("common.none")}
              </Text>
              <Text size="sm" c="dimmed" truncate>
                {client?.email}
              </Text>
            </Box>
          </Group>
          <Group wrap="nowrap" gap="xs">
            {isPending && (
              <Badge color="yellow" variant="light">
                {t("clients.pending")}
              </Badge>
            )}
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label={t("clients.remove")}
              onClick={() => setRemoveTarget(c)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    );
  };

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <Group
          justify="space-between"
          align="flex-start"
          mb="lg"
          wrap="nowrap"
        >
          <Box>
            <Title order={1}>{t("clients.pageTitle")}</Title>
            <Text c="dimmed" mt={4}>
              {t("clients.pageSubtitle")}
            </Text>
          </Box>
          <Button leftSection={<IconUserPlus size={18} />} onClick={openInvite}>
            {t("clients.inviteClient")}
          </Button>
        </Group>

        {loading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : (
          <Stack gap="xl">
            <Box>
              <Title order={3} mb="sm">
                {t("clients.activeClients")}
              </Title>
              {active.length === 0 ? (
                <Text c="dimmed">{t("clients.noClients")}</Text>
              ) : (
                <Stack gap="sm">{active.map((c) => renderRow(c, false))}</Stack>
              )}
            </Box>

            <Box>
              <Title order={3} mb="sm">
                {t("clients.pendingInvites")}
              </Title>
              {pending.length === 0 ? (
                <Text c="dimmed">{t("clients.noPending")}</Text>
              ) : (
                <Stack gap="sm">{pending.map((c) => renderRow(c, true))}</Stack>
              )}
            </Box>
          </Stack>
        )}
      </Container>

      <Modal
        opened={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t("clients.inviteModalTitle")}
        centered
      >
        <Stack>
          <Select
            label={t("clients.selectUser")}
            placeholder={t("clients.selectUserPlaceholder")}
            data={candidateOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            searchable
            nothingFoundMessage={t("clients.noUsersAvailable")}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setInviteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleInvite}
              loading={inviting}
              disabled={!selectedUser}
            >
              {t("clients.sendInvite")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmDeleteModal
        opened={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title={t("clients.removeTitle")}
        question={t("clients.removeQuestion")}
        warning={t("clients.removeWarning")}
        confirmLabel={t("clients.remove")}
      />
    </AppLayout>
  );
}
