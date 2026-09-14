'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header>
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-y-2">
          <Link href="/" className="text-base">
            Timothy Pan
          </Link>
          <nav className="flex gap-5 text-sm text-inkSoft">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'text-ink underline underline-offset-4' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <a href="/TimothyPanResume.pdf" download>
              Resume
            </a>
          </nav>
        </div>
        <div className="mt-3 h-0.5 w-16 bg-flag" />
      </div>
    </header>
  );
}
