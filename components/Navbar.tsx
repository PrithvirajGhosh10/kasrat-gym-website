
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Trainers", href: "/trainers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
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
  const navbarRef = useRef<HTMLElement>(null);

  const isLoginPage =
    pathname === "/login" ||
    pathname.startsWith("/member/login") ||
    pathname.startsWith("/member/register");

  const closeMenus = () => {
    setOpen(false);
    setLoginOpen(false);
  };

  // Close menus when clicking outside the Navbar
  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        closeMenus();
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  // Close menus when pressing Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenus();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="site-header" ref={navbarRef}>
      <div className="nav-wrap container">

        {/* BRAND */}
        <Link
          href="/"
          className="brand"
          onClick={closeMenus}
        >
          <span className="brand-mark">K</span>

          <span className="brand-copy">
            <strong>KASRAT</strong>
            <small>Naihati</small>
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className="menu-toggle"
          onClick={() => {
            setOpen((previous) => !previous);
            setLoginOpen(false);
          }}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <nav
          id="main-navigation"
          className={open ? "nav-links open" : "nav-links"}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "active" : ""}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMenus}
              >
                {link.label}
              </Link>
            );
          })}

          {/* LOGIN DROPDOWN */}
          <div className="login-dropdown">
            <button
              type="button"
              className={
                isLoginPage
                  ? "login-dropdown-toggle active"
                  : "login-dropdown-toggle"
              }
              onClick={() =>
                setLoginOpen((previous) => !previous)
              }
              aria-expanded={loginOpen}
              aria-haspopup="true"
              aria-controls="login-dropdown-menu"
            >
              <span>Login</span>

              <span
                className={
                  loginOpen
                    ? "login-arrow rotated"
                    : "login-arrow"
                }
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {loginOpen && (
              <div
                id="login-dropdown-menu"
                className="login-dropdown-menu"
              >
                {loginLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMenus}
                  >
                    {link.label}
                    <span aria-hidden="true">↗</span>
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
