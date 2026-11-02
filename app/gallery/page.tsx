
const photos = [
  {
    title: "Strength Training",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Cardio Zone",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Gym Floor",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Boxing Training",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Training Session",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Martial Arts",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">MOMENTS FROM KASRAT</p>

          <h1>
            OUR <span>GALLERY.</span>
          </h1>

          <p>
            A glimpse of the energy, effort and community
            that make every workout count.
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <figure
              className={`gallery-item gallery-item-${index + 1}`}
              key={photo.title}
            >
              <div
                style={{
                  backgroundImage: `url("${photo.image}")`,
                }}
              />

              <figcaption>{photo.title}</figcaption>
            </figure>
          ))}
        </div>

        <p className="note">
          Replace these sample photos with real KASRAT gym photographs.
        </p>
      </section>
    </>
  );
}
