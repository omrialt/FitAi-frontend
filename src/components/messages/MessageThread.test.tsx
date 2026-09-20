import { describe, it, expect, vi } from 'vitest';
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { MessageThread } from './MessageThread';
import type { Message } from '../../types/message.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

const render = (ui: React.ReactElement) =>
  rtlRender(<MantineProvider>{ui}</MantineProvider>);

const ME = 'me-1';
const THEM = 'them-1';

const message = (over: Partial<Message> = {}): Message => ({
  _id: Math.random().toString(36).slice(2),
  trainerId: ME,
  clientId: THEM,
  senderId: ME,
  body: 'hello',
  readAt: null,
  createdAt: '2026-09-20T10:00:00.000Z',
  updatedAt: '2026-09-20T10:00:00.000Z',
  ...over,
});

describe('MessageThread', () => {
  it('renders both sides of the conversation', () => {
    render(
      <MessageThread
        currentUserId={ME}
        messages={[
          message({ body: 'how did it go?' }),
          message({ senderId: THEM, body: 'knee still hurts' }),
        ]}
        onSend={async () => true}
      />,
    );

    expect(screen.getByText('how did it go?')).toBeInTheDocument();
    expect(screen.getByText('knee still hurts')).toBeInTheDocument();
  });

  it('says so when the conversation has not started', () => {
    render(
      <MessageThread currentUserId={ME} messages={[]} onSend={async () => true} />,
    );

    expect(screen.getByText('messages.emptyThread')).toBeInTheDocument();
  });

  it('will not send an empty or whitespace-only message', async () => {
    const onSend = vi.fn().mockResolvedValue(true);
    render(
      <MessageThread currentUserId={ME} messages={[]} onSend={onSend} />,
    );

    const send = screen.getByText('messages.send').closest('button')!;
    expect(send).toBeDisabled();

    fireEvent.change(screen.getByLabelText('messages.placeholder'), {
      target: { value: '   ' },
    });
    expect(send).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears the box once the message is sent', async () => {
    const onSend = vi.fn().mockResolvedValue(true);
    render(<MessageThread currentUserId={ME} messages={[]} onSend={onSend} />);

    const box = screen.getByLabelText('messages.placeholder');
    fireEvent.change(box, { target: { value: '  see you monday  ' } });
    fireEvent.click(screen.getByText('messages.send'));

    // Trimmed on the way out — trailing spaces are not part of the message.
    await waitFor(() => expect(onSend).toHaveBeenCalledWith('see you monday'));
    await waitFor(() => expect(box).toHaveValue(''));
  });

  /**
   * The retry story, and the reason there is no optimistic bubble: a failed
   * send must not take the user's words with it.
   */
  it('keeps the text in the box when the send fails', async () => {
    const onSend = vi.fn().mockResolvedValue(false);
    render(<MessageThread currentUserId={ME} messages={[]} onSend={onSend} />);

    const box = screen.getByLabelText('messages.placeholder');
    fireEvent.change(box, { target: { value: 'important instruction' } });
    fireEvent.click(screen.getByText('messages.send'));

    await waitFor(() => expect(onSend).toHaveBeenCalled());
    expect(box).toHaveValue('important instruction');
  });
});
