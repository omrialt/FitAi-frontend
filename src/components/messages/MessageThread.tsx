import { useEffect, useRef, useState } from 'react';
import {
  Stack,
  Group,
  Box,
  Text,
  Textarea,
  Button,
  ScrollArea,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../types/message.types';

export const MAX_MESSAGE_LENGTH = 2000;

interface MessageThreadProps {
  messages: Message[];
  /** The signed-in user's id — which side of the thread is "mine". */
  currentUserId: string;
  onSend: (body: string) => Promise<boolean>;
  disabled?: boolean;
}

/**
 * One conversation: the messages, and the box to add to it.
 *
 * The composer keeps its text when a send fails. That is the whole retry
 * story, and it is deliberate — an optimistic bubble that quietly disappears
 * on a dropped connection loses something the user typed, while a box that
 * still holds their words loses nothing and needs no extra UI to explain
 * itself.
 *
 * Bodies are rendered as text. The backend stores them as text and nothing
 * here parses markup, so a message is never a way to put markup on someone
 * else's screen.
 */
export function MessageThread({
  messages,
  currentUserId,
  onSend,
  disabled,
}: MessageThreadProps) {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Follow the conversation, but only when it grows — re-scrolling on every
  // render would fight the user trying to read further up.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    const ok = await onSend(body);
    setSending(false);
    if (ok) setDraft('');
  };

  return (
    <Stack gap="sm" h="100%">
      <ScrollArea.Autosize mah={460} type="auto">
        <Stack gap="xs" p="xs">
          {messages.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="lg">
              {t('messages.emptyThread')}
            </Text>
          ) : (
            messages.map((message) => {
              const mine = message.senderId === currentUserId;
              return (
                <Group
                  key={message._id}
                  justify={mine ? 'flex-end' : 'flex-start'}
                  wrap="nowrap"
                >
                  <Box
                    px="sm"
                    py={6}
                    style={{
                      maxWidth: '80%',
                      borderRadius: 12,
                      background: mine
                        ? 'var(--mantine-color-indigo-light)'
                        : 'var(--mantine-color-default-hover)',
                    }}
                  >
                    <Text
                      size="sm"
                      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {message.body}
                    </Text>
                    <Text size="10px" c="dimmed" mt={2}>
                      {new Date(message.createdAt).toLocaleString(
                        i18n.language,
                        { dateStyle: 'short', timeStyle: 'short' },
                      )}
                    </Text>
                  </Box>
                </Group>
              );
            })
          )}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea.Autosize>

      <Group gap="xs" wrap="nowrap" align="flex-end">
        <Textarea
          flex={1}
          autosize
          minRows={1}
          maxRows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder={t('messages.placeholder')}
          aria-label={t('messages.placeholder')}
        />
        <Button
          onClick={handleSend}
          loading={sending}
          disabled={disabled || draft.trim().length === 0}
          leftSection={<IconSend size={16} />}
        >
          {t('messages.send')}
        </Button>
      </Group>
    </Stack>
  );
}
