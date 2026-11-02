
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Programs", href: "/#programs" },
  { label: "Trainers", href: "/trainers" },
  { label: "Membership", href: "/#membership" },
  { label: "Gallery", href: "/gallery" },
  { label: "Get in Touch", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="nav-wrap container">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">K</span>
          <span className="brand-copy">
         <strong>KASRAT</strong>
        <small>Naihati</small>
        </span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            className="nav-cta"
            onClick={() => setOpen(false)}
          >
            Join Now ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}
