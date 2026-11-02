
const trainers = [
  {
    name: "Strength Coach",
    specialty: "Weight Training",
    detail: "Strength, form and progressive training.",
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Fitness Coach",
    specialty: "Fitness & Cardio",
    detail: "Conditioning, stamina and sustainable fitness.",
    image:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Combat Coach",
    specialty: "Kickboxing",
    detail: "Technique, footwork and combat conditioning.",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Martial Arts Coach",
    specialty: "Taekwondo",
    detail: "Discipline, flexibility and martial arts basics.",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=900&q=85",
  },
];

export default function TrainersPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">
            THE PEOPLE BEHIND YOUR PROGRESS
          </p>

          <h1>
            MEET OUR <span>TRAINERS.</span>
          </h1>

          <p>
            Good coaching turns effort into progress.
            Find the guidance that fits your goals.
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="trainer-grid">
          {trainers.map((trainer) => (
            <article className="trainer-card" key={trainer.name}>
              <div
                className="trainer-image"
                style={{
                  backgroundImage: `url("${trainer.image}")`,
                }}
              />

              <div className="trainer-info">
                <p className="eyebrow">
                  {trainer.specialty}
                </p>

                <h2>{trainer.name}</h2>

                <p>{trainer.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="note">
          Replace sample profiles with your actual KASRAT trainer details.
        </p>
      </section>
    </>
  );
}
