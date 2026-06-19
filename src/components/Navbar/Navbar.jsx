import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__content">
        <NavLink to="/" className="navbar__logo">
          St Catherine House of Hope
        </NavLink>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/donate">Donate</NavLink>
          <NavLink to="/volunteer">Volunteer</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar