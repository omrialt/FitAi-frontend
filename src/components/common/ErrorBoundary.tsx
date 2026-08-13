import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors so a broken component does not blank the whole app.
 *
 * Without one, any exception thrown during render unmounts the entire React
 * tree and leaves an empty white page — no message, no navigation, nothing in
 * the UI to say what happened. The user's only clue is that the app vanished,
 * and the only record is a console message they will never look at.
 *
 * Deliberately a class component: `componentDidCatch` has no hook equivalent,
 * and this is the one place React still requires one.
 *
 * It does not use `useTranslation`, for the same reason it keeps its markup to
 * plain elements — this renders precisely when something has already gone
 * wrong, so it must not depend on context providers that might be part of the
 * failure. The strings are therefore in both languages at once rather than
 * translated.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept as console.error on purpose: there is no error-reporting service
    // wired up (that is the vendor half of N-02, deliberately not adopted), so
    // the browser console and the user's screenshot are the record. Logging
    // the component stack is what makes that record usable — the message alone
    // rarely says which component threw.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.assign('/');
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          // Inline styles rather than classes: if the failure is in the
          // stylesheet or the theme provider, class names may resolve to
          // nothing and this screen would be invisible too.
          background: 'var(--color-background, #0d0e12)',
          color: 'var(--color-on-surface, #e6e6ea)',
          fontFamily: 'Heebo, Rubik, ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          משהו נשבר · Something went wrong
        </h1>
        <p style={{ margin: 0, opacity: 0.8, maxWidth: '38rem' }}>
          הדף נתקל בשגיאה בלתי צפויה. ניתן לרענן ולנסות שוב.
          <br />
          This page hit an unexpected error. Reloading usually fixes it.
        </p>

        {/* The message, not the stack: enough for a useful bug report,
            without pasting internals onto the screen. */}
        <code
          style={{
            display: 'block',
            maxWidth: '38rem',
            overflowWrap: 'anywhere',
            fontSize: '0.8rem',
            opacity: 0.65,
          }}
        >
          {error.message}
        </code>

        <button
          type="button"
          onClick={this.handleReload}
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.4rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            background: 'var(--color-primary, #6063ee)',
            color: 'var(--color-on-primary, #ffffff)',
          }}
        >
          חזרה לדף הבית · Back to home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
