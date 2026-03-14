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

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'My Trainings',
      icon: <IconBarbell size={18} />,
      color: 'indigo',
      path: '/my-trainings',
    },
    {
      label: 'Nutrition Plans',
      icon: <IconApple size={18} />,
      color: 'green',
      path: '/nutrition-plans',
    },
    {
      label: 'Physical Data',
      icon: <IconScale size={18} />,
      color: 'cyan',
      path: '/physical-data',
    },
    {
      label: 'Schedule',
      icon: <IconCalendar size={18} />,
      color: 'blue',
      path: '/schedule',
    },
    {
      label: 'AI Insights',
      icon: <IconBrain size={18} />,
      color: 'violet',
      path: '/',
    },
    {
      label: 'Profile',
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
            key={action.label}
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
