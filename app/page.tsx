import Link from 'next/link';
import { getEntries } from '@/lib/content';
import { Scorecard } from '@/components/Scorecard';

export default function HomePage() {
  const projects = getEntries('projects');

  return (
    <div className="py-12">
      <section>
        <h1 className="max-w-prose text-4xl leading-[1.15] tracking-tight sm:text-5xl">
          Engineer. Builder. Problem solver.
        </h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-inkSoft">
          Computer engineering at Waterloo. Previously at Apple, where I rebuilt packaging test
          specifications on a terabyte of real shipment telemetry. I work across machine learning,
          silicon, and robotics.
        </p>
        <p className="mt-4 max-w-prose leading-relaxed text-inkSoft">
          _Placeholder: one or two sentences in your own voice — what you care about building and
          the kinds of problems you want to solve._
        </p>
      </section>

      <div className="mt-12">
        <Scorecard collection="projects" entries={projects} />
      </div>

      <div className="mt-6 flex flex-wrap gap-5 text-sm">
        <Link href="/projects" className="underline underline-offset-4">
          Every project
        </Link>
        <Link href="/experience" className="underline underline-offset-4">
          Where I have worked
        </Link>
        <a href="/TimothyPanResume.pdf" download className="underline underline-offset-4">
          Download my resume
        </a>
      </div>
    </div>
  );
}
