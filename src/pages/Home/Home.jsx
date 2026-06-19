import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import Footer from '../../components/Footer/Footer'
import About from '../About/About'
import Programs from './Programs'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <section className="section" id="about">
          <div className="container section__center">
            <p className="eyebrow">Our Mission</p>
            <h2>Providing love, care, and opportunity</h2>
            <p>
              Our mission is to provide a safe, nurturing environment where children
              receive education, healthcare, emotional support, and the confidence to
              build a better future.
            </p>
          </div>
        </section>

        <section className="section section--light" id="programs">
          <div className="container">
            <div className="section__center">
              <p className="eyebrow">Our Programs</p>
              <h2>How we support children</h2>
            </div>

            <div className="card-grid">
              <article className="card">
                <h3>🏠 Shelter & Care</h3>
                <p>Safe accommodation, daily meals, and consistent adult support.</p>
              </article>

              <article className="card">
                <h3>📚 Education</h3>
                <p>School support, tutoring, mentorship, and learning resources.</p>
              </article>

              <article className="card">
                <h3>❤️ Health & Wellbeing</h3>
                <p>Healthcare, counseling, emotional support, and child protection.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="donate">
          <div className="container section__center">
            <p className="eyebrow">Support the Mission</p>
            <h2>Your donation can change a child’s life</h2>
            <p>
              Donations help provide food, education, healthcare, clothing, shelter,
              and long-term care for the children.
            </p>
            <a href="#contact" className="btn btn--primary">
              Start Donating
            </a>
          </div>
        </section>

        <section className="section section--light" id="volunteer">
          <div className="container section__center">
            <p className="eyebrow">Volunteer With Us</p>
            <h2>Use your time and skills to make a difference</h2>
            <p>
              Volunteers can support education, mentorship, events, administration,
              fundraising, media, and daily activities.
            </p>
            <a href="#contact" className="btn btn--secondary-dark">
              Register Interest
            </a>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container section__center">
            <p className="eyebrow">Contact</p>
            <h2>Get in touch</h2>
            <p>Email: info@stcatherinehouseofhope.org</p>
            <p>Location: Sega, Kenya</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Home