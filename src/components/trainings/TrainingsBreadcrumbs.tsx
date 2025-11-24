/**
 * TrainingsBreadcrumbs - Breadcrumb navigation
 */

import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

export function TrainingsBreadcrumbs() {
  return (
    <Breadcrumbs mb="md">
      <Anchor component={Link} to="/">
        Home
      </Anchor>
      <span>My Trainings</span>
    </Breadcrumbs>
  );
}
