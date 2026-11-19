
import Link from "next/link";

const programs = [
  {
    number: "01",
    title: "Weight Training",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    description:
      "Build strength and muscle with dedicated resistance training. Improve your fitness, develop strength and work towards your personal goals.",
    tag: "BUILD STRENGTH",
  },
  {
    number: "02",
    title: "Cardio",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c",
    description:
      "Improve stamina, endurance and cardiovascular fitness through energetic workouts designed to keep you moving.",
    tag: "BOOST ENDURANCE",
  },
  {
    number: "03",
    title: "Kickboxing",
    image:
      "https://images.unsplash.com/photo-1517438322307-e67111335449",
    description:
      "Develop power, speed, coordination and confidence with dynamic kickboxing training.",
    tag: "TRAIN WITH POWER",
  },
  {
    number: "04",
    title: "Taekwondo",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865",
    description:
      "Build flexibility, discipline, balance and self-defence skills through martial arts training.",
    tag: "MASTER DISCIPLINE",
  },
];

export default function ProgramsPage() {
  return (
    <main style={{ background: "#ffffff", color: "#111111" }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: "85px 0",
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
                TRAIN YOUR WAY
              </p>

              <h1
                style={{
                  fontSize: "clamp(42px, 6vw, 76px)",
                  lineHeight: 1.05,
                  fontWeight: 900,
                  margin: "20px 0",
                }}
              >
                FIND YOUR
                <br />
                <span style={{ color: "#c9a44c" }}>STRENGTH.</span>
                <br />
                OWN YOUR GOALS.
              </h1>

              <p
                style={{
                  color: "#666666",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  maxWidth: "510px",
                  marginBottom: "30px",
                }}
              >
                From strength training to martial arts, discover the
                programs that help you challenge yourself and become
                stronger every day.
              </p>

              <Link href="/contact" className="button button-gold">
                START YOUR JOURNEY →
              </Link>
            </div>

            <div style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
                alt="Fitness equipment inside a modern gym"
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

      {/* PROGRAM CARDS */}
      <section
        className="section"
        style={{ background: "#ffffff" }}
      >
        <div className="container">
          <div className="section-heading">
            <p
              className="eyebrow"
              style={{ color: "#a9822f", letterSpacing: "4px" }}
            >
              FIND YOUR TRAINING STYLE
            </p>

            <h2 style={{ color: "#111111" }}>
              CHOOSE YOUR <span style={{ color: "#c9a44c" }}>PROGRAM.</span>
            </h2>

            <p style={{ color: "#777777" }}>
              Every journey is different. Find the training that motivates
              you to become stronger.
            </p>
          </div>

          <div className="program-grid">
            {programs.map((program) => (
              <article
                className="program-card"
                key={program.number}
                style={{
                  background: "#ffffff",
                  border: "1px solid #eeeeee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={program.image}
                    alt={`${program.title} training at a gym`}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      background: "#c9a44c",
                      color: "#111111",
                      padding: "8px 14px",
                      fontWeight: 900,
                      fontSize: "14px",
                      borderRadius: "3px",
                    }}
                  >
                    {program.number}
                  </span>
                </div>

                <div
                  className="program-content"
                  style={{ padding: "25px" }}
                >
                  <p
                    style={{
                      color: "#a9822f",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "2px",
                      marginBottom: "10px",
                    }}
                  >
                    {program.tag}
                  </p>

                  <h3
                    style={{
                      color: "#111111",
                      fontSize: "23px",
                      marginBottom: "12px",
                    }}
                  >
                    {program.title}
                  </h3>

                  <p
                    style={{
                      color: "#666666",
                      lineHeight: 1.8,
                      marginBottom: "20px",
                    }}
                  >
                    {program.description}
                  </p>

                  <Link
                    href="/contact"
                    className="program-link"
                    style={{ color: "#a9822f", fontWeight: 800 }}
                  >
                    Enquire Now ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section"
        style={{ background: "#f7f7f7" }}
      >
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
                START YOUR FITNESS JOURNEY
              </p>

              <h2 style={{ color: "#111111" }}>
                READY TO <span style={{ color: "#c9a44c" }}>GET STRONGER?</span>
              </h2>

              <p style={{ color: "#666666" }}>
                Visit KASRAT and take the first step towards your fitness goals.
              </p>
            </div>

            <Link href="/contact" className="button button-gold">
              CONTACT US ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
