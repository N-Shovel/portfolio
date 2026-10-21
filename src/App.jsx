import { useState } from 'react';
import Nav from './components/Nav.jsx';
import Chat from './components/Chat.jsx';
import { projects, personalProjects, skills, EMAIL, LINKEDIN, GITHUB } from './data.js';

const ext = { target: '_blank', rel: 'noopener' };

function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-8 border-t border-line pt-14 pb-2">
      <h2 className="mb-7 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Project({ p }) {
  return (
    <article className="group">
      <a href={p.links[0][1]} {...ext} tabIndex={-1} className="mb-3.5 block aspect-[16/10] overflow-hidden rounded-[10px] border border-line bg-surface">
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
      <p className="mt-2.5 font-mono text-xs text-muted opacity-85">{p.stack.join(' · ')}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem]">
        {p.links.map(([label, url]) => <a key={url} href={url} {...ext} className="link">{label}</a>)}
      </p>
    </article>
  );
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Nav />
      <main id="top" className="mx-auto max-w-[760px] px-5">
        <section className="pt-10 pb-10 sm:pt-[72px]">
          <img src="/assets/rody.png" alt="Portrait of Nimrod Pala" width="88" height="88" className="mb-6 size-[88px] rounded-full object-cover" />
          <h1 className="text-[2rem] font-semibold tracking-tight">Nimrod Pala</h1>
          <p className="mt-1 mb-5 text-muted">Full-stack developer · CS student at Caraga State University</p>
          <p className="mb-4 max-w-[56ch] text-lg">I build things to understand how they work: web apps, desktop tools, games and visualizers. You can call me Rody.</p>
          <p className="mb-6 flex items-center gap-2 text-sm text-muted">
            <span className="size-[7px] rounded-full bg-accent" />Open to remote commissions
          </p>
          <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[0.95rem]">
            <li><a href={`mailto:${EMAIL}`} className="link">Email</a></li>
            <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
            <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
            <li><button onClick={() => setChatOpen(true)} className="cursor-pointer text-accent hover:underline underline-offset-[3px]">Ask my assistant</button></li>
          </ul>
        </section>

        <Section id="work" title="Selected work">
          <div className="grid gap-x-7 gap-y-11 sm:grid-cols-2">
            {projects.map((p) => <Project key={p.name} p={p} />)}
          </div>

          <h3 className="mt-13 mb-2 text-[0.95rem] font-semibold">Personal projects</h3>
          <ul>
            {personalProjects.map(([name, desc]) => (
              <li key={name} className="flex flex-col gap-0.5 border-b border-line py-3 text-[0.93rem] sm:flex-row sm:justify-between sm:gap-4">
                <span>{name}</span>
                <span className="text-muted sm:text-right">{desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.93rem]"><a href={`${GITHUB}?tab=repositories`} {...ext} className="link">All projects on GitHub →</a></p>
        </Section>

        <Section id="about" title="About">
          <div className="max-w-[60ch] space-y-4">
            <p>I'm a 3rd-year Computer Science student from Butuan City, graduating in 2028. What keeps me coding is curiosity: I like opening up how something works, whether it's a pointer in C, a render loop in Three.js or the database behind a booking system, and then building my own version.</p>
            <p>Most of what I know comes from building projects. Next I'm learning Python, and after graduating I want to build physical things with my own hands and write the code that runs them.</p>
            <p className="text-muted">Away from the keyboard I play competitive chess and read One Piece.</p>
          </div>
          <dl className="mt-7 grid gap-2.5 text-[0.93rem]">
            {skills.map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[110px_1fr] sm:gap-4">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="contact" title="Contact">
          <p className="max-w-[60ch]">Have a project in mind? I'm taking remote commissions while I study.</p>
          <p className="mt-2 mb-4 text-[clamp(1.25rem,4vw,1.6rem)] font-medium break-words">
            <a href={`mailto:${EMAIL}`} className="link">{EMAIL}</a>
          </p>
          <ul className="flex gap-[22px] text-[0.95rem]">
            <li><a href={LINKEDIN} {...ext} className="link">LinkedIn</a></li>
            <li><a href={GITHUB} {...ext} className="link">GitHub</a></li>
          </ul>
        </Section>
      </main>

      <footer className="mx-auto mt-16 max-w-[760px] px-5 pt-7 pb-12 text-sm text-muted">
        © {new Date().getFullYear()} Nimrod P. Pala
      </footer>

      <Chat open={chatOpen} setOpen={setChatOpen} />
    </>
  );
}
