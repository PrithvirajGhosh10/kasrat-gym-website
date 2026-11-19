
import Link from "next/link";

const trainers = [
  {
    number: "01",
    name: "Weight Training",
    specialty: "STRENGTH & MUSCLE BUILDING",
    detail:
      "Build strength and muscle through resistance training, proper exercise techniques and progressive workouts.",
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    name: "Cardio",
    specialty: "FITNESS & ENDURANCE",
    detail:
      "Improve stamina, cardiovascular health and overall fitness through energetic cardio workouts.",
    image:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    name: "Taekwondo",
    specialty: "MARTIAL ARTS & DISCIPLINE",
    detail:
      "Develop flexibility, balance, coordination, discipline and self-defence skills through martial arts.",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    name: "Kickboxing",
    specialty: "COMBAT & CONDITIONING",
    detail:
      "Improve power, speed, footwork and confidence through dynamic kickboxing training.",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=85",
  },
];

export default function TrainersPage() {
  return (
    <main style={{ background: "#ffffff", color: "#111111" }}>
      {/* HERO */}
      <section
        style={{
          padding: "85px 0",
          background: "linear-gradient(135deg, #ffffff, #f5f5f5)",
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
                TRAINING AT KASRAT
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
                OWN YOUR JOURNEY.
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
                From strength training to martial arts,
                discover the training programs that help
                you become stronger, fitter and more confident.
              </p>

              <Link href="/programs" className="button button-gold">
                EXPLORE PROGRAMS →
              </Link>
            </div>

            <div style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85"
                alt="Fitness training at a gym"
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
                  background: "rgba(255,255,255,0.96)",
                  padding: "18px 22px",
                  borderLeft: "4px solid #c9a44c",
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
                  KASRAT GYM
                </p>
                <p style={{ color: "#444444", margin: "5px 0 0" }}>
                  Train. Transform. Thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR TRAINING CATEGORIES */}
      <section className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="section-heading">
            <p
              className="eyebrow"
              style={{ color: "#a9822f", letterSpacing: "4px" }}
            >
              OUR TRAINING CATEGORIES
            </p>

            <h2 style={{ color: "#111111" }}>
              TRAIN YOUR <span style={{ color: "#c9a44c" }}>WAY.</span>
            </h2>

            <p style={{ color: "#777777" }}>
              Choose the training style that matches your fitness goals.
            </p>
          </div>

          <div className="trainer-grid">
            {trainers.map((trainer) => (
              <article
                className="trainer-card"
                key={trainer.number}
                style={{
                  background: "#ffffff",
                  border: "1px solid #eeeeee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: "320px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={trainer.image}
                    alt={`${trainer.name} training`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      background: "#c9a44c",
                      color: "#111111",
                      padding: "8px 13px",
                      fontWeight: 900,
                    }}
                  >
                    {trainer.number}
                  </span>
                </div>

                <div
                  className="trainer-info"
                  style={{
                    padding: "25px",
                    borderBottom: "4px solid #c9a44c",
                  }}
                >
                  <p
                    className="eyebrow"
                    style={{ color: "#a9822f", letterSpacing: "2px" }}
                  >
                    {trainer.specialty}
                  </p>

                  <h2
                    style={{
                      color: "#111111",
                      fontSize: "25px",
                      fontWeight: 900,
                      margin: "12px 0",
                    }}
                  >
                    {trainer.name}
                  </h2>

                  <p
                    style={{
                      color: "#666666",
                      lineHeight: 1.8,
                      marginBottom: "18px",
                    }}
                  >
                    {trainer.detail}
                  </p>

                  <Link
                    href="/contact"
                    style={{
                      color: "#a9822f",
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    Enquire Now →
                  </Link>
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
                START YOUR FITNESS JOURNEY
              </p>

              <h2 style={{ color: "#111111" }}>
                READY TO <span style={{ color: "#c9a44c" }}>GET STRONGER?</span>
              </h2>

              <p style={{ color: "#666666" }}>
                Visit KASRAT and find the right training for you.
              </p>
            </div>

            <Link href="/contact" className="button button-gold">
              CONTACT US →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
