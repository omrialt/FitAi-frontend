import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Card,
  Loader,
  Center,
  Box,
  Collapse,
  Badge,
} from '@mantine/core';
import { IconRefresh, IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AppLayout } from '../components/AppLayout';
import { ClientAlertCard } from '../components/trainer/ClientAlertCard';
import { splitByAttention } from '../components/trainer/alerts';
import trainerDashboardService from '../services/trainer-dashboard.service';
import type { TrainerDashboardRow } from '../types/trainer-dashboard.types';

/**
 * The roster, seen sideways.
 *
 * `MyClientsPage` answers "who are my clients" and `ClientDetailPage` answers
 * "how is this one doing". Neither answers the question a coach with ten
 * clients actually opens the app with — *which* one needs me — and that gap is
 * the whole Tier 3 dashboard row.
 *
 * The server sorts and this page preserves that order; the only presentation
 * decision made here is that quiet clients are collapsed behind a count.
 */
export default function TrainerDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState<TrainerDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [quietOpen, setQuietOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await trainerDashboardService.getOverview());
    } catch {
      toast.error(t('trainerDashboard.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const { needsAttention, quiet } = useMemo(
    () => splitByAttention(rows),
    [rows],
  );

  const openClient = useCallback(
    (clientId: string) => navigate(`/clients/${clientId}`),
    [navigate],
  );

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        {/* Refresh is secondary: an icon beside the title on phones (the
            labelled button clipped to "רע" there), the full button from sm. */}
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Title order={1}>{t('trainerDashboard.pageTitle')}</Title>
            <Text c="dimmed" mt={4}>
              {t('trainerDashboard.pageSubtitle')}
            </Text>
          </Box>
          <ActionIcon
            hiddenFrom="sm"
            variant="light"
            size="xl"
            onClick={load}
            loading={loading}
            aria-label={t('trainerDashboard.refresh')}
          >
            <IconRefresh size={20} />
          </ActionIcon>
          <Button
            visibleFrom="sm"
            variant="light"
            leftSection={<IconRefresh size={18} />}
            onClick={load}
            loading={loading}
          >
            {t('trainerDashboard.refresh')}
          </Button>
        </Group>

        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : rows.length === 0 ? (
          <Card withBorder radius="md" padding="lg">
            <Text c="dimmed">{t('trainerDashboard.noClients')}</Text>
            <Button mt="md" variant="light" onClick={() => navigate('/clients')}>
              {t('nav.myClients')}
            </Button>
          </Card>
        ) : (
          <Stack gap="xl">
            <Box>
              <Group gap="xs" mb="sm">
                <Title order={3}>{t('trainerDashboard.needsAttention')}</Title>
                <Badge variant="light" color="orange">
                  {needsAttention.length}
                </Badge>
              </Group>

              {needsAttention.length === 0 ? (
                <Card withBorder radius="md" padding="lg">
                  <Text c="dimmed">{t('trainerDashboard.allQuiet')}</Text>
                </Card>
              ) : (
                <Stack gap="sm">
                  {needsAttention.map((row) => (
                    <ClientAlertCard
                      key={row.clientId}
                      row={row}
                      onOpen={openClient}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {quiet.length > 0 && (
              <Box>
                <Button
                  variant="subtle"
                  leftSection={<IconChevronDown size={16} />}
                  onClick={() => setQuietOpen((open) => !open)}
                >
                  {t('trainerDashboard.quietCount', { count: quiet.length })}
                </Button>
                <Collapse in={quietOpen}>
                  <Stack gap="sm" mt="sm">
                    {quiet.map((row) => (
                      <ClientAlertCard
                        key={row.clientId}
                        row={row}
                        onOpen={openClient}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            )}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
}
