import React, { useMemo, useState, useEffect, type CSSProperties } from "react";

export default function PortfolioLanding() {
  const [activeTab, setActiveTab] = useState("TouchDesigner");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const projects = useMemo(
    () => [
      {
        id: "td01",
        title: "Reactive Light Wall",
        category: "TouchDesigner",
        tags: ["TD", "GLSL", "OSC"],
        role: "Design / Dev",
        thumb:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230b1020'/><stop offset='100%' stop-color='%23121a33'/></linearGradient></defs><rect fill='url(%23g)' width='1200' height='675'/><circle cx='300' cy='240' r='180' fill='%234ea2ff' opacity='0.35'/><circle cx='900' cy='450' r='220' fill='%237bc7ff' opacity='0.25'/></svg>",
        preview: undefined,
      },
      {
        id: "un01",
        title: "Immersive Room – Unreal",
        category: "Unreal",
        tags: ["Unreal", "Niagara"],
        role: "Tech Art",
        thumb:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect width='1200' height='675' fill='%23121a33'/><rect width='1200' height='675' fill='none' stroke='%234ea2ff' stroke-width='18'/><path d='M200 520 L600 180 L1000 520' stroke='%234ea2ff' stroke-width='6' fill='none' /></svg>",
        preview: undefined,
      },
      {
        id: "inst01",
        title: "Kinetic Sculpture – Installation",
        category: "Installations",
        tags: ["UWB-RTLS", "IMU", "Custom HW"],
        role: "Interaction / HW",
        thumb:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect width='1200' height='675' fill='%230b1020'/><circle cx='600' cy='338' r='250' fill='none' stroke='%237bc7ff' stroke-width='10' opacity='0.6'/><circle cx='600' cy='338' r='130' fill='none' stroke='%234ea2ff' stroke-width='8' opacity='0.9'/></svg>",
        preview: undefined,
      },
      {
        id: "td02",
        title: "Compute Shader Particles",
        category: "TouchDesigner",
        tags: ["GLSL", "Compute"],
        role: "Shader Dev",
        thumb:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect width='1200' height='675' fill='%23121a33'/><g fill='%23ffffff' opacity='0.8'><circle cx='200' cy='120' r='2'/><circle cx='260' cy='220' r='2'/><circle cx='400' cy='340' r='2'/><circle cx='800' cy='200' r='2'/><circle cx='1000' cy='500' r='2'/></g><g fill='%234ea2ff'><circle cx='300' cy='160' r='3'/><circle cx='450' cy='380' r='3'/><circle cx='820' cy='280' r='3'/></g></svg>",
        preview: undefined,
      },
    ],
    []
  );

  const categories = ["TouchDesigner", "Unreal", "Installations", "Etc"] as const;

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-100 relative">
      <GradientBG />

      <div className="relative z-10">
        <Header />

        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 text-xs mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Interactive Media Artist
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight">Hwang Su Jong</h1>
            <p className="mt-4 text-slate-300 leading-relaxed max-w-xl">
              빛, 소리, 그리고 움직임을 결합한 전반적인 인터랙티브 콘텐츠를 기획하고 개발합니다
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#works" className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-4 py-3 font-medium hover:bg-slate-100">View Works</a>
              <a href="#contact" className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-medium hover:bg-slate-800">Contact</a>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
              <ExternalLink
                href="https://www.instagram.com/hwangsujong82/"
                className="hover:text-white"
                ariaLabel="Instagram (opens in a new tab)"
              >
                Instagram
              </ExternalLink>
              <ExternalLink
                href="https://www.youtube.com/@Hanghae_4"
                className="hover:text-white"
                ariaLabel="YouTube (opens in a new tab)"
              >
                YouTube
              </ExternalLink>
            </div>

          </div>

          <div className="relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <video
                className="h-full w-full object-cover"
                autoPlay={mounted && prefersMotion()}
                muted
                loop
                playsInline
                preload="metadata"
                poster="data:image/svg+xml;utf8,<svg ...>Loop preview</text></svg>"
              >
                {/* WebM이 있으면 우선 사용, 없으면 MP4로 재생 */}
                <source src="/hero.webm" type="video/webm" />
                <source src="/hero.mp4"  type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent flex items-center gap-3">
                <div className="h-1 w-full rounded bg-slate-700">
                  <div className="h-1 w-1/3 rounded bg-blue-500" />
                </div>
                <span className="text-xs text-slate-300">00:06 loop</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400"></p>
          </div>
        </section>

        <section className="border-y border-slate-800/60 bg-slate-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-sm text-slate-300">
            {["Media Art", "Media Performance", "New Form Art", "Game"].map((l) => (
              <div key={l} className="opacity-80 hover:opacity-100 transition">{l}</div>
            ))}
          </div>
        </section>

        <section id="works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Selected Works</h2>
              <p className="mt-2 text-slate-300 max-w-2xl">A grid of recent pieces across TouchDesigner, Unreal, and installation projects.</p>
            </div>
            <Tabs value={activeTab} onChange={setActiveTab} items={categories} />
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter((p) => (activeTab === "Etc" ? true : p.category === activeTab))
              .map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}

          </div>
        </section>

        <section id="about" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">About</h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            I am an interactive media artist creating immersive and reactive installations that combine light, sound, and motion.
            Focus areas: TouchDesigner, UWB-RTLS, GLSL, and experiential content.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs text-blue-300">
            {["TouchDesigner", "UWB-RTLS", "GLSL", "Immersive", "Real-time"].map((t) => (
              <li key={t} className="rounded-full border border-blue-700/40 bg-blue-500/10 px-2.5 py-1">{t}</li>
            ))}
          </ul>
        </section>

        <section id="contact" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact</h2>
          <p className="mt-2 text-slate-300">Preferred channel: email — <a className="underline decoration-blue-500/60 underline-offset-4 hover:text-white" href="mailto:hello@example.com">hello@example.com</a></p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <Field label="Name"><input className={inputCls()} placeholder="Your name" required /></Field>
            <Field label="Email"><input type="email" className={inputCls()} placeholder="you@domain.com" required /></Field>
            <Field label="Budget" span>
              <select className={inputCls()} defaultValue="">
                <option value="" disabled>Select a range</option>
                <option>Under $2k</option>
                <option>$2k–$5k</option>
                <option>$5k–$10k</option>
                <option>$10k+</option>
              </select>
            </Field>
            <Field label="Timeline" span><input className={inputCls()} placeholder="e.g., Jan–Feb" /></Field>
            <Field label="Message" span>
              <textarea className={inputCls("min-h-[120px]")} placeholder="Project summary..." />
            </Field>
            <div className="sm:col-span-2 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">We use your info solely to respond to your inquiry and delete it after a reasonable period.</p>
              <button className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 font-medium">Send</button>
            </div>
          </form>
        </section>

        <footer className="border-t border-slate-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <Logo small />
              <span>© {new Date().getFullYear()} Hwang Su Jong</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="#about" className="hover:text-white">About</a>
              <a href="#works" className="hover:text-white">Works</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============ UI PARTS ============ */
