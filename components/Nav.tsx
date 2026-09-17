import Link from 'next/link';

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#projects', label: 'Projects' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-card">
      <div className="mx-auto max-w-4xl px-4 pb-3 pt-6 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
          <Link href="/" className="text-base transition-colors duration-200 hover:text-flag">
            Timothy Pan
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-inkSoft">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/TimothyPanResume.pdf"
              download
              className="transition-colors duration-200 hover:text-ink"
            >
              Resume
            </a>
          </nav>
        </div>
        <div className="mt-3 h-0.5 w-16 bg-flag" />
      </div>
    </header>
  );
}
