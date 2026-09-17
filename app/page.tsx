import { getEntries } from '@/lib/content';
import { COLLECTIONS } from '@/lib/collections';
import { Scorecard } from '@/components/Scorecard';
import { Reveal } from '@/components/Reveal';

export default function HomePage() {
  const experience = getEntries('experience');
  const projects = getEntries('projects');

  return (
    <div className="py-12">
      <section id="about" className="scroll-mt-28">
        <Reveal>
          <h1 className="max-w-prose text-4xl leading-[1.15] tracking-tight sm:text-5xl">
            I’m a T-shaped computer engineer. <br></br>I love computers but I also enjoy learning about different topics in new disciplines!
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-inkSoft">
            I’m a 4th Year Computer Engineering student at the University of Waterloo. <br></br> I work on software design, data pipelines,
            AI/ML/RL, RTL, and robotics.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-4 max-w-prose leading-relaxed text-inkSoft">
            <p>
              Throughout my previous experiences and projects, I’ve found that the biggest motivating factors that made me do my best work when:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Working on problems tied to my personal passions or hobbies</li>
              <li>Seeing my contributions create tangible, real-world impact</li>
              <li>Tackling unfamiliar challenges and learning something new</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mt-6 flex flex-wrap gap-5 text-sm">
          <a
            href="/TimothyPanResume.pdf"
            download
            className="underline underline-offset-4 transition-colors duration-200 hover:text-flag"
          >
            Feel free to download my resume
          </a>
        </Reveal>
      </section>

      <section id="experience" className="scroll-mt-28 mt-20 sm:mt-24">
        <Reveal>
          <h2 className="text-3xl">{COLLECTIONS.experience.label}</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <Scorecard collection="experience" entries={experience} />
        </Reveal>
      </section>

      <section id="projects" className="scroll-mt-28 mt-20 sm:mt-24">
        <Reveal>
          <h2 className="text-3xl">{COLLECTIONS.projects.label}</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <Scorecard collection="projects" entries={projects} />
        </Reveal>
      </section>
    </div>
  );
}
