import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="container navbar__content">
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-mark">SC</span>
          <span className="navbar__logo-text">St Catherine House of Hope</span>
        </NavLink>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? 'is-open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((currentState) => !currentState)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/gallery" onClick={closeMenu}>
            Gallery
          </NavLink>
          <NavLink to="/donate" onClick={closeMenu}>
            Donate
          </NavLink>
          <NavLink to="/volunteer" onClick={closeMenu}>
            Volunteer
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar