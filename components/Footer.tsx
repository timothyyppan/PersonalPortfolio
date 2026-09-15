export function Footer() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-y-2 px-6 py-8 text-sm text-inkSoft">
        <span>© {new Date().getFullYear()} Timothy Pan</span>
        <div className="flex gap-5">
          <a
            href="https://github.com/timothyyppan"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-200 hover:text-ink"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/timothyyppan"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-200 hover:text-ink"
          >
            LinkedIn
          </a>
          <a href="mailto:tjmpan@uwaterloo.ca" className="transition-colors duration-200 hover:text-ink">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
