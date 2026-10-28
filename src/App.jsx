import { useState } from 'react';
import Nav from './components/Nav.jsx';
import Chat from './components/Chat.jsx';
import Background from './components/Background.jsx';
import Blossom from './components/Blossom.jsx';
import { projects, moreProjects, skills, EMAIL, LINKEDIN, GITHUB, RESUME } from './data.js';

const ext = { target: '_blank', rel: 'noopener' };

// Content sections are frosted panels floating over the sakura scene.
function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-10 rounded-3xl border border-line bg-panel p-6 shadow-xl shadow-black/5 backdrop-blur-md sm:p-10">
      <h2 className="mb-8 flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        <Blossom className="size-3.5" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Project({ p }) {
  return (
    <article className="group flex flex-col">
      <a href={p.links[0][1]} {...ext} tabIndex={-1} className="mb-3.5 block aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface">
        <img
          src={`/assets/projects/${p.image}`}
          alt={p.alt}
          loading="lazy"
          className={`h-full w-full object-top transition-transform duration-400 group-hover:scale-[1.03] ${p.contain ? 'object-contain py-2.5' : 'object-cover'}`}
        />
      </a>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{p.name}</h3>
        <span className="whitespace-nowrap text-xs text-muted">{p.meta}</span>
      </div>
      <p className="text-[0.93rem] text-muted">{p.description}</p>
      {/* mt-auto keeps the stack and links aligned along the bottom of each row */}
      <div className="mt-auto pt-2.5">
        <p className="font-mono text-xs text-muted">{p.stack.join(' · ')}</p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem]">
          {p.links.map(([label, url]) => <a key={url} href={url} {...ext} className="link">{label}</a>)}
        </p>
      </div>
    </article>
  );
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Background />
      <Nav />
      <main id="top" className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* The intro fills the first screen so the scene shows in full before the panels. */}
        <section className="relative flex min-h-[calc(100svh-61px)] flex-col pt-6 pb-28 md:pt-20">
          <div id="intro" className="legible max-w-2xl max-md:rounded-2xl max-md:border max-md:border-line max-md:bg-panel max-md:p-5 max-md:backdrop-blur-md">
            <div className="mb-6 flex items-center gap-4 md:mb-7 md:gap-5">
              {/* 224px files: twice the largest display size, for sharp high-density screens */}
              <picture className="shrink-0">
                <source srcSet="/assets/rody.avif" type="image/avif" />
                <img src="/assets/rody.webp" alt="Portrait of Nimrod Pala" width="112" height="112" className="block size-16 rounded-full object-cover ring-2 ring-accent/60 ring-offset-2 ring-offset-bg md:size-28" />
              </picture>
              <div>
                <h1 className="font-serif text-[2rem] leading-tight font-semibold tracking-tight md:text-6xl">Nimrod Pala</h1>
                <p className="mt-1.5 text-sm text-muted md:text-lg">Full-stack and game developer · CS student at Caraga State University</p>
              </div>
            </div>
            <p className="mb-5 max-w-[46ch] sm:text-lg md:text-xl">I build things to understand how they work: web apps, desktop tools, games and visualizers. You can call me Rody.</p>
            <p className="mb-6 flex items-center gap-2 text-sm text-muted">
              <Blossom className="size-3.5 text-accent" />Open to remote commissions
            </p>
            <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[0.95rem]">
              <li><a href={`mailto:${EMAIL}`} className="link">Email</a></li>
              <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
              <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
              <li><a href={RESUME} {...ext} className="link">Resume</a></li>
            </ul>
          </div>
          <a href="#work" className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted backdrop-blur-md hover:text-fg motion-safe:animate-drift">
            Selected work <span aria-hidden="true">↓</span>
          </a>
        </section>

        <Section id="work" title="Selected work">
          <div className="grid gap-x-7 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <Project key={p.name} p={p} />)}
          </div>

          <h3 className="mt-13 mb-2 text-[0.95rem] font-semibold">More projects</h3>
          <ul>
            {moreProjects.map(([name, desc, url]) => (
              <li key={name} className="flex flex-col gap-0.5 border-b border-line py-3 text-[0.93rem] sm:flex-row sm:justify-between sm:gap-4">
                <span>{url ? <a href={url} {...ext} className="link">{name}</a> : name}</span>
                <span className="text-muted sm:text-right">{desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.93rem]"><a href={`${GITHUB}?tab=repositories`} {...ext} className="link">All projects on GitHub →</a></p>
        </Section>

        <Section id="about" title="About">
          <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-20">
            <div className="max-w-[60ch] space-y-4">
              <p>I'm a 3rd-year Computer Science student from Butuan City, graduating in 2028. What keeps me coding is curiosity: I like opening up how something works, whether it's a pointer in C, a render loop in Three.js or the database behind a booking system, and then building my own version.</p>
              <p>Most of what I know comes from building projects. Next I'm learning Python, and after graduating I want to build physical things with my own hands and write the code that runs them.</p>
              <p className="text-muted">Away from the keyboard I play competitive chess and read One Piece.</p>
            </div>
            <dl className="grid content-start gap-2.5 text-[0.93rem]">
              {skills.map(([k, v]) => (
                <div key={k} className="grid sm:grid-cols-[110px_1fr] sm:gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="contact" title="Contact">
          <p className="max-w-[60ch]">Have a project in mind? I'm taking remote commissions while I study.</p>
          <p className="mt-2 mb-4 text-[clamp(1.25rem,4vw,1.6rem)] font-medium break-words">
            <a href={`mailto:${EMAIL}`} className="link">{EMAIL}</a>
          </p>
          <ul className="flex gap-[22px] text-[0.95rem]">
            <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
            <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
            <li><a href={RESUME} {...ext} className="link">Resume</a></li>
          </ul>
        </Section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pt-10 pb-12 text-center sm:px-8">
        <span className="inline-block rounded-full border border-line bg-panel px-4 py-1.5 text-sm text-muted backdrop-blur-md">
          © {new Date().getFullYear()} Nimrod P. Pala
        </span>
      </footer>

      <Chat open={chatOpen} setOpen={setChatOpen} />
    </>
  );
}
