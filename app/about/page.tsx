
import Link from "next/link";

const values = [
  {
    number: "01",
    title: "DISCIPLINE",
    description:
      "Progress comes from showing up consistently, staying focused and never giving up on your goals.",
  },
  {
    number: "02",
    title: "STRENGTH",
    description:
      "Build physical strength, confidence and the mindset to push beyond your limits.",
  },
  {
    number: "03",
    title: "COMMUNITY",
    description:
      "Be part of a motivating fitness environment where every member's journey matters.",
  },
];

export default function AboutPage() {
  return (
    <main style={{ background: "#ffffff", color: "#111111" }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: "90px 0",
          background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
          borderBottom: "1px solid #eeeeee",
        }}
      >
        <div className="container">
          <div className="about-grid" style={{ alignItems: "center" }}>
            <div>
              <p
                className="eyebrow"
                style={{ color: "#a9822f", letterSpacing: "4px" }}
              >
                DISCOVER KASRAT
              </p>

              <h1
                style={{
                  fontSize: "clamp(42px, 6vw, 76px)",
                  lineHeight: 1.05,
                  fontWeight: 900,
                  margin: "20px 0",
                }}
              >
                MORE THAN
                <br />
                <span style={{ color: "#c9a44c" }}>A GYM.</span>
                <br />
                A MINDSET.
              </h1>

              <p
                style={{
                  color: "#666666",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  maxWidth: "520px",
                  marginBottom: "30px",
                }}
              >
                We believe fitness is not just about lifting weights.
                It is about building discipline, confidence and becoming
                a stronger version of yourself.
              </p>

              <Link href="/programs" className="button button-gold">
                EXPLORE OUR PROGRAMS →
              </Link>
            </div>

            <div style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
                alt="Modern gym interior with fitness equipment"
                style={{
                  width: "100%",
                  height: "460px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e5d6b2",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  right: "20px",
                  background: "rgba(255,255,255,0.95)",
                  padding: "18px 22px",
                  borderLeft: "4px solid #c9a44c",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    color: "#a9822f",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    margin: 0,
                  }}
                >
                  KASRAT FITNESS CLUB
                </p>
                <p style={{ color: "#444444", margin: "5px 0 0" }}>
                  Train. Transform. Thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT INTRODUCTION */}
      <section className="section" style={{ background: "#f7f7f7" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <p
              className="eyebrow"
              style={{ color: "#a9822f", letterSpacing: "4px" }}
            >
              WHO WE ARE
            </p>

            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 900,
                lineHeight: 1.2,
                margin: "15px 0 25px",
                color: "#111111",
              }}
            >
              BUILDING <span style={{ color: "#c9a44c" }}>STRENGTH.</span>
              <br />
              BUILDING CHARACTER.
            </h2>

            <p
              style={{
                color: "#666666",
                fontSize: "16px",
                lineHeight: 1.9,
              }}
            >
              At KASRAT, we aim to create a motivating environment for
              people who want to improve their fitness and lifestyle.
              Whether you are starting your journey or working towards
              a new goal, we encourage you to train with purpose, stay
              consistent and make every workout count.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="section-heading">
            <p
              className="eyebrow"
              style={{ color: "#a9822f", letterSpacing: "4px" }}
            >
              OUR FOUNDATION
            </p>

            <h2 style={{ color: "#111111" }}>
              THE KASRAT <span style={{ color: "#c9a44c" }}>WAY.</span>
            </h2>

            <p style={{ color: "#777777" }}>
              Three principles that inspire every step of your fitness journey.
            </p>
          </div>

          <div className="program-grid">
            {values.map((value) => (
              <article
                className="program-card"
                key={value.number}
                style={{
                  background: "#ffffff",
                  border: "1px solid #eeeeee",
                  borderBottom: "4px solid #c9a44c",
                  borderRadius: "8px",
                  padding: "30px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                }}
              >
                <span
                  style={{
                    color: "#c9a44c",
                    fontSize: "38px",
                    fontWeight: 900,
                  }}
                >
                  {value.number}
                </span>

                <div className="program-content">
                  <h3 style={{ color: "#111111" }}>{value.title}</h3>

                  <p style={{ color: "#666666", lineHeight: 1.8 }}>
                    {value.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: "#f7f7f7" }}>
        <div className="container">
          <div
            className="membership-panel"
            style={{
              background: "linear-gradient(135deg, #ffffff, #f4f0e6)",
              border: "1px solid #e8dfca",
              borderRadius: "8px",
            }}
          >
            <div>
              <p
                className="eyebrow"
                style={{ color: "#a9822f", letterSpacing: "3px" }}
              >
                YOUR JOURNEY STARTS HERE
              </p>

              <h2 style={{ color: "#111111" }}>
                READY TO <span style={{ color: "#c9a44c" }}>GET STRONGER?</span>
              </h2>

              <p style={{ color: "#666666" }}>
                Take the first step towards a stronger, healthier lifestyle.
              </p>
            </div>

            <Link href="/contact" className="button button-gold">
              VISIT KASRAT →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
