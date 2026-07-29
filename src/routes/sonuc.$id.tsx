import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LevelMark, levelBorderClass } from "@/components/arsa/LevelMark";
import { results, type Verdict } from "@/lib/arsa-data";

export const Route = createFileRoute("/sonuc/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `arsaskor — Sonuç ${params.id.toUpperCase()}` },
      {
        name: "description",
        content:
          "Parsel için imar, çevre, fiziksel ve tapu bulgularının sade Türkçe özeti.",
      },
      { property: "og:title", content: "arsaskor — Parsel raporu" },
      {
        property: "og:description",
        content: "Kayıtlarda ne göründüğü ve neyin okunamadığı bir arada.",
      },
    ],
  }),
  loader: ({ params }) => {
    const key = params.id as "a" | "b" | "c";
    const data = results[key];
    if (!data) throw notFound();
    return { data };
  },
  component: ResultPage,
});

const verdictColor: Record<Verdict["kind"], string> = {
  strong: "text-strong",
  good: "text-good",
  medium: "text-medium",
  weak: "text-weak",
  eliminated: "text-eliminated",
  unknown: "text-unknown",
};

function ScoreBlock({ verdict }: { verdict: Verdict }) {
  const isUnknown = verdict.kind === "unknown";
  const color = verdictColor[verdict.kind];

  return (
    <div className="px-4 pt-6 pb-5 border-b border-rule">
      <div className="flex items-baseline gap-3">
        <span className={`font-mono text-score font-medium leading-none ${color}`}>
          {isUnknown ? "—" : verdict.score}
        </span>
        {!isUnknown && (
          <span className="font-mono text-helper text-ink-muted">/ 100</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <LevelMarkForVerdict kind={verdict.kind} />
        <span className={`text-card font-medium ${color}`}>{verdict.label}</span>
      </div>
    </div>
  );
}

function LevelMarkForVerdict({ kind }: { kind: Verdict["kind"] }) {
  const shape: Record<Verdict["kind"], string> = {
    strong: "●",
    good: "●",
    medium: "◐",
    weak: "▲",
    eliminated: "■",
    unknown: "—",
  };
  return (
    <span className={`font-mono text-body leading-none ${verdictColor[kind]}`}>
      {shape[kind]}
    </span>
  );
}

function ResultPage() {
  const { data } = Route.useLoaderData();
  const { parcel, verdict, summary, cards, questions, sources } = data;

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-full bg-paper">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-rule bg-surface flex items-center justify-between">
          <Link
            to="/"
            className="text-helper text-accent min-h-[44px] inline-flex items-center"
          >
            ← Yeni sorgu
          </Link>
          <span className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Rapor
          </span>
        </div>

        {/* Parcel identity — mono, instrument-like */}
        <div className="px-4 py-4 bg-surface border-b border-rule">
          <div className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Parsel
          </div>
          <div className="mt-1 text-card text-ink">
            {parcel.province} · {parcel.district} · {parcel.neighbourhood}
          </div>
          <div className="mt-2 font-mono text-body text-ink">
            ADA {parcel.ada} / PARSEL {parcel.parsel}
          </div>
        </div>

        <ScoreBlock verdict={verdict} />

        {/* Summary */}
        <section className="px-4 py-5 border-b border-rule">
          <h2 className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Özet
          </h2>
          <p className="mt-2 text-body text-ink leading-relaxed">{summary}</p>
        </section>

        {/* Status cards */}
        <section className="px-4 py-5 flex flex-col gap-3 border-b border-rule">
          {cards.map((c) => (
            <article
              key={c.title}
              className={`border border-rule border-l-4 ${levelBorderClass(
                c.level
              )} rounded-card bg-surface p-4`}
            >
              <header className="flex items-start justify-between gap-3">
                <h3 className="text-card font-medium text-ink">{c.title}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-rule px-3 py-1 font-mono text-label uppercase tracking-wide text-ink">
                  <LevelMark level={c.level} />
                  {c.levelLabel}
                </span>
              </header>
              <p className="mt-3 text-body text-ink leading-relaxed">{c.body}</p>

              {c.unchecked.length > 0 && (
                <div className="mt-4 pt-3 border-t border-rule">
                  <div className="font-mono text-label uppercase tracking-wide text-ink-muted">
                    Ölçülemedi
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {c.unchecked.map((u) => (
                      <li
                        key={u}
                        className="text-helper text-ink-muted leading-relaxed pl-4 relative"
                      >
                        <span className="absolute left-0 top-0 font-mono text-unknown">
                          —
                        </span>
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Questions for the seller */}
        <section className="px-4 py-5 border-b border-rule">
          <h2 className="text-card font-medium text-ink">
            Almadan önce mutlaka sor
          </h2>
          <ol className="mt-3 flex flex-col gap-3">
            {questions.map((q, i) => (
              <li key={q} className="flex gap-3">
                <span className="font-mono text-label text-ink-muted pt-1 min-w-[24px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-body text-ink leading-relaxed">{q}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Follow action */}
        <section className="px-4 py-5 border-b border-rule">
          <button
            type="button"
            className="w-full min-h-[44px] rounded-btn border border-accent text-accent bg-surface text-body font-medium"
          >
            Bu parseli takibe al
          </button>
          <p className="mt-2 text-helper text-ink-muted leading-relaxed">
            Kayıtlarda değişiklik görüldüğünde bildirim gönderilir.
          </p>
        </section>

        {/* How calculated */}
        <section className="px-4 py-4 border-b border-rule">
          <Link
            to="/"
            className="text-helper text-accent min-h-[44px] inline-flex items-center"
          >
            Nasıl hesaplandı? →
          </Link>
        </section>

        {/* Sources */}
        <section className="px-4 py-5 border-b border-rule">
          <h2 className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Kaynaklar
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {sources.map((s) => (
              <li key={s.label} className="flex flex-col">
                <span className="text-card text-ink">{s.label}</span>
                <span className="text-helper text-ink-muted">{s.note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Legal disclaimer — always last */}
        <footer className="px-4 py-5 mt-auto">
          <p className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Yasal uyarı
          </p>
          <p className="mt-2 text-helper text-ink leading-relaxed">
            Bu bir değerleme raporu veya yatırım tavsiyesi değildir.
          </p>
        </footer>
      </div>
    </PhoneFrame>
  );
}
