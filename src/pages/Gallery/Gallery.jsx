import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function Gallery() {
  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Gallery</p>

          <h1>Life at St Catherine House of Hope</h1>

          <p>
            Moments of learning, growth, friendship, and joy from our
            community.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '40px',
            }}
          >
            <img
              src="https://picsum.photos/400/300?1"
              alt="Gallery"
              style={{ width: '100%', borderRadius: '12px' }}
            />

            <img
              src="https://picsum.photos/400/300?2"
              alt="Gallery"
              style={{ width: '100%', borderRadius: '12px' }}
            />

            <img
              src="https://picsum.photos/400/300?3"
              alt="Gallery"
              style={{ width: '100%', borderRadius: '12px' }}
            />

            <img
              src="https://picsum.photos/400/300?4"
              alt="Gallery"
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Gallery