function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[#06080f]/80 border-b border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a className="hover:text-white" href="#works">Works</a>
          <a className="hover:text-white" href="#about">About</a>
          <a className="hover:text-white" href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

function Tabs({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: readonly string[] }) {
  return (
    <div role="tablist" className="inline-flex rounded-xl border border-slate-800 bg-slate-900/40 p-1">
      {items.map((it) => (
        <button
          key={it}
          role="tab"
          aria-selected={value === it}
          onClick={() => onChange(it)}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${value === it ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-video">
        {project.preview ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay={hover && prefersMotion()}
            muted
            loop
            playsInline
            preload="metadata"
            src={project.preview}
          />
        ) : (
          <img alt="thumbnail" className="absolute inset-0 h-full w-full object-cover" src={project.thumb} />
        )}
        <div className="absolute left-2 top-2 rounded-full bg-slate-950/60 px-2 py-1 text-[10px] border border-slate-700/70">
          {project.category}
        </div>
      </div>
      <div className="p-4">
        <p className="font-medium text-slate-100 line-clamp-2">{project.title}</p>
        <p className="mt-1 text-xs text-slate-400">{project.role} · {project.tags.join(" / ")}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-blue-300 font-semibold">Case study</span>
          <button className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800">Open</button>
        </div>
      </div>
    </article>
  );
}

function Field({ label, children, span = false }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <label className={span ? "sm:col-span-2" : undefined}>
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      {children}
    </label>
  );
}

function inputCls(extra = "") {
  return `w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${extra}`;
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`relative ${small ? "h-6 w-6" : "h-8 w-8"}`} aria-hidden>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400" />
      <div className="absolute inset-0 rounded-xl bg-[conic-gradient(at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
    </div>
  );
}

function GradientBG() {
  const style: CSSProperties = {
    background: `
      radial-gradient(900px 450px at 20% 18%, rgba(64,145,255,0.18), transparent 60%),
      radial-gradient(900px 450px at 82% 24%, rgba(21,150,235,0.14), transparent 60%),
      radial-gradient(800px 400px at 75% 78%, rgba(44,119,255,0.12), transparent 60%),
      linear-gradient(#06080f, #06080f)
    `,
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0" style={style} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(120%_160%_at_50%_50%,transparent_58%,rgba(2,6,23,0.6)_100%)]" />
    </>
  );
}

function prefersMotion() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ExternalLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      {children}
    </a>
  );
}
