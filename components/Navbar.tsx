
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Programs", href: "/#programs" },
  { label: "Trainers", href: "/trainers" },
  { label: "Gallery", href: "/gallery" },
];

const loginLinks = [
  { label: "Owner Login", href: "/login" },
  { label: "Staff Login", href: "/login" },
  { label: "Member Login", href: "/member/login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="nav-wrap container">

        {/* BRAND */}
        <Link
          href="/"
          className="brand"
          onClick={() => {
            setOpen(false);
            setLoginOpen(false);
          }}
        >
          <span className="brand-mark">K</span>

          <span className="brand-copy">
            <strong>KASRAT</strong>
            <small>Naihati</small>
          </span>
        </Link>

        {/* MOBILE MENU */}
        <button
          className="menu-toggle"
          onClick={() => {
            setOpen(!open);
            setLoginOpen(false);
          }}
          aria-label="Toggle navigation"
          aria-expanded={open}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <nav className={open ? "nav-links open" : "nav-links"}>

          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              onClick={() => {
                setOpen(false);
                setLoginOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* LOGIN BUTTON AND DROPDOWN */}
          <div className="login-dropdown">
            <button
              type="button"
              className="login-dropdown-toggle"
              onClick={() => setLoginOpen(!loginOpen)}
              aria-expanded={loginOpen}
            >
              <span>Login</span>

              <span
                className={
                  loginOpen
                    ? "login-arrow rotated"
                    : "login-arrow"
                }
              >
                ▾
              </span>
            </button>

            {loginOpen && (
              <div className="login-dropdown-menu">
                {loginLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      setOpen(false);
                      setLoginOpen(false);
                    }}
                  >
                    {link.label}
                    <span>↗</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </nav>
      </div>
    </header>
  );
}
