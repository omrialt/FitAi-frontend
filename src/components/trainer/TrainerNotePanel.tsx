import { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea, Group, Text, Badge, Loader } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import trainerNoteService from '../../services/trainer-note.service';

interface TrainerNotePanelProps {
  clientId: string;
}

/**
 * The trainer's private note about this client.
 *
 * The "private" badge is not decoration. This is the first place in the app
 * where one user writes about another rather than to them, and a coach who is
 * unsure who can read it will either write nothing useful or write something
 * they would regret — so the answer is on screen, next to the box, before they
 * start typing.
 *
 * Saved on blur rather than behind a button: a note is a scratchpad, and a
 * scratchpad that loses what you typed because you clicked away is worse than
 * no scratchpad.
 */
export function TrainerNotePanel({ clientId }: TrainerNotePanelProps) {
  const { t } = useTranslation();

  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // What the server is known to hold, so blurring without typing saves nothing.
  const savedRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const note = await trainerNoteService.get(clientId);
        if (cancelled) return;
        setBody(note?.body ?? '');
        savedRef.current = note?.body ?? '';
      } catch {
        if (!cancelled) toast.error(t('trainerNote.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, t]);

  const save = useCallback(async () => {
    if (body === savedRef.current) return;

    setSaving(true);
    try {
      await trainerNoteService.save(clientId, body);
      savedRef.current = body;
      toast.success(t('trainerNote.saved'));
    } catch {
      // The text stays in the box — nothing the trainer typed is discarded
      // because a request failed.
      toast.error(t('trainerNote.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [body, clientId, t]);

  return (
    <div>
      <Group gap="xs" mb="xs">
        <Badge
          color="gray"
          variant="light"
          leftSection={<IconLock size={12} />}
        >
          {t('trainerNote.privateBadge')}
        </Badge>
        {saving && <Loader size="xs" />}
      </Group>

      <Text size="xs" c="dimmed" mb="xs">
        {t('trainerNote.privateExplainer')}
      </Text>

      {loading ? (
        <Loader size="sm" />
      ) : (
        <Textarea
          autosize
          minRows={4}
          maxRows={12}
          maxLength={5000}
          value={body}
          onChange={(event) => setBody(event.currentTarget.value)}
          onBlur={save}
          placeholder={t('trainerNote.placeholder')}
          aria-label={t('trainerNote.privateBadge')}
        />
      )}
    </div>
  );
}
