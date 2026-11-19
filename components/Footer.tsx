
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Trainers", href: "/trainers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        {/* BRAND */}
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">K</span>

            <span className="brand-copy">
              <strong>KASRAT</strong>
              <small>Naihati</small>
            </span>
          </Link>

          <p>
            Stronger together. Train with purpose,
            grow with discipline.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3
            style={{
              color: "#c9a44c",
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "18px",
            }}
          >
            QUICK LINKS
          </h3>

          <div className="footer-links">
            {footerLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* MEMBER ACCESS */}
        <div>
          <h3
            style={{
              color: "#c9a44c",
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "18px",
            }}
          >
            MEMBER ACCESS
          </h3>

          <div className="footer-links">
            <Link href="/login">Owner / Staff Login</Link>
            <Link href="/member/login">Member Login</Link>
            <Link href="/member/register">Member Registration</Link>
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <h3
            style={{
              color: "#c9a44c",
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "18px",
            }}
          >
            VISIT US
          </h3>

          <div className="footer-links">
            <span>KASRAT, Naihati</span>

            <Link href="/contact">
              Get in Touch ↗
            </Link>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="container footer-bottom">
        <span>
          © 2026 KASRAT Fitness Club. All rights reserved.
        </span>

        <span>TRAIN. TRANSFORM. THRIVE.</span>
      </div>
    </footer>
  );
}
