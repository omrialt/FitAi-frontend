/**
 * AdminUsersFilters — name search and role filter.
 * "Performance Lab" design.
 */

import { useTranslation } from "react-i18next";

import { StitchIcon } from "../common/StitchIcon";
import type { AdminUsersFiltersProps } from '../../types/admin.types';

const CONTROL =
  'w-full py-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-on-surface';

export function AdminUsersFilters({
  roleFilter,
  setRoleFilter,
  nameFilter,
  setNameFilter,
}: AdminUsersFiltersProps) {
  const { t } = useTranslation();

  const roles = [
    { value: "", label: t("admin.allRoles") },
    { value: "user", label: t("admin.role_user") },
    { value: "trainer", label: t("admin.role_trainer") },
    { value: "admin", label: t("admin.role_admin") },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name search */}
        <div className="relative">
          <input
            type="search"
            className={`${CONTROL} ps-4 pe-11`}
            placeholder={t("admin.searchByName")}
            value={nameFilter}
            onChange={(e) => setNameFilter(e.currentTarget.value)}
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="search" size={18} />
          </span>
        </div>

        {/* Role */}
        <div className="relative">
          <select
            className={`${CONTROL} ps-4 pe-10 appearance-none`}
            value={roleFilter || ""}
            onChange={(e) => setRoleFilter(e.target.value || null)}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="expand_more" size={18} />
          </span>
        </div>
      </div>
    </section>
  );
}
