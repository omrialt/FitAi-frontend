import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { coachService } from '../../services/coach.service';
import type { ChatTurn } from '../../types/coach.types';

/**
 * Questions about your own training, answered from your own numbers.
 *
 * The transcript lives in this component's state and nowhere else — not on the
 * server, not in localStorage, not in the offline queue. A chat log about
 * somebody's body, weight and habits is a new category of personal data, and
 * this feature does not earn a collection that would then need export,
 * deletion and a retention answer. It is re-sent with each question and lost on
 * reload, which is a real cost and the right trade.
 *
 * `grounded_in` is rendered rather than hidden. It is what makes a wrong answer
 * detectable instead of merely confident: a reply citing "adherence 75%" can be
 * checked against the dashboard, and a reply citing nothing is visibly citing
 * nothing.
 */

const MAX_LENGTH = 500;

export function CoachChat({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [citations, setCitations] = useState<Record<number, string[]>>({});
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  if (!enabled) return null;

  const send = async () => {
    const text = question.trim();
    if (!text || asking) return;

    // The question is added optimistically, but the history sent to the server
    // is the one *before* it — the question travels in its own field, and
    // including it twice would have the model answer it as a repeat.
    const history = turns;
    setTurns([...turns, { role: 'user', content: text }]);
    setQuestion('');
    setAsking(true);
    setError(null);

    try {
      const reply = await coachService.ask(text, history);

      setTurns((current) => {
        const next: ChatTurn[] = [
          ...current,
          { role: 'assistant', content: reply.answer },
        ];
        setCitations((c) => ({ ...c, [next.length - 1]: reply.grounded_in }));
        return next;
      });
    } catch {
      setError(t('coach.chatFailed'));
      // The question stays on screen. Dropping it would make a failed request
      // look like it was never sent.
    } finally {
      setAsking(false);
    }
  };

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name="psychology" size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('coach.chatTitle')}
        </h2>
      </header>

      <p className="mb-4 text-xs text-on-surface-variant">
        {t('coach.chatSubtitle')}
      </p>

      {turns.length === 0 && (
        <p className="mb-4 text-sm text-on-surface-variant">
          {t('coach.chatEmpty')}
        </p>
      )}

      <div className="mb-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={
              turn.role === 'user'
                ? 'self-end rounded-lg bg-primary/10 px-3 py-2 text-sm text-on-surface'
                : 'rounded-lg border border-outline-variant/20 px-3 py-2 text-sm text-on-surface'
            }
          >
            <p className="whitespace-pre-wrap">{turn.content}</p>

            {citations[index]?.length > 0 && (
              <p className="mt-2 text-[11px] text-on-surface-variant">
                {t('coach.groundedIn')}: {citations[index].join(' · ')}
              </p>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="mb-2 text-xs font-bold text-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(event) => {
            // Enter sends, shift+enter breaks the line. A question here is a
            // sentence, not a paragraph.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder={t('coach.chatPlaceholder')}
          aria-label={t('coach.chatTitle')}
          className="min-h-10 flex-1 resize-none rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface"
        />

        <button
          type="button"
          onClick={() => void send()}
          disabled={asking || question.trim().length < 2}
          className="min-h-10 rounded-lg bg-primary-gradient px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {asking ? t('coach.chatThinking') : t('coach.chatSend')}
        </button>
      </div>
    </section>
  );
}
