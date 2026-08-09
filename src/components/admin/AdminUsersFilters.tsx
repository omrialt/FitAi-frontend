/**
 * AdminUsersFilters — name search and role filter.
 *
 * The role filter is a segmented pill row rather than a <select>, per screen 20.
 * There are exactly four roles and they never grow, so a dropdown hid a
 * four-way choice behind a tap and gave no indication of which filter was
 * active without opening it. The pills are ≥40px tall inside a 48px rail,
 * matching the design's touch-target floor.
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

  const active = roleFilter || "";

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/10">
      <div className="flex flex-col gap-4">
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

        {/* Role — segmented pills */}
        <div
          role="group"
          aria-label={t("admin.filterByRole")}
          className="flex gap-1 rounded-pill border border-outline-variant bg-surface-container-low p-1"
        >
          {roles.map((r) => {
            const selected = active === r.value;
            return (
              <button
                key={r.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRoleFilter(r.value || null)}
                className={`flex-1 min-h-10 grid place-items-center rounded-pill px-3 text-xs transition-colors ${
                  selected
                    ? 'bg-surface-container-highest font-bold text-on-surface'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
