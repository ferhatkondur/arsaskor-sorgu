import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SearchSelect } from "@/components/arsa/SearchSelect";
import {
  provinces,
  districtsByProvince,
  neighbourhoodsByDistrict,
} from "@/lib/arsa-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "arsaskor — Parsel sorgusu" },
      {
        name: "description",
        content:
          "İl, ilçe, mahalle, ada ve parsel bilgisiyle arsa üzerinde tapu ve imar kontrolü başlat.",
      },
      { property: "og:title", content: "arsaskor — Parsel sorgusu" },
      {
        property: "og:description",
        content: "Arsa almadan önce kayıtlardan neyin okunabildiğini sade Türkçe ile gör.",
      },
    ],
  }),
  component: QueryPage,
});

function QueryPage() {
  const navigate = useNavigate();
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [neigh, setNeigh] = useState("");
  const [ada, setAda] = useState("");
  const [parsel, setParsel] = useState("");
  const [searching, setSearching] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const credits = 7;

  const districts = useMemo(
    () => (province ? districtsByProvince[province] ?? [] : []),
    [province]
  );
  const neighbourhoods = useMemo(
    () => (district ? neighbourhoodsByDistrict[district] ?? [] : []),
    [district]
  );

  const canSubmit = province && district && neigh && ada.trim() && parsel.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || searching) return;
    setNoResult(false);
    setSearching(true);
    await new Promise((r) => setTimeout(r, 900));
    setSearching(false);

    // Mock routing: numeric parsel decides which variant we open.
    const p = parseInt(parsel, 10);
    if (p === 0) {
      setNoResult(true);
      return;
    }
    const id = p % 3 === 0 ? "c" : p % 2 === 0 ? "b" : "a";
    navigate({ to: "/sonuc/$id", params: { id } });
  }

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-full">
        {/* Credits strip */}
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between bg-surface">
          <span className="font-mono text-label uppercase tracking-wide text-ink-muted">
            Sorgu hakkı
          </span>
          <span className="font-mono text-body text-ink">
            {credits.toString().padStart(2, "0")} / 10
          </span>
        </div>

        {/* Title */}
        <header className="px-4 pt-6 pb-4">
          <div className="font-mono text-label uppercase tracking-wide text-ink-muted">
            arsaskor
          </div>
          <h1 className="mt-2 text-title font-medium text-ink">Parsel sorgusu</h1>
          <p className="mt-2 text-helper text-ink-muted leading-relaxed">
            Kayıtlarda ne görünüyor, ne görünmüyor — birlikte bakılır.
          </p>
        </header>

        <form onSubmit={onSubmit} className="px-4 pb-6 flex flex-col gap-4">
          <SearchSelect
            label="İl"
            value={province}
            options={provinces}
            onChange={(v) => {
              setProvince(v);
              setDistrict("");
              setNeigh("");
              setNoResult(false);
            }}
          />
          <SearchSelect
            label="İlçe"
            value={district}
            options={districts}
            disabled={!province}
            onChange={(v) => {
              setDistrict(v);
              setNeigh("");
              setNoResult(false);
            }}
            emptyHint="Bu il için örnek ilçe yok"
          />
          <SearchSelect
            label="Mahalle"
            value={neigh}
            options={neighbourhoods}
            disabled={!district}
            onChange={(v) => {
              setNeigh(v);
              setNoResult(false);
            }}
            emptyHint="Bu ilçe için örnek mahalle yok"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-label uppercase tracking-wide text-ink-muted mb-2">
                Ada
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={ada}
                onChange={(e) => setAda(e.target.value.replace(/\D/g, ""))}
                className="w-full min-h-[44px] px-4 border border-rule rounded-btn bg-surface font-mono text-body text-ink outline-none focus:border-ink"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block font-mono text-label uppercase tracking-wide text-ink-muted mb-2">
                Parsel
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={parsel}
                onChange={(e) => setParsel(e.target.value.replace(/\D/g, ""))}
                className="w-full min-h-[44px] px-4 border border-rule rounded-btn bg-surface font-mono text-body text-ink outline-none focus:border-ink"
                placeholder="—"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || searching}
            className={`mt-2 min-h-[44px] rounded-btn border text-body font-medium ${
              canSubmit && !searching
                ? "border-accent text-accent bg-surface"
                : "border-rule text-ink-muted bg-paper"
            }`}
          >
            {searching ? "Kayıtlar taranıyor" : "Kontrolü başlat"}
          </button>

          <p className="text-helper text-ink-muted leading-relaxed">
            Kayıtlardan bir bulgu çıkmazsa hak düşülmez.
          </p>

          {noResult && (
            <div className="border border-rule rounded-card p-4 bg-surface">
              <p className="text-card font-medium text-ink">Kayıt bulunamadı</p>
              <p className="mt-1 text-helper text-ink-muted leading-relaxed">
                Bu parsel için çevrimiçi bir eşleşme yok. Hakkınız düşürülmedi.
              </p>
            </div>
          )}
        </form>

        <div className="mt-auto px-4 py-4 border-t border-rule">
          <p className="text-helper text-ink-muted leading-relaxed">
            Bu bir değerleme raporu veya yatırım tavsiyesi değildir.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
