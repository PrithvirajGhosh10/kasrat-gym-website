
import Link from "next/link";
import ActiveMemberCount from "@/components/ActiveMemberCount";

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
              Your fitness journey starts here.
              Train hard, stay disciplined and become
              a stronger version of yourself at KASRAT.
            </p>

            <div className="hero-actions">
              <Link href="/contact" className="button button-gold">
                Join KASRAT ↗
              </Link>

              <Link href="/programs" className="button button-outline">
                Explore Programs →
              </Link>
            </div>

            {/* HERO STATISTICS */}
            <div className="hero-stats">
              <div>
                <strong>04</strong>
                <span>Training programs</span>
              </div>

              <ActiveMemberCount />

              <div>
                <strong>100%</strong>
                <span>Your commitment</span>
              </div>
            </div>
          </div>

          <div
            className="hero-photo"
            role="img"
            aria-label="Gym strength training"
          >
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
            Discover different ways to train, improve and
            achieve your fitness goals.
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
                role="img"
                aria-label={program.title}
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

        {/* EXPLORE PROGRAMS BUTTON */}
        <div className="home-section-actions">
          <Link href="/programs" className="button button-gold">
            Explore Programs →
          </Link>
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
              lifestyle.

              Find your training style, challenge yourself
              and make every session count.
            </p>

            <div className="home-about-actions">
              <Link
                href="/about"
                className="button button-gold"
              >
                About Us →
              </Link>

              <Link
                href="/contact"
                className="button button-outline"
              >
                Visit KASRAT ↗
              </Link>
            </div>
          </div>

          <div
            className="about-photo"
            role="img"
            aria-label="Gym training environment"
          />
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
              READY TO <span>GET STRONGER?</span>
            </h2>

            <p>
              Take the first step towards a healthier
              and more active lifestyle.
            </p>
          </div>

          <Link href="/contact" className="button button-gold">
            Membership Enquiry ↗
          </Link>
        </div>
      </section>

      {/* TRAINERS AND GALLERY */}
      <section className="section container home-bottom">
        {/* TRAINERS */}
        <div>
          <p className="eyebrow">MEET THE TEAM</p>

          <h2>
            TRAIN WITH <span>CONFIDENCE.</span>
          </h2>

          <p>
            Get guidance, motivation and support
            throughout your fitness journey.
          </p>

          <Link
            href="/trainers"
            className="button button-gold home-action-button"
          >
            Meet Our Trainers ↗
          </Link>
        </div>

        {/* GALLERY */}
        <div>
          <p className="eyebrow">INSIDE KASRAT</p>

          <h2>
            EXPLORE OUR <span>GYM.</span>
          </h2>

          <p>
            Take a look at the training environment
            and facilities at KASRAT.
          </p>

          <Link
            href="/gallery"
            className="button button-gold home-action-button"
          >
            Explore Gallery ↗
          </Link>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="section container">
        <div className="membership-panel">
          <div>
            <p className="eyebrow">WE ARE HERE FOR YOU</p>

            <h2>
              START YOUR <span>JOURNEY.</span>
            </h2>

            <p>
              Have questions? Visit us at KASRAT,
              Naihati. We'd love to meet you.
            </p>
          </div>

          <Link href="/contact" className="button button-gold">
            Contact Us ↗
          </Link>
        </div>
      </section>
    </>
  );
}
