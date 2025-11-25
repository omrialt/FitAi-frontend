/**
 * TrainingsBreadcrumbs - Breadcrumb navigation
 */

import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function TrainingsBreadcrumbs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Breadcrumbs mb="md">
      <Anchor component={Link} to="/">
        Home
      </Anchor>
      <span>{isAdmin ? 'Training Plans' : 'My Trainings'}</span>
    </Breadcrumbs>
  );
}
