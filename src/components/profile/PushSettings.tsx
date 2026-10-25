import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@mantine/core';
import { toast } from 'sonner';
import { isNativeApp } from '../../config/platform';
import {
  getPushPrefs,
  isPushConfigured,
  setPushPrefs,
  type PushKind,
  type PushPrefs,
} from '../../services/push';

const KINDS: PushKind[] = ['messages', 'plans', 'connections'];

/**
 * Which push notifications this user wants, in the app only. The switches
 * live on the account (the server checks them before every send), so they
 * follow the user to another phone.
 */
export function PushSettings() {
  const { t } = useTranslation();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [prefs, setPrefs] = useState<PushPrefs | null>(null);

  useEffect(() => {
    if (!isNativeApp) return;
    let cancelled = false;
    void isPushConfigured().then((ok) => {
      if (cancelled) return;
      setConfigured(ok);
      if (ok) {
        getPushPrefs()
          .then((p) => !cancelled && setPrefs(p))
          .catch(() => !cancelled && setPrefs(null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isNativeApp || configured === null) return null;

  const toggle = async (kind: PushKind, on: boolean) => {
    const previous = prefs;
    setPrefs((p) => (p ? { ...p, [kind]: on } : p));
    try {
      setPrefs(await setPushPrefs({ [kind]: on }));
    } catch {
      setPrefs(previous);
      toast.error(t('push.saveFailed'));
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-ghost bg-surface-container-lowest p-6">
      <h2 className="text-lg font-bold text-on-surface">{t('push.title')}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        {configured ? t('push.subtitle') : t('push.notConfigured')}
      </p>

      {configured && prefs && (
        <div className="mt-5 flex flex-col gap-4">
          {KINDS.map((kind) => (
            <Switch
              key={kind}
              checked={prefs[kind]}
              onChange={(e) => void toggle(kind, e.currentTarget.checked)}
              label={t(`push.kind.${kind}`)}
              description={t(`push.kindHint.${kind}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
