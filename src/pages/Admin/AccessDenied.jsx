import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AccessDenied() {
  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Access Restricted</p>
          <h1>Access Denied</h1>

          <p>
            You do not have permission to access this admin section.
          </p>

          <Link className="btn btn--primary" to="/admin">
            Back to Dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AccessDenied