
import Link from "next/link";

const programs = [
  {
    number: "01",
    title: "Weight Training",
    description: "Build strength and muscle with expert guidance.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    title: "Cardio",
    description: "Improve stamina, heart health and endurance.",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    title: "Kickboxing",
    description: "Develop power, speed and confidence.",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    title: "Taekwondo",
    description: "Build flexibility, discipline and self-defence skills.",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              STRONGER. FITTER. HAPPIER.
            </p>

            <h1>
              UNLEASH YOUR
              <span> INNER STRENGTH.</span>
            </h1>

            <p className="hero-description">
              Train hard. Stay disciplined.
              Achieve more at KASRAT.
            </p>

            <div className="hero-actions">
              <Link href="/contact" className="button button-gold">
                Join Now ↗
              </Link>

              <a href="#programs" className="text-link">
                Explore Programs ↓
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>04</strong>
                <span>Training zones</span>
              </div>
              <div>
                <strong>01</strong>
                <span>Stronger you</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Your commitment</span>
              </div>
            </div>
          </div>

          <div className="hero-photo">
            <div className="photo-label">
              DISCIPLINE IS THE DIFFERENCE
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section className="section container" id="programs">
        <div className="section-heading">
          <p className="eyebrow">TRAIN YOUR WAY</p>
          <h2>
            OUR <span>PROGRAMS</span>
          </h2>
          <p>
            One place. Multiple ways to become stronger.
          </p>
        </div>

        <div className="program-grid">
          {programs.map((program) => (
            <article
              className="program-card"
              key={program.number}
            >
              <div
                className="program-image"
                style={{
                  backgroundImage: `url("${program.image}")`,
                }}
              >
                <span>{program.number}</span>
              </div>

              <div className="program-content">
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <Link href="/contact">
                  Enquire Now ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-band" id="about">
        <div className="container about-grid">
          <div>
            <p className="eyebrow">ABOUT KASRAT</p>

            <h2>
              MORE THAN A GYM.
              <br />
              <span>A FITNESS COMMUNITY.</span>
            </h2>

            <p className="body-copy">
              At KASRAT, we believe fitness is about more
              than physical strength. It is about building
              confidence, discipline and a healthier
              lifestyle. Find your training style and make
              every session count.
            </p>

            <Link
              href="/contact"
              className="button button-outline"
            >
              Know More ↗
            </Link>
          </div>

          <div className="about-photo" />
        </div>
      </section>

      {/* MEMBERSHIP SECTION */}
      <section className="section container" id="membership">
        <div className="membership-panel">
          <div>
            <p className="eyebrow">
              YOUR NEXT CHAPTER STARTS HERE
            </p>

            <h2>
              CHOOSE YOUR <span>PLAN.</span>
            </h2>

            <p>
              Flexible membership options for every fitness goal.
            </p>
          </div>

          <Link href="/contact" className="button button-gold">
            View Membership ↗
          </Link>
        </div>
      </section>

      {/* TRAINERS AND GALLERY LINKS */}
      <section className="section container home-bottom">
        <div>
          <p className="eyebrow">MEET THE TEAM</p>
          <h2>
            LEARN FROM THE <span>BEST.</span>
          </h2>
          <p>
            Get guidance, motivation and support from
            our training team.
          </p>
          <Link href="/trainers" className="simple-link">
            Meet Our Trainers ↗
          </Link>
        </div>

        <div>
          <p className="eyebrow">INSIDE KASRAT</p>
          <h2>
            TAKE A <span>LOOK.</span>
          </h2>
          <p>
            Explore the spaces where your progress takes shape.
          </p>
          <Link href="/gallery" className="simple-link">
            Explore Gallery ↗
          </Link>
        </div>
      </section>
    </>
  );
}
