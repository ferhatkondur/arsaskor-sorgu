import { useMemo, useState, useRef, useEffect } from "react";

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyHint?: string;
}

export function SearchSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder = "Aramak için yaz",
  emptyHint = "Sonuç yok",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLocaleLowerCase("tr");
    return options.filter((o) => o.toLocaleLowerCase("tr").includes(q));
  }, [options, query]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block font-mono text-label text-ink-muted uppercase tracking-wide mb-2">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full min-h-[44px] px-4 text-left border border-rule rounded-btn bg-surface text-body ${
          disabled ? "text-ink-muted/60 bg-paper cursor-not-allowed" : "text-ink"
        }`}
      >
        {value || <span className="text-ink-muted">Seçilmedi</span>}
      </button>

      {open && !disabled && (
        <div className="absolute z-10 left-0 right-0 mt-1 border border-rule rounded-btn bg-surface max-h-64 overflow-hidden flex flex-col">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[44px] px-4 border-b border-rule bg-surface text-body outline-none"
          />
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-helper text-ink-muted">{emptyHint}</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-body min-h-[44px] hover:bg-paper ${
                    o === value ? "text-accent" : "text-ink"
                  }`}
                >
                  {o}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
