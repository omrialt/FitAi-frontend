import { SimpleGrid, Button, Paper } from '@mantine/core';
import {
  IconBarbell,
  IconApple,
  IconScale,
  IconCalendar,
  IconBrain,
  IconUser,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function QuickActions() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    {
      id: 'myTrainings',
      label: t('nav.myTrainings'),
      icon: <IconBarbell size={18} />,
      color: 'indigo',
      path: '/my-trainings',
    },
    {
      id: 'nutritionPlans',
      label: t('nav.nutritionPlans'),
      icon: <IconApple size={18} />,
      color: 'green',
      path: '/nutrition-plans',
    },
    {
      id: 'physicalData',
      label: t('nav.physicalData'),
      icon: <IconScale size={18} />,
      color: 'cyan',
      path: '/physical-data',
    },
    {
      id: 'schedule',
      label: t('nav.schedule'),
      icon: <IconCalendar size={18} />,
      color: 'blue',
      path: '/schedule',
    },
    {
      id: 'aiInsights',
      label: t('dashboard.aiInsights'),
      icon: <IconBrain size={18} />,
      color: 'violet',
      path: '/',
    },
    {
      id: 'profile',
      label: t('layout.profile'),
      icon: <IconUser size={18} />,
      color: 'gray',
      path: '/profile',
    },
  ];

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="sm">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="light"
            color={action.color}
            leftSection={action.icon}
            size="sm"
            fullWidth
            className="dashboard-quick-action"
            onClick={() => navigate(action.path)}
          >
            {action.label}
          </Button>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
