/**
 * AdminUsersFilters - Filters section for users page
 */

import { Grid, Select, TextInput, Paper } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { AdminUsersFiltersProps } from '../../types/admin.types';

const ROLES = [
  { value: "", label: "All Roles" },
  { value: "user", label: "User" },
  { value: "trainer", label: "Trainer" },
  { value: "admin", label: "Admin" },
];

export function AdminUsersFilters({
  roleFilter,
  setRoleFilter,
  nameFilter,
  setNameFilter,
}: AdminUsersFiltersProps) {
  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg">
      <Grid gutter="md">
        {/* Search Input */}
        <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
          <TextInput
            placeholder="Search by name..."
            leftSection={<IconSearch size={16} />}
            value={nameFilter}
            onChange={(e) => setNameFilter(e.currentTarget.value)}
          />
        </Grid.Col>

        {/* Role Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
          <Select
            placeholder="Filter by Role"
            data={ROLES}
            value={roleFilter || ""}
            onChange={(v) => setRoleFilter(v || null)}
            clearable
          />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
