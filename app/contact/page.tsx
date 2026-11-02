
export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">LET'S GET STARTED</p>

          <h1>
            GET IN <span>TOUCH.</span>
          </h1>

          <p>
            Have a question about memberships or training?
            Send us a message.
          </p>
        </div>
      </section>

      <section className="section container contact-layout">
        <div className="contact-details">
          <p className="eyebrow">CONTACT KASRAT</p>

          <h2>
            YOUR FITNESS JOURNEY STARTS WITH A CONVERSATION.
          </h2>

          <p>
            Visit us, call us or leave an enquiry.
            Our team will help you find the right program.
          </p>

          <div className="contact-line">
            <span>ADDRESS</span>
            <strong>Add your gym address here</strong>
          </div>

          <div className="contact-line">
            <span>PHONE</span>
            <strong>+91 XXXXX XXXXX</strong>
          </div>

          <div className="contact-line">
            <span>OPENING HOURS</span>
            <strong>Monday – Sunday · Add timings</strong>
          </div>
        </div>

        <form
          className="contact-form"
          action="mailto:hello@kasrat.example"
          method="post"
          encType="text/plain"
        >
          <label>
            Your Name
            <input
              name="name"
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Interested In
            <select name="program" defaultValue="">
              <option value="" disabled>
                Select a program
              </option>
              <option>Weight Training</option>
              <option>Cardio</option>
              <option>Kickboxing</option>
              <option>Taekwondo</option>
              <option>Membership</option>
            </select>
          </label>

          <label>
            Your Message
            <textarea
              name="message"
              rows={5}
              placeholder="Tell us how we can help..."
              required
            />
          </label>

          <button className="button button-gold" type="submit">
            Send Enquiry ↗
          </button>

          <p className="form-note">
            Demo form. Connect a backend or form service
            to receive enquiries online.
          </p>
        </form>
      </section>
    </>
  );
}
