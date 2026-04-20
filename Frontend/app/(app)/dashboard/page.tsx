'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { useWeeklyStats, usePersonalRecords, useOverloadSuggestions } from '../../../hooks/useWorkout';
import { statusColor, statusLabel, type ProgressStatus } from '../../../lib/progression';
import { WeeklyCalendar } from '../../../components/WeeklyCalendar';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: weekly } = useWeeklyStats();
  const { data: records } = usePersonalRecords();
  const { data: overload } = useOverloadSuggestions();

  const dayOfWeek = new Date().getDay();
  const todayType = ['Rest', 'Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull'][dayOfWeek] ?? 'Rest';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Good {getGreeting()}, {user?.displayName ?? 'Lifter'} 👋
          </h1>
          <p className="text-zinc-400 mt-0.5">
            Today is <span className="text-amber-400 font-semibold">{todayType} Day</span>
          </p>
        </div>
        <Link
          href="/workout"
          className="bg-amber-400 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors"
        >
          Start Workout →
        </Link>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

        {/* Stats Row */}
        <motion.div variants={fade} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Weekly Volume', value: `${((weekly?.totalVolume ?? 0) / 1000).toFixed(1)}k`, unit: 'kg' },
            { label: 'Sessions Done', value: `${weekly?.sessions?.length ?? 0}`, unit: '/ 4' },
            { label: 'Training Streak', value: `${weekly?.streak ?? 0}`, unit: 'days 🔥' },
            { label: 'Personal Records', value: `${records?.length ?? 0}`, unit: 'total' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">
                {stat.value}
                <span className="text-sm text-zinc-400 ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>

        {/* Weekly Calendar */}
        <motion.div variants={fade}>
          <WeeklyCalendar sessions={weekly?.sessions ?? []} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Overload Suggestions */}
          <motion.div variants={fade} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-amber-400">⚡</span> Overload Suggestions
            </h2>
            <div className="space-y-3">
              {overload?.slice(0, 5).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-t border-zinc-800"
                >
                  <div>
                    <p className="text-sm font-medium">{item.exercise?.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.suggestion?.reason}</p>
                  </div>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-md border ${
                      item.suggestion
                        ? statusBadgeClass(item.suggestion.status as ProgressStatus)
                        : 'text-zinc-400'
                    }`}
                  >
                    {item.suggestion
                      ? `${item.suggestion.suggestedWeight}kg × ${item.suggestion.suggestedReps}`
                      : 'No data'}
                  </span>
                </div>
              )) ?? (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Log workouts to see suggestions
                </p>
              )}
            </div>
          </motion.div>

          {/* Recent PRs */}
          <motion.div variants={fade} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-amber-400">🏆</span> Personal Records
            </h2>
            <div className="space-y-2">
              {records?.slice(0, 6).map((pr: any) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between py-2 border-t border-zinc-800"
                >
                  <div>
                    <p className="text-sm font-medium">{pr.exercise.name}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(pr.dateAchieved).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-amber-400">
                      {pr.maxWeight}kg × {pr.maxReps}
                    </p>
                    <p className="text-xs text-zinc-500">
                      ~{Math.round(pr.estimated1RM)}kg 1RM
                    </p>
                  </div>
                </div>
              )) ?? (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No records yet
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function statusBadgeClass(status: ProgressStatus) {
  return {
    IMPROVEMENT: 'text-green-400 border-green-400/30 bg-green-400/10',
    EQUAL:       'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    REGRESSION:  'text-red-400 border-red-400/30 bg-red-400/10',
    PLATEAU:     'text-orange-400 border-orange-400/30 bg-orange-400/10',
  }[status];
}