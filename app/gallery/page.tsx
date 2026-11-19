
import Link from "next/link";

const photos = [
  {
    number: "01",
    title: "Strength Training",
    category: "WEIGHT TRAINING",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "02",
    title: "Cardio Zone",
    category: "FITNESS & ENDURANCE",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "03",
    title: "Gym Floor",
    category: "OUR FACILITIES",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "04",
    title: "Kickboxing",
    category: "COMBAT TRAINING",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "05",
    title: "Training Session",
    category: "FITNESS JOURNEY",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "06",
    title: "Martial Arts",
    category: "TAEKWONDO",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function GalleryPage() {
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
          <div
            className="about-grid"
            style={{ alignItems: "center" }}
          >
            <div>
              <p
                className="eyebrow"
                style={{ color: "#a9822f", letterSpacing: "4px" }}
              >
                MOMENTS FROM KASRAT
              </p>

              <h1
                style={{
                  fontSize: "clamp(42px, 6vw, 76px)",
                  lineHeight: 1.05,
                  fontWeight: 900,
                  margin: "20px 0",
                }}
              >
                THE ENERGY.
                <br />
                THE EFFORT.
                <br />
                <span style={{ color: "#c9a44c" }}>THE RESULTS.</span>
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
                Take a look at the training environment,
                fitness activities and energy that make
                KASRAT a place to grow stronger every day.
              </p>

              <Link href="/contact" className="button button-gold">
                VISIT KASRAT →
              </Link>
            </div>

            <div style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85"
                alt="Gym interior and training equipment"
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

      {/* GALLERY SECTION */}
      <section className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="section-heading">
            <p
              className="eyebrow"
              style={{ color: "#a9822f", letterSpacing: "4px" }}
            >
              INSIDE OUR GYM
            </p>

            <h2 style={{ color: "#111111" }}>
              EXPLORE THE <span style={{ color: "#c9a44c" }}>GALLERY.</span>
            </h2>

            <p style={{ color: "#777777" }}>
              A glimpse of the facilities, training and activities at KASRAT.
            </p>
          </div>

          <div className="gallery-grid">
            {photos.map((photo, index) => (
              <figure
                className={`gallery-item gallery-item-${index + 1}`}
                key={photo.number}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  border: "1px solid #eeeeee",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                  margin: 0,
                }}
              >
                <div
                  style={{
                    backgroundImage: `url("${photo.image}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100%",
                    height: "100%",
                    minHeight: "260px",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "15px",
                    background: "#c9a44c",
                    color: "#111111",
                    padding: "7px 12px",
                    fontSize: "13px",
                    fontWeight: 900,
                  }}
                >
                  {photo.number}
                </span>

                <figcaption
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "25px 20px 18px",
                    background:
                      "linear-gradient(transparent, rgba(0,0,0,0.85))",
                    color: "#ffffff",
                  }}
                >
                  <p
                    style={{
                      color: "#e5c36f",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "2px",
                      margin: "0 0 7px",
                    }}
                  >
                    {photo.category}
                  </p>

                  <h3
                    style={{
                      fontSize: "21px",
                      fontWeight: 900,
                      margin: 0,
                    }}
                  >
                    {photo.title}
                  </h3>
                </figcaption>
              </figure>
            ))}
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#888888",
              fontSize: "13px",
              marginTop: "30px",
            }}
          >
           {/* Sample photographs. Replace these with actual KASRAT gym
            photographs when available.// */}
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
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
                YOUR FITNESS JOURNEY STARTS HERE
              </p>

              <h2 style={{ color: "#111111" }}>
                BE PART OF <span style={{ color: "#c9a44c" }}>KASRAT.</span>
              </h2>

              <p style={{ color: "#666666" }}>
                Visit our gym and experience the energy for yourself.
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
