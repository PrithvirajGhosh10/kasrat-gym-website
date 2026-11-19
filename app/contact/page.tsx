
export default function ContactPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <p className="section-label">GET IN TOUCH</p>
          <h1>CONTACT US</h1>
          <p>
            Ready to start your fitness journey?
            Visit KASRAT and take the first step.
          </p>
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section className="section container">
        <div className="contact-layout">
          <div className="contact-details">
            <p className="section-label">VISIT OUR GYM</p>
            <h2>Find Us Here</h2>

            <div className="contact-line">
              <h3>Address</h3>
              <p>
                <strong>KASRAT</strong><br />
                    Naihati Urban, Bijaynagar,<br />
                    Naihati – 743165,<br />
                    West Bengal, India.
              </p>
            </div>

            <div className="contact-line">
              <h3>Phone</h3>
              <p>+91 70037 55107</p>
            </div>

            <div className="contact-line">
              <h3>Email</h3>
              <p>palashkumarshaw96@gmail.com</p>
            </div>

            <div className="contact-line">
              <h3>Opening Hours</h3>
              <p>
                Check the latest timings on Google Maps.
              </p>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=22.8877461%2C88.4238405"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-gold"
            >
              Get Directions ↗
            </a>
          </div>

          {/* GOOGLE MAP */}
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps?q=22.8877461,88.4238405&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="KASRAT Gym Location"
            />
          </div>
        </div>
      </section>
    </>
  );
}
