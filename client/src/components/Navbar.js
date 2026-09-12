import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="navbar">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="navbar-brand">
          📊 CV Benchmarks
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/benchmarks" className="nav-link">Benchmarks</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/submit" className="nav-link nav-link-primary">Submit</Link>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <Link to="/" className="block px-4 py-2 hover:bg-gray-100">Home</Link>
          <Link to="/benchmarks" className="block px-4 py-2 hover:bg-gray-100">Benchmarks</Link>
          <Link to="/leaderboard" className="block px-4 py-2 hover:bg-gray-100">Leaderboard</Link>
          <Link to="/submit" className="block px-4 py-2 hover:bg-blue-100">Submit</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
