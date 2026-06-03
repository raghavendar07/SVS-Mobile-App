import { Screen } from './Screen';

/** Phase-1 stub screen. Replaced by real feature screens in later phases. */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-slate-400">
        <p className="text-sm">{note ?? `${title} — coming in a later phase.`}</p>
      </div>
    </Screen>
  );
}
