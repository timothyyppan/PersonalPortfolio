import Link from 'next/link';
import { getEntries } from '@/lib/content';
import { Scorecard } from '@/components/Scorecard';
import { Reveal } from '@/components/Reveal';

export default function HomePage() {
  const projects = getEntries('projects');

  return (
    <div className="py-12">
      <section>
        <Reveal>
          <h1 className="max-w-prose text-4xl leading-[1.15] tracking-tight sm:text-5xl">
            Engineer. Builder. Problem solver.
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-inkSoft">
            Computer engineering at Waterloo. Previously at Apple, where I rebuilt packaging test
            specifications on a terabyte of real shipment telemetry. I work across machine
            learning, silicon, and robotics.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-prose leading-relaxed text-inkSoft">
            _Placeholder: one or two sentences in your own voice — what you care about building
            and the kinds of problems you want to solve._
          </p>
        </Reveal>
      </section>

      <Reveal delay={0.1} className="mt-12">
        <Scorecard collection="projects" entries={projects} />
      </Reveal>

      <Reveal delay={0.1} className="mt-6 flex flex-wrap gap-5 text-sm">
        <Link
          href="/projects"
          className="underline underline-offset-4 transition-colors duration-200 hover:text-flag"
        >
          Every project
        </Link>
        <Link
          href="/experience"
          className="underline underline-offset-4 transition-colors duration-200 hover:text-flag"
        >
          Where I have worked
        </Link>
        <a
          href="/TimothyPanResume.pdf"
          download
          className="underline underline-offset-4 transition-colors duration-200 hover:text-flag"
        >
          Download my resume
        </a>
      </Reveal>
    </div>
  );
}
