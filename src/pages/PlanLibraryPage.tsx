import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Card,
  Badge,
  Modal,
  Select,
  TextInput,
  Loader,
  Center,
  Box,
} from '@mantine/core';
import { IconTemplate, IconUsersPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AppLayout } from '../components/AppLayout';
import { AssignPlanModal } from '../components/trainer/AssignPlanModal';
import { trainingPlanService } from '../services/training-plan.service';
import { useAuthStore } from '../store/authStore';
import type { TrainingPlan } from '../types/training-plan.types';

/**
 * The trainer's plan library: patterns they wrote once and hand out many times.
 *
 * A template is a copy of a plan, never the plan itself with a flag flipped —
 * the programme a client is training right now must not stop being theirs
 * because their coach decided it was a good pattern. So this page's two verbs
 * are "copy a plan in here" and "copy it out to these clients".
 */
export default function PlanLibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [templates, setTemplates] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignTarget, setAssignTarget] = useState<TrainingPlan | null>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [sourcePlanId, setSourcePlanId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTemplates(await trainingPlanService.getLibrary());
    } catch {
      toast.error(t('planLibrary.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openSave = useCallback(async () => {
    setSourcePlanId(null);
    setNewTitle('');
    setSaveOpen(true);
    try {
      // Their own plans (and anything shared with them). Templates are
      // excluded by the server, so the picker never offers a template as the
      // source for another template.
      setPlans(
        user?._id
          ? await trainingPlanService.getByUserWithShared(user._id)
          : [],
      );
    } catch {
      toast.error(t('planLibrary.loadPlansFailed'));
    }
  }, [t, user?._id]);

  const handleSave = useCallback(async () => {
    if (!sourcePlanId) return;

    setSaving(true);
    try {
      await trainingPlanService.saveAsTemplate(
        sourcePlanId,
        newTitle.trim() || undefined,
      );
      toast.success(t('planLibrary.saved'));
      setSaveOpen(false);
      await load();
    } catch {
      toast.error(t('planLibrary.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [sourcePlanId, newTitle, t, load]);

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box>
            <Title order={1}>{t('planLibrary.pageTitle')}</Title>
            <Text c="dimmed" mt={4}>
              {t('planLibrary.pageSubtitle')}
            </Text>
          </Box>
          <Button
            leftSection={<IconTemplate size={18} />}
            onClick={openSave}
          >
            {t('planLibrary.saveAsTemplate')}
          </Button>
        </Group>

        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : templates.length === 0 ? (
          <Card withBorder radius="md" padding="lg">
            <Text c="dimmed">{t('planLibrary.empty')}</Text>
          </Card>
        ) : (
          <Stack gap="sm">
            {templates.map((template) => (
              <Card key={template._id} withBorder radius="md" padding="md">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} truncate>
                      {template.title}
                    </Text>
                    <Text size="sm" c="dimmed" truncate>
                      {template.description}
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Badge variant="light">
                        {t('common.dayCount', {
                          count: template.days?.length ?? 0,
                        })}
                      </Badge>
                      <Badge variant="light" color="gray">
                        {t(`common.${template.difficulty}`)}
                      </Badge>
                    </Group>
                  </Box>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => navigate(`/training-plans/${template._id}`)}
                    >
                      {t('common.view')}
                    </Button>
                    <Button
                      size="xs"
                      leftSection={<IconUsersPlus size={16} />}
                      onClick={() => setAssignTarget(template)}
                    >
                      {t('planLibrary.assign')}
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      <AssignPlanModal
        opened={assignTarget !== null}
        onClose={() => setAssignTarget(null)}
        templateId={assignTarget?._id ?? null}
        templateTitle={assignTarget?.title}
      />

      <Modal
        opened={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={t('planLibrary.saveAsTemplate')}
      >
        <Stack gap="md">
          <Select
            label={t('planLibrary.pickPlan')}
            placeholder={t('planLibrary.pickPlanPlaceholder')}
            data={plans.map((plan) => ({
              value: plan._id,
              label: plan.title,
            }))}
            value={sourcePlanId}
            onChange={setSourcePlanId}
            searchable
          />
          <TextInput
            label={t('planLibrary.templateTitle')}
            description={t('planLibrary.templateTitleHint')}
            value={newTitle}
            onChange={(event) => setNewTitle(event.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setSaveOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!sourcePlanId}
            >
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
