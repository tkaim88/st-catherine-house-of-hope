import heroImage from '../../assets/images/hero-orphanage.png'

function Hero() {
  return (
    <section
      className="hero"
      id="home"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(15, 23, 42, 0.40),
            rgba(15, 23, 42, 0.40)
          ),
          url(${heroImage})
        `,
      }}
    >
      <div className="container hero__content">
        <p className="eyebrow">A safe home. A brighter future.</p>

        <h1>Giving Hope To Every Child</h1>

        <p className="hero__text">
          St Catherine House of Hope provides care, education, shelter,
          and emotional support to children who need a loving and secure home.
        </p>

        <div className="hero__actions">
          <a href="#donate" className="btn btn--primary">
            Donate Now
          </a>

          <a href="#volunteer" className="btn btn--secondary">
            Become a Volunteer
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero