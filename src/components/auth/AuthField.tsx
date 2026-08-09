import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon, type StitchIconName } from '../common/StitchIcon';

/**
 * Auth form primitives — "Performance Lab" design.
 *
 * The Stitch markup positions the leading glyph with `left-4` and pads with
 * `pl-12`. Both are physical directions, which would strand the icon on the
 * wrong side in Hebrew, so the logical `start-4` / `ps-12` are used instead.
 */

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: StitchIconName;
  error?: string;
  /**
   * Informational note under the field — "locked · Google" and similar.
   * Distinct from `error` on purpose: the profile form used to pass that note
   * *as* an error, so a neutral fact about where the value came from rendered
   * in danger red.
   */
  hint?: string;
  /** Optional control rendered opposite the label (e.g. "Forgot?"). */
  action?: React.ReactNode;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, icon, error, hint, action, id, type = 'text', ...rest }, ref) {
    const { t } = useTranslation();
    const [revealed, setRevealed] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && revealed ? 'text' : type;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mx-1">
          <label
            className="text-[11.5px] font-bold text-on-surface-variant"
            htmlFor={id}
          >
            {label}
          </label>
          {action}
        </div>

        <div className="relative group">
          <span className="absolute start-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">
            <StitchIcon name={icon} size={20} />
          </span>

          <input
            {...rest}
            ref={ref}
            id={id}
            type={inputType}
            aria-invalid={error ? true : undefined}
            className={`h-12 w-full ps-12 ${isPassword ? 'pe-12' : 'pe-4'} rounded-lg outline-none transition-all text-sm placeholder:text-outline/60 border ${
              rest.disabled
                ? 'bg-surface border-outline-variant/40 text-on-surface-variant cursor-not-allowed'
                : 'bg-surface-container-lowest text-on-surface'
            } ${
              error
                ? 'border-danger focus:ring-[3px] focus:ring-danger/20'
                : rest.disabled
                  ? ''
                  : 'border-outline-variant focus:border-primary focus:ring-[3px] focus:ring-primary/20'
            }`}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={t(revealed ? 'auth.hidePassword' : 'auth.showPassword')}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <StitchIcon name="visibility" size={20} />
            </button>
          )}
        </div>

        {error && <p className="text-[11.5px] text-danger mx-1">{error}</p>}
        {!error && hint && (
          <p className="mx-1 font-mono text-[10.5px] text-on-surface-variant">{hint}</p>
        )}
      </div>
    );
  },
);

interface AuthSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon: StitchIconName;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

/**
 * Select styled to match AuthField. A native <select> is used rather than
 * Mantine's so the auth forms share one visual language; it also keeps the
 * mobile experience native.
 */
export const AuthSelect = forwardRef<HTMLSelectElement, AuthSelectProps>(
  function AuthSelect(
    { label, icon, error, placeholder, options, id, ...rest },
    ref,
  ) {
    return (
      <div className="space-y-2">
        <label
          className="text-[11.5px] font-bold text-on-surface-variant mx-1 block"
          htmlFor={id}
        >
          {label}
        </label>

        <div className="relative group">
          <span className="absolute start-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">
            <StitchIcon name={icon} size={20} />
          </span>

          <select
            {...rest}
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            className={`h-12 w-full ps-12 pe-10 bg-surface-container-lowest rounded-lg outline-none transition-all text-sm text-on-surface appearance-none border ${
              error
                ? 'border-danger focus:ring-[3px] focus:ring-danger/20'
                : 'border-outline-variant focus:border-primary focus:ring-[3px] focus:ring-primary/20'
            }`}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="expand_more" size={18} />
          </span>
        </div>

        {error && <p className="text-[11.5px] text-danger mx-1">{error}</p>}
      </div>
    );
  },
);

/** Full-width primary submit button. */
export function AuthSubmit({
  children,
  loading,
  ...rest
}: InputHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      type="submit"
      disabled={loading || rest.disabled}
      className="grid h-[52px] w-full place-items-center bg-primary-gradient text-white rounded-lg text-[15px] font-extrabold shadow-lg shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}

/** "Continue with Google" button, including the multi-colour mark. */
export function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-center gap-3 px-4 bg-surface-container-highest border border-outline-variant rounded-lg text-[14.5px] font-bold text-on-surface hover:bg-surface-container-high transition-all active:scale-[0.98]"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}

/** "or email" rule between the OAuth button and the credential form. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center py-2">
      <div className="grow border-t border-outline-variant/30" />
      <span className="shrink mx-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-on-surface-variant whitespace-nowrap">
        {label}
      </span>
      <div className="grow border-t border-outline-variant/30" />
    </div>
  );
}
