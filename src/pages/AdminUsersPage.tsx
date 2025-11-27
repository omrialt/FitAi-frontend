import { useState, useMemo, useEffect, useCallback, Activity } from "react";
import { Container, Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { useApi } from "../hooks/useApi";
import { AppLayout } from "../components/AppLayout";
import { useAuthStore } from "../store/authStore";
import { PaginationControls } from "../components/common/PaginationControls";
import type { User } from "../types/auth.types";
import {
  AdminUsersBreadcrumbs,
  AdminUsersHeader,
  AdminUsersTable,
  AdminUsersFilters,
  AdminUsersCardList,
  AdminUserViewModal,
} from "../components/admin";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  // Filters state
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const debouncedName = useDebounce(nameFilter, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API hook
  const {
    data: usersData,
    loading: isLoading,
    execute: fetchUsers,
  } = useApi<{ data: { items: User[]; total: number } }>();

  // Modal state
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Only allow admins
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch users from API
  useEffect(() => {
    const params = new URLSearchParams();
    if (roleFilter) params.append("role", roleFilter);
    if (debouncedName) params.append("name", debouncedName);
    params.append("page", String(currentPage));
    params.append("limit", String(pageSize));
    fetchUsers(`/admin/users?${params.toString()}`);
  }, [roleFilter, debouncedName, currentPage, pageSize, fetchUsers]);

  const total = usersData?.data?.total || 0;

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const paginatedUsers = useMemo(() => {
    return usersData?.data?.items || [];
  }, [usersData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, debouncedName]);

  // Handlers
  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setViewModalOpened(true);
  }, []);

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <AdminUsersBreadcrumbs />
        <AdminUsersHeader />
        <AdminUsersFilters
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />

        <Box pos="relative">
          {/* Loading State */}
          {isLoading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              <Activity mode={isMobile ? "visible" : "hidden"}>
                <AdminUsersCardList
                  users={paginatedUsers}
                  onView={handleView}
                />
              </Activity>
              <Activity mode={!isMobile ? "visible" : "hidden"}>
                <AdminUsersTable users={paginatedUsers} onView={handleView} />
              </Activity>
            </>
          )}
        </Box>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        <AdminUserViewModal
          opened={viewModalOpened}
          onClose={() => setViewModalOpened(false)}
          user={selectedUser}
        />
      </Container>
    </AppLayout>
  );
}
