import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Timothy Pan is, and what he is building.',
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Reveal>
        <h1 className="text-3xl">About</h1>
      </Reveal>

      <div className="mt-8 max-w-prose space-y-5 leading-relaxed text-inkSoft">
        <Reveal delay={0.08}>
          <p>
            _Placeholder: how you got into engineering, what you are studying, and what you are
            most drawn to building._
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <p>
            _Placeholder: the thread connecting your work — silicon, machine learning, robotics.
            What makes a problem interesting enough for you to take it on._
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p>
            _Placeholder: what you enjoy outside of engineering, and the perspectives or routines
            that keep your work grounded._
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.26}>
        <a
          href="/TimothyPanResume.pdf"
          download
          className="mt-10 inline-block border border-ink px-5 py-2.5 text-sm transition-colors duration-200 hover:bg-ink hover:text-card"
        >
          Download my resume
        </a>
      </Reveal>
    </div>
  );
}
