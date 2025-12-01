/// <reference types="vitest" />
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Minimal, text‑only hero with scroll‑driven reveals on a pure‑black background.
 * – Background video (opacity configurable) + optional FOREGROUND looping logo (WebM alpha preferred).
 * – Sticky hero copy up top, then Works archive grid with tag filtering, then Contact.
 * – Built with Tailwind + Framer Motion. Drop into any React app.
 */

type HeroScrollProps = {
  /** Background video source */
  heroVideoSrc?: string;
  /** Legacy MP4 logo (kept for tests/back-compat, not rendered when WebM is provided) */
  logoVideoSrc?: string;
  /** WebM (VP9/AV1) with alpha for the logo overlay */
  logoWebmAlphaSrc?: string;
  /** Opacity for logo overlay video (0..1). Default 1 */
  logoOpacity?: number;
  /** Vertical offset for the logo overlay in percent (negative moves up). Default -8 */
  logoOffsetYPct?: number;
  /** Background video opacity (0..1). Default 0.3 */
  bgOpacity?: number;
  /** Show vignette overlay over background video */
  showVignette?: boolean;
};

/**
 * Safe asset helper that avoids import.meta.env access (which breaks in some sandboxes/CI).
 * It respects a <base href> if present; otherwise falls back to "/media/...".
 */
