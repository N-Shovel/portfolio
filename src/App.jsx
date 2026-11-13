import { useState } from 'react';
import Nav from './components/Nav.jsx';
import Chat from './components/Chat.jsx';
import Background from './components/Background.jsx';
import { projects, moreProjects, skills, EMAIL, LINKEDIN, GITHUB, RESUME } from './data.js';

const ext = { target: '_blank', rel: 'noopener' };

// Sections share one solid sheet laid over the sakura scene, divided by hairlines.
function Section({ id, title, children }) {
  return (
    <section id={id} className="border-t border-line py-12 first:border-t-0 sm:py-16">
      <h2 className="mb-8 font-serif text-2xl font-semibold sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

// The featured project takes a 2x2 cell on wide screens; its image fills whatever height the text leaves.
function Project({ p, featured }) {
  return (
    <article className={`flex flex-col ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
      <a href={p.links[0][1]} {...ext} tabIndex={-1} className={`relative mb-3.5 block aspect-[16/10] overflow-hidden rounded-md border border-line bg-surface ${featured ? 'lg:aspect-auto lg:flex-1' : ''}`}>
        <img
          src={`/assets/projects/${p.image}`}
          alt={p.alt}
          loading="lazy"
          className={`h-full w-full object-cover object-top ${featured ? 'lg:absolute lg:inset-0' : ''}`}
        />
      </a>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{p.name}</h3>
        <span className="whitespace-nowrap text-xs text-muted">{p.meta}</span>
      </div>
      <p className="text-[0.93rem] text-muted">{p.description}</p>
      {/* mt-auto keeps the stack and links aligned along the bottom of each row */}
      <div className="mt-auto pt-2.5">
        <p className="text-xs text-muted">{p.stack.join(', ')}</p>
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
        {/* The intro fills the first screen so the scene shows in full before the sheet. */}
        <section className="relative flex min-h-[calc(100svh-61px)] flex-col pt-6 pb-28 md:pt-20">
          <div id="intro" className="legible max-w-2xl max-md:border max-md:border-line max-md:bg-bg max-md:p-5">
            <div className="mb-6 flex items-center gap-4 md:mb-7 md:gap-5">
              {/* 224px files: twice the largest display size, for sharp high-density screens */}
              <picture className="shrink-0">
                <source srcSet="/assets/rody.avif" type="image/avif" />
                <img src="/assets/rody.webp" alt="Portrait of Nimrod Pala" width="112" height="112" className="block size-16 rounded-full border border-line object-cover md:size-28" />
              </picture>
              <div>
                <h1 className="font-serif text-[2rem] leading-tight font-semibold tracking-tight md:text-6xl">Nimrod Pala</h1>
                <p className="mt-1.5 text-sm text-muted md:text-lg">Full-stack and game developer, CS student at Caraga State University</p>
              </div>
            </div>
            <p className="mb-5 max-w-[46ch] sm:text-lg md:text-xl">I build things to understand how they work: web apps, desktop tools, games and visualizers. You can call me Rody.</p>
            <p className="mb-6 text-sm text-muted">Open to remote commissions</p>
            <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[0.95rem]">
              <li><a href={`mailto:${EMAIL}`} className="link">Email</a></li>
              <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
              <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
              <li><a href={RESUME} {...ext} className="link">Resume</a></li>
            </ul>
          </div>
          <a href="#work" className="link legible absolute bottom-8 left-0 text-sm">
            Selected work <span aria-hidden="true">↓</span>
          </a>
        </section>

        {/* Full-bleed on small screens; a bordered column with the scene at both sides on wide ones. */}
        <div className="-mx-5 border-y border-line bg-bg px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:border-x lg:px-12">
        <Section id="work" title="Selected work">
          <div className="grid gap-x-7 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => <Project key={p.name} p={p} featured={i === 0} />)}
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
              <p>I'm a 3rd-year Computer Science student from Butuan City, graduating in 2028. I like opening things up to see how they work and then building my own version. So far that has been pointers in C, a render loop in Three.js and the database behind a booking system.</p>
              <p>Most of what I know comes from building projects. Next I'm learning Python, and after graduating I want to build physical things with my own hands and write the code that runs them.</p>
              <p className="text-muted">I also play competitive chess and read One Piece.</p>
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
          <p className="max-w-[60ch]">I'm taking remote commissions while I study. Email me at</p>
          <p className="mt-2 mb-4 text-[clamp(1.25rem,4vw,1.6rem)] font-medium break-words">
            <a href={`mailto:${EMAIL}`} className="link">{EMAIL}</a>
          </p>
          <ul className="flex gap-[22px] text-[0.95rem]">
            <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
            <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
            <li><a href={RESUME} {...ext} className="link">Resume</a></li>
          </ul>
        </Section>
        </div>
      </main>

      <footer className="legible mx-auto max-w-6xl px-5 pt-8 pb-12 text-sm text-muted sm:px-8">
        © {new Date().getFullYear()} Nimrod P. Pala
      </footer>

      <Chat open={chatOpen} setOpen={setChatOpen} />
    </>
  );
}
