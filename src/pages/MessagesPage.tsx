import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  Stack,
  Group,
  Title,
  Text,
  Avatar,
  Badge,
  Loader,
  Center,
  Box,
  UnstyledButton,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AppLayout } from '../components/AppLayout';
import { MessageThread } from '../components/messages/MessageThread';
import messageService from '../services/message.service';
import { useAuthStore } from '../store/authStore';
import { useUnreadMessagesStore } from '../store/unreadMessagesStore';
import type { Message, ThreadSummary } from '../types/message.types';

/** How often an open thread asks for what it has not seen. */
const POLL_MS = 15_000;

/**
 * Trainer↔client messaging.
 *
 * Polling, not sockets: the backend is a serverless function that is frozen
 * between requests, so there is no process to hold a connection open. Fifteen
 * seconds is the compromise — and the poll stops when the tab is hidden,
 * because a backend billed per invocation should not be woken by a tab nobody
 * is looking at.
 *
 * The known limitation, recorded rather than hidden: nothing notifies a user
 * who is not in the app. No email, no push. A client who does not open FitAi
 * will not learn that their trainer wrote.
 */
export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  // The nav badge lives in AppLayout, a different subtree — without this it
  // keeps claiming unread mail while the user is reading it.
  const refreshUnread = useUnreadMessagesStore((state) => state.refresh);

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  const selected = searchParams.get('with');
  // The poll reads this instead of `messages`, so the interval does not have
  // to be torn down and rebuilt on every incoming message.
  const newestRef = useRef<string | null>(null);

  const loadThreads = useCallback(async () => {
    try {
      setThreads(await messageService.getThreads());
    } catch {
      toast.error(t('messages.loadFailed'));
    } finally {
      setLoadingThreads(false);
    }
  }, [t]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // One conversation and no choice to make — open it.
  useEffect(() => {
    if (!selected && threads.length === 1) {
      setSearchParams({ with: threads[0].userId }, { replace: true });
    }
  }, [selected, threads, setSearchParams]);

  const openThread = useCallback(
    async (otherUserId: string) => {
      setLoadingThread(true);
      try {
        const thread = await messageService.getThread(otherUserId);
        setMessages(thread);
        newestRef.current = thread.at(-1)?.createdAt ?? null;
        await messageService.markRead(otherUserId);
        await Promise.all([loadThreads(), refreshUnread()]);
      } catch {
        toast.error(t('messages.loadFailed'));
        setMessages([]);
      } finally {
        setLoadingThread(false);
      }
    },
    [t, loadThreads, refreshUnread],
  );

  useEffect(() => {
    if (selected) {
      openThread(selected);
    } else {
      setMessages([]);
      newestRef.current = null;
    }
  }, [selected, openThread]);

  // The poll. Asks only for what arrived after the newest message on screen.
  useEffect(() => {
    if (!selected) return;

    const tick = async () => {
      if (document.hidden) return;
      try {
        const fresh = await messageService.getThread(
          selected,
          newestRef.current ?? undefined,
        );
        if (fresh.length === 0) return;

        setMessages((current) => [...current, ...fresh]);
        newestRef.current = fresh.at(-1)?.createdAt ?? newestRef.current;
        await messageService.markRead(selected);
        await Promise.all([loadThreads(), refreshUnread()]);
      } catch {
        // A failed poll is not worth a toast every fifteen seconds; the next
        // one will pick the messages up.
      }
    };

    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [selected, loadThreads, refreshUnread]);

  const handleSend = useCallback(
    async (body: string): Promise<boolean> => {
      if (!selected) return false;
      try {
        const sent = await messageService.send(selected, body);
        setMessages((current) => [...current, sent]);
        newestRef.current = sent.createdAt;
        await loadThreads();
        return true;
      } catch {
        toast.error(t('messages.sendFailed'));
        return false;
      }
    },
    [selected, t, loadThreads],
  );

  const active = useMemo(
    () => threads.find((thread) => thread.userId === selected) ?? null,
    [threads, selected],
  );

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <Title order={1} mb="xs">
          {t('messages.pageTitle')}
        </Title>
        <Text c="dimmed" mb="lg">
          {t('messages.pageSubtitle')}
        </Text>

        {loadingThreads ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : threads.length === 0 ? (
          <Card withBorder radius="md" padding="lg">
            <Text c="dimmed">{t('messages.noThreads')}</Text>
          </Card>
        ) : (
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Stack gap="xs">
                {threads.map((thread) => (
                  <UnstyledButton
                    key={thread.userId}
                    onClick={() => setSearchParams({ with: thread.userId })}
                  >
                    <Card
                      withBorder
                      radius="md"
                      padding="sm"
                      bg={
                        thread.userId === selected
                          ? 'var(--mantine-color-default-hover)'
                          : undefined
                      }
                    >
                      <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
                        <Avatar
                          src={thread.avatarUrl ?? undefined}
                          radius="xl"
                          color="indigo"
                        >
                          {thread.fullName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box style={{ minWidth: 0, flex: 1 }}>
                          <Group gap="xs" wrap="nowrap" justify="space-between">
                            <Text fw={600} truncate>
                              {thread.fullName}
                            </Text>
                            {thread.unread > 0 && (
                              <Badge size="sm" color="indigo">
                                {thread.unread}
                              </Badge>
                            )}
                          </Group>
                          <Text size="xs" c="dimmed" truncate>
                            {thread.lastMessage?.body ??
                              t('messages.noneYet')}
                          </Text>
                        </Box>
                      </Group>
                    </Card>
                  </UnstyledButton>
                ))}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Card withBorder radius="md" padding="md">
                {!selected ? (
                  <Text c="dimmed">{t('messages.pickThread')}</Text>
                ) : loadingThread ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  <Stack gap="sm">
                    <Text fw={700}>{active?.fullName}</Text>
                    <MessageThread
                      messages={messages}
                      currentUserId={user?._id ?? ''}
                      onSend={handleSend}
                    />
                  </Stack>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        )}
      </Container>
    </AppLayout>
  );
}
