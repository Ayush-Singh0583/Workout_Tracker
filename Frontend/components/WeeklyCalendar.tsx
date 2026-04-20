'use client';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCHEDULE: Record<number, string> = { 1: 'PUSH', 2: 'PULL', 3: 'LEGS', 4: 'REST', 5: 'PUSH', 6: 'PULL', 0: 'REST' };

interface Props {
  sessions: Array<{ date: string | Date; template?: { type?: string } | null; completed: boolean }>;
}

export function WeeklyCalendar({ sessions }: Props) {
  const today = new Date();
  const todayDow = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((todayDow + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const sessionDates = new Set(
    sessions.map((s) => new Date(s.date).toDateString()),
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-400">
        This Week
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {week.map((day, i) => {
          const dow = day.getDay();
          const type = SCHEDULE[dow];
          const isToday = day.toDateString() === today.toDateString();
          const isDone = sessionDates.has(day.toDateString());
          const isPast = day < today && !isToday;

          return (
            <div
              key={i}
              className={`rounded-lg p-2 text-center border transition-colors ${
                isToday
                  ? 'border-amber-400 bg-amber-400/10'
                  : isDone
                  ? 'border-green-500/40 bg-green-500/10'
                  : isPast && type !== 'REST'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-zinc-800 bg-zinc-800/40'
              }`}
            >
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {DAYS[i]}
              </div>
              <div
                className={`text-xs font-bold mt-1 ${
                  isToday
                    ? 'text-amber-400'
                    : isDone
                    ? 'text-green-400'
                    : type === 'REST'
                    ? 'text-zinc-600'
                    : 'text-zinc-300'
                }`}
              >
                {isDone ? '✓' : type.slice(0, 1) + type.slice(1, 3).toLowerCase()}
              </div>
              <div className="text-[9px] text-zinc-600 mt-0.5">{day.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}   