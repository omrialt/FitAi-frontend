import { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea, Group, Text, Badge, Loader, Button } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import trainerNoteService from '../../services/trainer-note.service';

interface TrainerNotePanelProps {
  clientId: string;
}

/** How long typing has to pause before the note saves itself. */
export const AUTOSAVE_DELAY_MS = 1500;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

/**
 * The trainer's private note about this client.
 *
 * The "private" badge is not decoration. This is the first place in the app
 * where one user writes about another rather than to them, and a coach who is
 * unsure who can read it will either write nothing useful or write something
 * they would regret — so the answer is on screen, next to the box, before they
 * start typing.
 *
 * Saving (N-36). It used to save on blur only and say so with a toast. In the
 * demo, the first note typed was gone after a refresh: nothing guarantees a
 * blur before the page goes away, and a toast that vanishes in a second
 * cannot be checked afterwards. Now:
 *
 *   - it saves itself a moment after typing stops, on blur, when the tab is
 *     hidden and when the panel unmounts — every way of leaving is a save;
 *   - closing the page with unsaved text asks first;
 *   - the state is a line that stays on screen ("Saved · 14:32", "Unsaved
 *     changes", "Not saved"), next to an explicit Save button for anyone who
 *     wants to press one.
 *
 * And the loader no longer depends on `t`: it rebuilt the box from the server
 * whenever the translation function changed identity, which would replace
 * whatever was being typed with the last saved version.
 */
export function TrainerNotePanel({ clientId }: TrainerNotePanelProps) {
  const { t, i18n } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;

  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // What the server is known to hold, so leaving without typing saves nothing.
  const savedRef = useRef('');
  // The latest text, for saves that run outside a render (timer, unmount).
  const bodyRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Saves run one at a time, in order, so an older body can never land on the
  // server after a newer one.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const mountedRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const note = await trainerNoteService.get(clientId);
        if (cancelled) return;
        const text = note?.body ?? '';
        setBody(text);
        bodyRef.current = text;
        savedRef.current = text;
        setSavedAt(note ? new Date(note.updatedAt) : null);
        setState(note ? 'saved' : 'idle');
      } catch {
        if (!cancelled) toast.error(tRef.current('trainerNote.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const save = useCallback((): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    queueRef.current = queueRef.current.then(async () => {
      const text = bodyRef.current;
      if (text === savedRef.current) return;

      if (mountedRef.current) setState('saving');
      try {
        const note = await trainerNoteService.save(clientId, text);
        savedRef.current = text;
        if (!mountedRef.current) return;
        setSavedAt(note?.updatedAt ? new Date(note.updatedAt) : new Date());
        // Typing may have carried on while the request was out.
        setState(bodyRef.current === text ? 'saved' : 'dirty');
      } catch {
        // The text stays in the box — nothing the trainer typed is discarded
        // because a request failed.
        if (!mountedRef.current) return;
        setState('error');
        toast.error(tRef.current('trainerNote.saveFailed'));
      }
    });
    return queueRef.current;
  }, [clientId]);

  const onChange = (text: string) => {
    setBody(text);
    bodyRef.current = text;
    setState(text === savedRef.current ? 'saved' : 'dirty');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void save();
    }, AUTOSAVE_DELAY_MS);
  };

  // Every way of leaving is a save: hiding the tab, and unmounting the panel
  // (another client, another page). Closing the page while text is unsaved
  // asks first — the one exit a request cannot be relied on to survive.
  useEffect(() => {
    mountedRef.current = true;

    const onHidden = () => {
      if (document.visibilityState === 'hidden') void save();
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bodyRef.current !== savedRef.current) {
        void save();
        event.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('beforeunload', onBeforeUnload);
      mountedRef.current = false;
      void save();
    };
  }, [save]);

  const time = savedAt?.toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const status =
    state === 'saving'
      ? t('trainerNote.status.saving')
      : state === 'dirty'
        ? t('trainerNote.status.unsaved')
        : state === 'error'
          ? t('trainerNote.status.failed')
          : state === 'saved' && time
            ? t('trainerNote.status.savedAt', { time })
            : null;

  return (
    <div>
      <Group gap="xs" mb="xs" wrap="wrap">
        <Badge
          color="gray"
          variant="light"
          leftSection={<IconLock size={12} />}
        >
          {t('trainerNote.privateBadge')}
        </Badge>
        {state === 'saving' && <Loader size="xs" />}
        {status && (
          <Text
            size="xs"
            c={state === 'error' ? 'red' : 'dimmed'}
            role="status"
            aria-live="polite"
          >
            {status}
          </Text>
        )}
      </Group>

      <Text size="xs" c="dimmed" mb="xs">
        {t('trainerNote.privateExplainer')}
      </Text>

      {loading ? (
        <Loader size="sm" />
      ) : (
        <>
          <Textarea
            autosize
            minRows={4}
            maxRows={12}
            maxLength={5000}
            value={body}
            onChange={(event) => onChange(event.currentTarget.value)}
            onBlur={() => void save()}
            placeholder={t('trainerNote.placeholder')}
            aria-label={t('trainerNote.privateBadge')}
          />
          <Group justify="flex-end" mt="xs">
            <Button
              size="xs"
              variant={state === 'error' ? 'filled' : 'light'}
              color={state === 'error' ? 'red' : undefined}
              onClick={() => void save()}
              disabled={state !== 'dirty' && state !== 'error'}
              loading={state === 'saving'}
            >
              {state === 'error' ? t('trainerNote.retry') : t('common.save')}
            </Button>
          </Group>
        </>
      )}
    </div>
  );
}