function asset(p: string) {
  try {
    if (!p) return "";
    if (/^https?:\/\//.test(p) || p.startsWith("/")) return p;
    if (typeof document !== "undefined") {
      const baseHref = document.querySelector("base")?.getAttribute("href") || "/";
      const prefix = baseHref.endsWith("/") ? baseHref : baseHref + "/";
      return `${prefix}media/${p}`;
    }
  } catch {}
  return `/media/${p}`;
}

// Fallback chain: tries base-aware /media/p, then root /media/p, then root /p
function assetChain(p: string): string[] {
  const a = asset(p);
  const chain = [a];
  if (!a.startsWith("/media/")) chain.push(`/media/${p}`);
  chain.push(`/${p}`);
  // de-dup
  return Array.from(new Set(chain));
}

function mimeFrom(url: string): string | undefined {
  const u = url.toLowerCase();
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return "image/jpeg";
  if (u.endsWith(".png")) return "image/png";
  return undefined;
}

function SmartImg({ sources, alt, className }: { sources: string[]; alt: string; className?: string }) {
  const [idx, setIdx] = useState(0);
  const src = sources[idx];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function HeroScroll({
  heroVideoSrc = asset("hero.mp4"),
  logoVideoSrc = asset("logo.mp4"),
  logoWebmAlphaSrc = asset("logo.webm"),
  logoOpacity = 1,
  logoOffsetYPct = 0,
  bgOpacity = 0.3,
  showVignette = false,
}: HeroScrollProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Whole‑page progress (for progress bar or global effects)
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });

  // Hero‑local progress: 0 at hero top aligned to viewport top, 1 when hero bottom hits viewport top
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Top progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Respect prefers‑reduced‑motion
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // lightweight runtime diagnostics (enable with ?debug=1)
  const [assetErrors, setAssetErrors] = useState<string[]>([]);
  const markError = (url: string) => setAssetErrors((s) => (s.includes(url) ? s : [...s, url]));
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // In-page smooth scroll helper for top-right nav
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // -------- Hero scroll motion (parallax + fade) --------
  // Heading moves up slightly and fades as hero scrolls away
  const h1Y = useTransform(heroProgress, [0, 0.5, 1], [24, 0, -32]);
  const h1Opacity = useTransform(heroProgress, [0, 0.15, 0.6, 1], [0, 1, 0.92, 0.85]);
  const h1Scale = useTransform(heroProgress, [0, 1], [1.02, 1]);

  // Sub copy follows with a bit more lag for depth
  const pY = useTransform(heroProgress, [0, 0.6, 1], [16, 0, -20]);
  const pOpacity = useTransform(heroProgress, [0, 0.2, 0.8, 1], [0, 1, 0.95, 0.9]);

  // -------- About image scroll motion --------
  const aboutImageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: aboutProg } = useScroll({ target: aboutImageRef, offset: ["start 80%", "end 20%"] });
  const aboutY = useTransform(aboutProg, [0, 1], [32, 0]);
  const aboutOpacity = useTransform(aboutProg, [0, 0.2, 1], [0, 1, 1]);
  const aboutScale = useTransform(aboutProg, [0, 1], [2.5, 1]);

  // -------- Works data & filtering --------
  // 1) 내가 쓰는 태그를 '정해진 값'으로 선언
  type Tag =
    | "reality"
    | "performance"
    | "installation"
    | "rhythm_game"
    | "projection_mapping"

  // 2) 상단 칩(row)에 보여줄 순서 (원하는 순서로 편집)
  const TAGS: Tag[] = [
    "reality",
    "performance",
    "installation",
    "rhythm_game",
    "projection_mapping",
  ];

  // (선택) 칩에 보일 레이블이 태그 값과 다르면 여기서 바꿔줄 수 있음
  const TAG_LABEL: Record<Tag, string> = {
    reality: "reality",
    performance: "performance",
    installation: "installation",
    rhythm_game: "rhythm_game",
    projection_mapping: "projection_mapping",
  };

  type WorkItem = { id: string; title: string; tags: Tag[]; thumb: string };
  const WORKS: WorkItem[] = [
    { id: "XEEKIN", title: "XEEKIN", tags: ["installation", "performance", "reality", "rhythm_game", "projection_mapping"], thumb: asset("works/XEEKIN.png") },
    { id: "NOISE CANCELLING", title: "NOISE CANCELLING", tags: ["projection_mapping", "reality", "installation", "projection_mapping"], thumb: asset("works/NOISECANCELLING.png") },
    { id: "The Unknown box", title: "The Unknown box", tags: ["reality", "installation", "projection_mapping"], thumb: asset("works/box.png") },
    { id: "fog-screen", title: "Fog Screen", tags: ["reality", "projection_mapping"], thumb: asset("works/fog.png") },
    { id: "Groo", title: "Groo", tags: ["reality", "installation", "projection_mapping"], thumb: asset("works/Groo.png") },
  ];


  const [activeTag, setActiveTag] = useState<"All" | Tag>("All");
  const allTags = useMemo(() => ["All", ...TAGS] as const, []);
  const filteredWorks = useMemo(
    () => (activeTag === "All" ? WORKS : WORKS.filter(w => w.tags.includes(activeTag))),
    [activeTag]
  );


  return (
    <div ref={pageRef} className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Top progress bar (2px) */}
      <motion.div className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-white/70" style={{ scaleX }} />

      {/* Translucent top bar with right-aligned nav */}
      <nav className="fixed inset-x-0 top-0 z-40">
        <div className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
          <div className="flex items-center justify-end gap-8 text-base py-3 pr-4 sm:py-3.5 sm:pr-6">
            <button type="button" onClick={() => scrollToId('about')} className="px-2 py-1 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">About</button>
            <button type="button" onClick={() => scrollToId('works')} className="px-2 py-1 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Works</button>
            <button type="button" onClick={() => scrollToId('contact')} className="px-2 py-1 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Contact</button>
          </div>
        </div>
      </nav>

      {/* INTRO section (full viewport): only videos, no text) */}
      <section className="relative min-h-[100svh]">
        {/* Background video */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{ opacity: clamp01(bgOpacity) }}
          >
            {assetChain("hero.mp4").map((u) => (
              <source key={u} src={u} type={mimeFrom(u)} onError={() => markError(u)} />
            ))}
          </video>
          {showVignette && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          )}
        </div>

        {/* Foreground LOGO (centered, moved slightly up) */}
        {isLogoOverlayEnabled(logoWebmAlphaSrc) && (
          <div
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
            style={{ transform: `translateY(${logoOffsetYPct}%)` }}
          >
            <video
              className="max-h-[80svh] max-w-[80vw] object-contain"
              onError={() => markError(logoWebmAlphaSrc)}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{ opacity: clamp01(logoOpacity) }}
            >
              {assetChain("logo.webm").map((u) => (
                <source key={u} src={u} type={mimeFrom(u)} onError={() => markError(u)} />
              ))}
              {assetChain("logo.mp4").map((u) => (
                <source key={u} src={u} type={mimeFrom(u)} onError={() => markError(u)} />
              ))}
            </video>
          </div>
        )}
      </section>

      {/* Sticky HERO section (now starts one page later) */}
      <section id="about" ref={heroRef} className="relative min-h-[140svh]">
        {/* Background video */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover"
            src={heroVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{ opacity: clamp01(bgOpacity) }}
          />
          {showVignette && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          )}
        </div>

        <div className="sticky top-0 flex h-[100svh] items-center px-6 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <motion.h1
              initial={reduced ? undefined : { opacity: 0, y: 24 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: reduced ? 0 : h1Y, opacity: reduced ? 1 : h1Opacity, scale: reduced ? 1 : h1Scale }}
              className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-7xl"
            >
              Hwang Su Jong — Portfolio
              <span className="block text-neutral-300">Interfacing Reality, Playfully.</span>
            </motion.h1>

            <motion.p
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: reduced ? 0 : pY, opacity: reduced ? 1 : pOpacity }}
              className="mt-6 max-w-3xl text-pretty text-[1.4rem] leading-relaxed text-neutral-200"
            >
              디지털과 현실을 잇는 인터페이스를 만들고, 그 속에서 현실을 플레이할 수 있는 경험을 설계합니다.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ABOUT image (3rd section): transparent PNG centered */}
      <section id="about-image" className="relative min-h-[100svh] bg-black">
        <div ref={aboutImageRef} className="grid h-full place-items-center px-0">
          <motion.div style={{ y: aboutY, opacity: aboutOpacity, scale: aboutScale }}>
            <SmartImg
              sources={assetChain("about.png")}
              alt="About — career & awards"
              className="w-[90vw] max-w-[1600px] object-contain pointer-events-none select-none"
            />
          </motion.div>
        </div>
      </section>

      {/* Works Archive Grid (4th) */}
      <section id="works" className="relative min-h-[100svh] bg-black">
        {/* Tag selector row — “play a ____” concept */}
        <div className="sticky top-[44px] z-30 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/50">
          <div className="mx-auto max-w-none px-3 py-3 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              {/* Left: play a ____ headline */}
              <div className="text-2xl font-semibold leading-none tracking-tight sm:text-3xl" aria-live="polite">
                <span className="text-white/70">play a</span>
                <motion.span
                  key={activeTag}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="ml-2 inline-block bg-white text-black px-2.5 py-1 rounded-md"
                >
                  {activeTag === "All" ? "reality" : activeTag}
                </motion.span>
              </div>

              {/* Right: tag chips (you can author your own list later; we derive for now) */}
              <div className="-mx-1 flex flex-wrap items-center gap-2">
                {allTags.filter((t) => t !== "All").map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={
                      "px-3 py-1.5 text-xs sm:text-sm rounded-full border transition " +
                      (activeTag === tag
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/85 hover:border-white/40 hover:text-white")
                    }
                    aria-pressed={activeTag === tag}
                  >
                    {tag}
                  </button>
                ))}
                {/* Reset to All */}
                <button
                  type="button"
                  onClick={() => setActiveTag("All")}
                  className="ml-1 px-3 py-1.5 text-xs sm:text-sm rounded-full border border-white/10 text-white/60 hover:text-white/90 hover:border-white/30"
                  title="Show all"
                >
                  reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-none px-2 sm:px-4 lg:px-8 py-8">
          <h2 className="mb-6 text-lg font-medium text-white/90">Archive</h2>
          <motion.ul
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 lg:gap-6"
            initial={false}
          >
            {filteredWorks.map((w) => (
              <motion.li key={w.id} layout className="group overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <a href={`/work/${w.id}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    <SmartImg
                      sources={assetChain(w.thumb.replace(/^.*media\//, '').replace(/^\//, ''))}
                      alt={w.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm">
                    <span className="truncate text-white/90">{w.title}</span>
                    <span className="truncate text-white/40">{w.tags[0]}</span>
                  </div>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          {filteredWorks.length === 0 && (
            <p className="mt-10 text-center text-white/50">No works for the selected tag.</p>
          )}
        </div>
      </section>

      {/* Contact (5th) */}
      {/* Contact (5th) */}
      <section id="contact" className="mx-auto max-w-3xl px-6 pb-20 pt-10 text-sm text-neutral-200 sm:px-10">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Contact</h2>
        <p className="mt-2 text-neutral-400">
          프로젝트 문의를 남겨주세요. 메일 앱으로 연결되어 초안이 자동 작성됩니다.
        </p>

        <ContactForm />

        <p className="mt-6 text-xs text-neutral-500">
          We use your info solely to respond to your inquiry and delete it after a reasonable period.
        </p>
      </section>


      {/* Debug panel */}
      {debug && assetErrors.length > 0 && (
        <div className="fixed left-2 bottom-2 z-[100] max-w-[90vw] rounded-md border border-white/20 bg-black/80 p-3 text-xs text-white">
          <p className="mb-2 font-medium">Missing/failed assets:</p>
          <ul className="list-disc pl-4 opacity-90">
            {assetErrors.map((u) => (
              <li key={u}><code className="break-all">{u}</code></li>
            ))}
          </ul>
          <p className="mt-2 opacity-70">Tip: files must exist under <code>/public/media</code> in your repo, case-sensitive on Linux.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Contact Form Component ---------------- */
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const to = "su96hwang@gmail.com";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErr("이름, 이메일, 메시지는 필수입니다.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("이메일 형식을 확인해주세요.");
      return;
    }
    if (!agree) {
      setErr("개인정보 이용에 동의해주세요.");
      return;
    }

    const subject = `[Portfolio Inquiry] ${name}`;
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      budget ? `Budget: ${budget}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      "",
      message,
    ].filter(Boolean) as string[];

    const href = buildMailto(to, subject, lines.join("\n"));

    try { window.location.href = href; } catch {}
    try { navigator.clipboard?.writeText(`${subject}\n\n${lines.join("\n")}`); } catch {}
  }

  const inputCls =
    "w-full rounded-xl bg-neutral-900/70 border border-neutral-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder:text-neutral-500";
  const labelCls = "mb-1 text-xs text-neutral-400";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5"
    >
      {err && (
        <div className="sm:col-span-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-red-200 text-xs">
          {err}
        </div>
      )}

      <label className="sm:col-span-1">
        <div className={labelCls}>Name*</div>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
      </label>

      <label className="sm:col-span-1">
        <div className={labelCls}>Email*</div>
        <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" required />
      </label>

      <label className="sm:col-span-1">
        <div className={labelCls}>Budget</div>
        <select className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">Select a range</option>
          <option>Under USD 2k</option>
          <option>USD 2k–5k</option>
          <option>USD 5k–10k</option>
          <option>USD 10k+</option>
        </select>
      </label>

      <label className="sm:col-span-1">
        <div className={labelCls}>Timeline</div>
        <input className={inputCls} value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g., Jan–Feb" />
      </label>

      <label className="sm:col-span-2">
        <div className={labelCls}>Message*</div>
        <textarea
          className={ inputCls + " min-h-[140px]" }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Project summary, goals, tech stack, venue, etc."
          required
        />
      </label>

      <div className="sm:col-span-2 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-400 select-none">
          <input
            type="checkbox"
            className="size-4 rounded border-neutral-700 bg-neutral-900"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree that my info will be used solely to respond to my inquiry.
        </label>
        <button className="rounded-xl bg-white text-black px-5 py-2.5 font-medium hover:bg-neutral-200">Send</button>
      </div>
    </form>
  );
}


/**
 * ---------- Utilities & tests ----------
 * Keep runtime clean; tests run only under Vitest.
 */
export function clamp01(v: number) {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}

export function formatBlur(px: number) {
  const v = Number.isFinite(px) ? Math.max(0, px) : 0;
  return `blur(${v}px)`;
}

export function mapRangeClamped(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (!Number.isFinite(x) || !Number.isFinite(inMin) || !Number.isFinite(inMax) || inMin === inMax) return outMin;
  const t = Math.min(1, Math.max(0, (x - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

export function isLogoOverlayEnabled(src?: string) {
  return Boolean(src && typeof src === 'string' && src.length > 0);
}

export function shouldUseBlend(logoWebmAlphaSrc?: string) {
  return !isLogoOverlayEnabled(logoWebmAlphaSrc);
}

// Build a robust mailto URL (used by ContactForm)
export function buildMailto(to: string, subject: string, body: string) {
  const enc = (s: string) => encodeURIComponent(s).replace(/%20/g, "+");
  return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
}


// Works helpers
export function uniqueTags(items: { tags: string[] }[]): string[] {
  const s = new Set<string>();
  for (const it of items) for (const t of it.tags) s.add(t);
  return Array.from(s);
}

export function filterByTag<T extends { tags: string[] }>(items: T[], tag: string): T[] {
  if (!tag || tag === 'All') return items;
  return items.filter((it) => it.tags.includes(tag));
}

// Inline tests (run only under Vitest). Safe in normal builds.
// @vitest-environment jsdom
void (async () => {
  // Guard for non-test environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta: any = import.meta as any;
  if (!meta || !meta.vitest) return;

  // Existing tests — do not modify
  // @ts-ignore
  test("formatBlur clamps negatives to 0", () => {
    // @ts-ignore
    expect(formatBlur(-3)).toBe("blur(0px)");
  });
  // @ts-ignore
  test("formatBlur formats integer px", () => {
    // @ts-ignore
    expect(formatBlur(5)).toBe("blur(5px)");
  });
  // @ts-ignore
  test("formatBlur handles NaN as 0", () => {
    // @ts-ignore
    expect(formatBlur(Number.NaN)).toBe("blur(0px)");
  });

  // Additional tests (existing additions)
  // @ts-ignore
  test("formatBlur keeps float precision", () => {
    // @ts-ignore
    expect(formatBlur(2.5)).toBe("blur(2.5px)");
  });
  // @ts-ignore
  test("formatBlur clamps Infinity to 0", () => {
    // @ts-ignore
    expect(formatBlur(Number.POSITIVE_INFINITY)).toBe("blur(0px)");
  });

  // @ts-ignore
  test("mapRangeClamped maps center to center", () => {
    // @ts-ignore
    expect(mapRangeClamped(0.5, 0, 1, 10, 20)).toBe(15);
  });
  // @ts-ignore
  test("mapRangeClamped clamps below", () => {
    // @ts-ignore
    expect(mapRangeClamped(-1, 0, 1, 10, 20)).toBe(10);
  });
  // @ts-ignore
  test("mapRangeClamped clamps above", () => {
    // @ts-ignore
    expect(mapRangeClamped(2, 0, 1, 10, 20)).ToBe // intentionally wrong casing would fail — keep existing tests unchanged
    expect(mapRangeClamped(2, 0, 1, 10, 20)).toBe(20);
  });
  // @ts-ignore
  test("mapRangeClamped handles bad input range", () => {
    // @ts-ignore
    expect(mapRangeClamped(0.5, 1, 1, 10, 20)).toBe(10);
  });

  // New tests for logo overlay enable check
  // @ts-ignore
  test("isLogoOverlayEnabled returns true for non-empty string", () => {
    // @ts-ignore
    expect(isLogoOverlayEnabled("/media/logo.mp4")).toBe(true);
  });
  // @ts-ignore
  test("isLogoOverlayEnabled returns false for empty or undefined", () => {
    // @ts-ignore
    expect(isLogoOverlayEnabled("")).toBe(false);
    // @ts-ignore
    expect(isLogoOverlayEnabled(undefined)).toBe(false);
  });

  // New tests for shouldUseBlend
  // @ts-ignore
  test("shouldUseBlend is false when webm alpha provided", () => {
    // @ts-ignore
    expect(shouldUseBlend("/media/logo_alpha.webm")).toBe(false);
  });
  // @ts-ignore
  test("shouldUseBlend is true when webm alpha missing", () => {
    // @ts-ignore
    expect(shouldUseBlend(undefined)).toBe(true);
  });

  // New tests for uniqueTags / filterByTag
  // @ts-ignore
  test("uniqueTags returns distinct tags", () => {
    // @ts-ignore
    expect(uniqueTags([{ tags: ["a", "b"] }, { tags: ["b", "c"] }]).sort()).toEqual(["a", "b", "c"]);
  });
  // @ts-ignore
  test("filterByTag returns all for 'All'", () => {
    // @ts-ignore
    const items = [{ tags: ["x"] }, { tags: ["y"] }];
    // @ts-ignore
    expect(filterByTag(items, "All").length).toBe(2);
  });
  // @ts-ignore
  test("filterByTag filters by exact tag", () => {
    // @ts-ignore
    const items = [{ tags: ["x"] }, { tags: ["y", "x"] }, { tags: ["z"] }];
    // @ts-ignore
    expect(filterByTag(items, "x").length).toBe(2);
  });

  // New tests for asset() helper
  // @ts-ignore
  test("asset returns /media/... by default", () => {
    // @ts-ignore
    expect(asset("x.jpg")).toBe("/media/x.jpg");
  });
  // @ts-ignore
  test("asset respects <base href>", () => {
    const base = document.createElement('base');
    base.setAttribute('href', '/app/');
    document.head.append(base);
    // @ts-ignore
    expect(asset("y.png")).toBe("/app/media/y.png");
    base.remove();
  });
})();
