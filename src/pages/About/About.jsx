import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function About() {
  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">About Us</p>

          <h1>St Catherine House of Hope</h1>

          <p>
            St Catherine House of Hope is dedicated to providing a safe,
            nurturing, and supportive environment for vulnerable children.
          </p>

          <p>
            Our mission is to ensure every child has access to education,
            healthcare, emotional support, and opportunities for a brighter
            future.
          </p>

          <p>
            Through the generosity of donors, volunteers, and partners, we
            continue transforming lives and creating lasting impact in our
            community.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default About