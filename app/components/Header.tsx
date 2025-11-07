"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "PAPERS", isActive: (pathname: string) => pathname === "/" || pathname.startsWith("/papers") },
  { href: "/authors", label: "AUTHORS", isActive: (pathname: string) => pathname.startsWith("/authors") },
  { href: "/sessions", label: "SESSIONS", isActive: (pathname: string) => pathname.startsWith("/sessions") },
  { href: "/search", label: "SEARCH", isActive: (pathname: string) => pathname.startsWith("/search") },
  { href: "/about", label: "ABOUT", isActive: (pathname: string) => pathname.startsWith("/about") },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full bg-[#1a73e8] text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-wide">ICA Explorer</Link>
        <nav className="flex gap-5 text-sm uppercase tracking-wide">
          {links.map((l) => {
            const active = l.isActive ? l.isActive(pathname) : pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "font-semibold" : "opacity-80 hover:opacity-100"}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="opacity-80 hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.26.79-.58v-2.06c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.73 1.26 3.4.96.1-.76.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.2-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.68 5.4-5.25 5.68.42.36.79 1.07.79 2.16v3.2c0 .33.21.69.8.58A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
        </a>
      </div>
    </header>
  );
}


