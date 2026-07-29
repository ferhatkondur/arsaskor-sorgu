// Client for the TKGM MEGSIS public API.
// - Global 1 req/sec queue
// - One retry after 2s on transient failure, then stop
// - Tries direct upstream first; on network / CORS failure falls back to
//   the server proxy at /api/public/tkgm/*
// - Caches lookup lists

const DIRECT_BASE = "https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api";
const PROXY_BASE = "/api/public/tkgm";
const MIN_GAP_MS = 1000;
const RETRY_DELAY_MS = 2000;

export type TransportUsed = "direct" | "proxy";

export interface TkgmResult<T = unknown> {
  ok: boolean;
  url: string;
  transport: TransportUsed;
  status: number;
  body: T | string | null;
  bodyText: string;
  error?: string;
}

// Sticky choice: once direct is proven blocked, don't keep hammering it.
let preferredTransport: TransportUsed = "direct";

let queueTail: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function schedule<T>(job: () => Promise<T>): Promise<T> {
  const run = queueTail.then(async () => {
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return job();
  });
  queueTail = run.catch(() => undefined);
  return run;
}

async function tryFetch(url: string): Promise<{ status: number; text: string } | { networkError: string }> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json,application/geo+json,*/*" },
    });
    const text = await res.text();
    return { status: res.status, text };
  } catch (err) {
    return { networkError: err instanceof Error ? err.message : String(err) };
  }
}

function parseMaybeJson(text: string): unknown | string {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestOnce(path: string): Promise<TkgmResult> {
  const directUrl = `${DIRECT_BASE}/${path}`;
  const proxyUrl = `${PROXY_BASE}/${path}`;

  if (preferredTransport === "direct") {
    const r = await tryFetch(directUrl);
    if ("networkError" in r) {
      // CORS / network — fall back to proxy, and remember it for next time.
      preferredTransport = "proxy";
    } else {
      return {
        ok: r.status >= 200 && r.status < 300,
        url: directUrl,
        transport: "direct",
        status: r.status,
        body: parseMaybeJson(r.text),
        bodyText: r.text,
      };
    }
  }

  const r = await tryFetch(proxyUrl);
  if ("networkError" in r) {
    return {
      ok: false,
      url: proxyUrl,
      transport: "proxy",
      status: 0,
      body: null,
      bodyText: "",
      error: r.networkError,
    };
  }
  return {
    ok: r.status >= 200 && r.status < 300,
    url: proxyUrl,
    transport: "proxy",
    status: r.status,
    body: parseMaybeJson(r.text),
    bodyText: r.text,
  };
}

export async function tkgmRequest(path: string): Promise<TkgmResult> {
  return schedule(async () => {
    const first = await requestOnce(path);
    if (first.ok) return first;
    // Only retry once on 5xx or 0 (network). Do not retry 4xx.
    if (first.status !== 0 && !(first.status >= 500 && first.status < 600)) {
      return first;
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return requestOnce(path);
  });
}

export function getTransport(): TransportUsed {
  return preferredTransport;
}

// ---------- typed helpers ----------

export interface Province {
  id: string;
  ad: string;
}
export interface District {
  id: string;
  ad: string;
}
export interface Neighbourhood {
  id: string;
  ad: string;
}

const cache = {
  provinces: undefined as Province[] | undefined,
  districts: new Map<string, District[]>(),
  mahalle: new Map<string, Neighbourhood[]>(),
};

function pickIdName(props: Record<string, unknown> | null | undefined): { id?: string; ad?: string } {
  if (!props) return {};
  const idCandidate =
    props.id ?? props.ID ?? props.Id ?? props.OBJECTID ?? props.objectid ?? props.MAKS_ID ?? props.maksId;
  const nameCandidate =
    props.ad ?? props.AD ?? props.NAME ?? props.name ?? props.ilAdi ?? props.ilceAdi ?? props.mahalleAdi;
  return {
    id: idCandidate != null ? String(idCandidate) : undefined,
    ad: nameCandidate != null ? String(nameCandidate) : undefined,
  };
}

function extractList(body: unknown): Array<{ id: string; ad: string }> {
  if (!body) return [];
  // GeoJSON FeatureCollection
  if (typeof body === "object" && (body as { features?: unknown[] }).features) {
    const feats = (body as { features: Array<{ properties?: Record<string, unknown> }> }).features;
    const out: Array<{ id: string; ad: string }> = [];
    for (const f of feats) {
      const { id, ad } = pickIdName(f.properties);
      if (id && ad) out.push({ id, ad });
    }
    return out;
  }
  // Plain array
  if (Array.isArray(body)) {
    const out: Array<{ id: string; ad: string }> = [];
    for (const row of body) {
      const { id, ad } = pickIdName(row as Record<string, unknown>);
      if (id && ad) out.push({ id, ad });
    }
    return out;
  }
  return [];
}

export interface ListLoad<T> {
  items: T[];
  raw: TkgmResult;
}

export async function loadProvinces(): Promise<ListLoad<Province>> {
  if (cache.provinces) {
    return { items: cache.provinces, raw: { ok: true, url: "(cached)", transport: getTransport(), status: 200, body: null, bodyText: "" } };
  }
  const raw = await tkgmRequest("maksIdariYapi/illiste");
  const items = raw.ok ? extractList(raw.body).sort((a, b) => a.ad.localeCompare(b.ad, "tr")) : [];
  if (raw.ok) cache.provinces = items;
  return { items, raw };
}

export async function loadDistricts(ilId: string): Promise<ListLoad<District>> {
  const hit = cache.districts.get(ilId);
  if (hit) {
    return { items: hit, raw: { ok: true, url: "(cached)", transport: getTransport(), status: 200, body: null, bodyText: "" } };
  }
  const raw = await tkgmRequest(`idariYapi/ilceListe/${ilId}`);
  const items = raw.ok ? extractList(raw.body).sort((a, b) => a.ad.localeCompare(b.ad, "tr")) : [];
  if (raw.ok) cache.districts.set(ilId, items);
  return { items, raw };
}

// UNVERIFIED endpoint — pattern-matched from ilceListe. Surface the raw
// response to the user so they can confirm what actually came back.
export async function loadMahalle(ilceId: string): Promise<ListLoad<Neighbourhood>> {
  const hit = cache.mahalle.get(ilceId);
  if (hit) {
    return { items: hit, raw: { ok: true, url: "(cached)", transport: getTransport(), status: 200, body: null, bodyText: "" } };
  }
  const raw = await tkgmRequest(`idariYapi/mahalleListe/${ilceId}`);
  const items = raw.ok ? extractList(raw.body).sort((a, b) => a.ad.localeCompare(b.ad, "tr")) : [];
  if (raw.ok && items.length > 0) cache.mahalle.set(ilceId, items);
  return { items, raw };
}

export async function fetchParcel(mahalleId: string, ada: string, parsel: string): Promise<TkgmResult> {
  return tkgmRequest(`parsel/${encodeURIComponent(mahalleId)}/${encodeURIComponent(ada)}/${encodeURIComponent(parsel)}`);
}
