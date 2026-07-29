import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  fetchParcel,
  getTransport,
  loadDistricts,
  loadMahalle,
  loadProvinces,
  type District,
  type Neighbourhood,
  type Province,
  type TkgmResult,
} from "@/lib/tkgm";

export const Route = createFileRoute("/cek")({
  head: () => ({
    meta: [
      { title: "TKGM parsel çekici — dahili araç" },
      { name: "description", content: "Dahili: parsel bazlı TKGM ham yanıtlarını çek ve JSON olarak indir." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CekPage,
});

interface ListState<T> {
  loading: boolean;
  items: T[];
  raw?: TkgmResult;
}

function emptyList<T>(): ListState<T> {
  return { loading: false, items: [] };
}

function CekPage() {
  const [provinces, setProvinces] = useState<ListState<Province>>(emptyList());
  const [districts, setDistricts] = useState<ListState<District>>(emptyList());
  const [mahalle, setMahalle] = useState<ListState<Neighbourhood>>(emptyList());

  const [ilId, setIlId] = useState("");
  const [ilceId, setIlceId] = useState("");
  const [mahalleId, setMahalleId] = useState("");
  const [manualMahalleId, setManualMahalleId] = useState("");
  const [ada, setAda] = useState("");
  const [parsel, setParsel] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TkgmResult | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const effectiveMahalleId = manualMahalleId.trim() || mahalleId;

  // Provinces on mount
  useEffect(() => {
    setProvinces({ loading: true, items: [] });
    void loadProvinces().then((r) =>
      setProvinces({ loading: false, items: r.items, raw: r.raw }),
    );
  }, []);

  // Districts when province changes
  useEffect(() => {
    setIlceId("");
    setMahalleId("");
    setDistricts(emptyList());
    setMahalle(emptyList());
    if (!ilId) return;
    setDistricts({ loading: true, items: [] });
    void loadDistricts(ilId).then((r) =>
      setDistricts({ loading: false, items: r.items, raw: r.raw }),
    );
  }, [ilId]);

  // Mahalle when district changes
  useEffect(() => {
    setMahalleId("");
    setMahalle(emptyList());
    if (!ilceId) return;
    setMahalle({ loading: true, items: [] });
    void loadMahalle(ilceId).then((r) =>
      setMahalle({ loading: false, items: r.items, raw: r.raw }),
    );
  }, [ilceId]);

  const ilAd = useMemo(() => provinces.items.find((p) => p.id === ilId)?.ad ?? "", [provinces, ilId]);
  const ilceAd = useMemo(() => districts.items.find((d) => d.id === ilceId)?.ad ?? "", [districts, ilceId]);
  const mahalleAd = useMemo(
    () => mahalle.items.find((m) => m.id === mahalleId)?.ad ?? "",
    [mahalle, mahalleId],
  );

  const canSubmit =
    !submitting && effectiveMahalleId.trim() !== "" && ada.trim() !== "" && parsel.trim() !== "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    setRawOpen(false);
    const r = await fetchParcel(effectiveMahalleId.trim(), ada.trim(), parsel.trim());
    setResult(r);
    setSubmitting(false);
  }

  function download() {
    if (!result) return;
    const nameParts = [
      slug(ilAd || "il"),
      slug(ilceAd || "ilce"),
      slug(mahalleAd || `mah${effectiveMahalleId}`),
      slug(ada || "ada"),
      slug(parsel || "parsel"),
    ];
    const filename = `${nameParts.join("-")}.json`;
    const blob = new Blob([result.bodyText || JSON.stringify(result.body, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const parsedFeature = getFeature(result);
  const geometryPresent = Boolean(parsedFeature?.geometry);
  const props = parsedFeature?.properties ?? {};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.h1}>TKGM parsel çekici</h1>
          <p style={styles.hint}>
            Dahili araç. Aktif taşıma: <strong>{getTransport()}</strong> · 1 istek/sn.
          </p>
        </header>

        <form onSubmit={onSubmit} style={styles.form}>
          <Field label={`İl${listMeta(provinces)}`}>
            <select
              style={styles.input}
              value={ilId}
              onChange={(e) => setIlId(e.target.value)}
              disabled={provinces.loading || provinces.items.length === 0}
            >
              <option value="">— seç —</option>
              {provinces.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ad}
                </option>
              ))}
            </select>
            <RawInfo raw={provinces.raw} />
          </Field>

          <Field label={`İlçe${listMeta(districts)}`}>
            <select
              style={styles.input}
              value={ilceId}
              onChange={(e) => setIlceId(e.target.value)}
              disabled={!ilId || districts.loading || districts.items.length === 0}
            >
              <option value="">— seç —</option>
              {districts.items.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ad}
                </option>
              ))}
            </select>
            <RawInfo raw={districts.raw} />
          </Field>

          <Field label={`Mahalle${listMeta(mahalle)} (endpoint DOĞRULANMADI)`}>
            <select
              style={styles.input}
              value={mahalleId}
              onChange={(e) => setMahalleId(e.target.value)}
              disabled={!ilceId || mahalle.loading || mahalle.items.length === 0 || manualMahalleId.trim() !== ""}
            >
              <option value="">— seç —</option>
              {mahalle.items.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}
                </option>
              ))}
            </select>
            <RawInfo raw={mahalle.raw} />
          </Field>

          <Field label="Mahalle ID (manuel — dropdown'ı geçer)">
            <input
              style={styles.input}
              value={manualMahalleId}
              onChange={(e) => setManualMahalleId(e.target.value)}
              placeholder="örn. 213456"
              inputMode="numeric"
            />
          </Field>

          <div style={styles.row}>
            <Field label="Ada">
              <input
                style={styles.input}
                value={ada}
                onChange={(e) => setAda(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="Parsel">
              <input
                style={styles.input}
                value={parsel}
                onChange={(e) => setParsel(e.target.value)}
                inputMode="numeric"
              />
            </Field>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={!canSubmit} style={styles.button}>
              {submitting ? "Sorgulanıyor…" : "Sorgula"}
            </button>
            {result?.ok && (
              <button type="button" onClick={download} style={styles.buttonSecondary}>
                JSON indir
              </button>
            )}
          </div>
        </form>

        {result && (
          <section style={styles.resultBlock}>
            <h2 style={styles.h2}>Sonuç</h2>
            <dl style={styles.meta}>
              <MetaRow k="URL" v={result.url} mono />
              <MetaRow k="Taşıma" v={result.transport} />
              <MetaRow k="HTTP" v={String(result.status)} />
              <MetaRow k="Başarı" v={result.ok ? "evet" : "hayır"} />
              {result.error && <MetaRow k="Hata" v={result.error} />}
            </dl>

            {result.ok && parsedFeature && (
              <>
                <h3 style={styles.h3}>Özet</h3>
                <dl style={styles.meta}>
                  <MetaRow k="İl" v={ilAd || "—"} />
                  <MetaRow k="İlçe" v={ilceAd || "—"} />
                  <MetaRow k="Mahalle" v={mahalleAd || `(id: ${effectiveMahalleId})`} />
                  <MetaRow k="Ada / Parsel" v={`${ada} / ${parsel}`} />
                  <MetaRow k="Alan" v={pickField(props, ["alan", "ALAN", "yuzolcum", "YUZOLCUM"]) ?? "—"} />
                  <MetaRow
                    k="Nitelik"
                    v={pickField(props, ["nitelik", "NITELIK", "arziTipi", "ARAZI_TIPI"]) ?? "—"}
                  />
                  <MetaRow
                    k="Geometri"
                    v={geometryPresent ? `evet (${(parsedFeature.geometry as { type?: string })?.type ?? "?"})` : "YOK — dikkat"}
                  />
                </dl>
              </>
            )}

            <button
              type="button"
              onClick={() => setRawOpen((o) => !o)}
              style={styles.disclosure}
            >
              {rawOpen ? "Ham yanıtı gizle" : "Ham yanıtı göster"}
            </button>
            {rawOpen && (
              <pre style={styles.pre}>
                {result.bodyText || JSON.stringify(result.body, null, 2) || "(boş)"}
              </pre>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function RawInfo({ raw }: { raw?: TkgmResult }) {
  if (!raw || raw.ok) return null;
  return (
    <div style={styles.rawInfo}>
      <div>
        <strong>HATA</strong> · HTTP {raw.status} · {raw.transport} · {raw.url}
      </div>
      {raw.error && <div>network: {raw.error}</div>}
      <pre style={styles.preSmall}>{raw.bodyText.slice(0, 2000) || "(boş)"}</pre>
    </div>
  );
}

function MetaRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={styles.metaRow}>
      <dt style={styles.dt}>{k}</dt>
      <dd style={{ ...styles.dd, fontFamily: mono ? "ui-monospace, monospace" : undefined, wordBreak: "break-all" }}>
        {v}
      </dd>
    </div>
  );
}

function listMeta<T>(s: ListState<T>): string {
  if (s.loading) return " (yükleniyor…)";
  if (s.raw && !s.raw.ok) return " (yüklenemedi)";
  if (s.items.length > 0) return ` (${s.items.length})`;
  return "";
}

function getFeature(r: TkgmResult | null): { properties?: Record<string, unknown>; geometry?: unknown } | null {
  if (!r || !r.ok || !r.body || typeof r.body !== "object") return null;
  const body = r.body as { type?: string; features?: Array<{ properties?: Record<string, unknown>; geometry?: unknown }>; properties?: Record<string, unknown>; geometry?: unknown };
  if (body.type === "FeatureCollection" && Array.isArray(body.features) && body.features[0]) {
    return body.features[0];
  }
  if (body.properties || body.geometry) return body;
  return null;
}

function pickField(props: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = props[k];
    if (v != null && v !== "") return String(v);
  }
  return undefined;
}

function slug(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "x";
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f4f4",
    color: "#111",
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    fontSize: 13,
    padding: "16px 12px 64px",
  },
  container: { maxWidth: 760, margin: "0 auto" },
  header: { marginBottom: 16 },
  h1: { margin: 0, fontSize: 18, fontWeight: 600 },
  h2: { margin: "16px 0 8px", fontSize: 15, fontWeight: 600 },
  h3: { margin: "12px 0 6px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  hint: { margin: "4px 0 0", color: "#555", fontSize: 12 },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#fff",
    border: "1px solid #ccc",
    padding: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, color: "#333" },
  input: {
    font: "inherit",
    padding: "6px 8px",
    border: "1px solid #999",
    background: "#fff",
    borderRadius: 2,
    minHeight: 30,
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  actions: { display: "flex", gap: 8, marginTop: 4 },
  button: {
    font: "inherit",
    padding: "8px 14px",
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 2,
    cursor: "pointer",
  },
  buttonSecondary: {
    font: "inherit",
    padding: "8px 14px",
    background: "#fff",
    color: "#111",
    border: "1px solid #999",
    borderRadius: 2,
    cursor: "pointer",
  },
  resultBlock: {
    marginTop: 16,
    background: "#fff",
    border: "1px solid #ccc",
    padding: 12,
  },
  meta: { margin: 0, display: "flex", flexDirection: "column", gap: 2 },
  metaRow: { display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 },
  dt: { color: "#555", margin: 0 },
  dd: { margin: 0 },
  disclosure: {
    marginTop: 12,
    font: "inherit",
    padding: "4px 8px",
    background: "#eee",
    border: "1px solid #999",
    borderRadius: 2,
    cursor: "pointer",
  },
  pre: {
    marginTop: 8,
    padding: 10,
    background: "#0b0b0b",
    color: "#e7e7e7",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    overflow: "auto",
    maxHeight: 480,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  preSmall: {
    marginTop: 4,
    padding: 6,
    background: "#fafafa",
    border: "1px solid #ddd",
    fontFamily: "ui-monospace, monospace",
    fontSize: 11,
    maxHeight: 160,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  rawInfo: {
    marginTop: 4,
    padding: 6,
    border: "1px solid #c00",
    background: "#fff5f5",
    color: "#800",
    fontSize: 12,
  },
};
