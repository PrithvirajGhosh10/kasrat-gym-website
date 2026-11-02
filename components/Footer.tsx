
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <Link href="/" className="brand footer-brand">
          <span className="brand-mark">K</span>
          <span className="brand-copy">
            <strong>KASRAT</strong>
            <small>FITNESS CLUB</small>
          </span>
        </Link>

        <p>
          Stronger together. Train with purpose,
          grow with discipline.
        </p>

        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/trainers">Trainers</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/contact">Get in Touch</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © 2026 KASRAT Fitness Club.
          All rights reserved.
        </span>
        <span>TRAIN. TRANSFORM. THRIVE.</span>
      </div>
    </footer>
  );
}
