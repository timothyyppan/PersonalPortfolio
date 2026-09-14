import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Timothy Pan is, and what he is building.',
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <h1 className="text-3xl">About</h1>

      <div className="mt-8 max-w-prose space-y-5 leading-relaxed text-inkSoft">
        <p>
          _Placeholder: how you got into engineering, what you are studying, and what you are most
          drawn to building._
        </p>
        <p>
          _Placeholder: the thread connecting your work — silicon, machine learning, robotics. What
          makes a problem interesting enough for you to take it on._
        </p>
        <p>
          _Placeholder: golf. How long you have played, what keeps you coming back, and whether it
          has anything to do with how you think about engineering._
        </p>
      </div>

      <a
        href="/TimothyPanResume.pdf"
        download
        className="mt-10 inline-block border border-ink px-5 py-2.5 text-sm"
      >
        Download my resume
      </a>
    </div>
  );
}
