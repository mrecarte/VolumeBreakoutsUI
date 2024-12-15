import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './App.css';

const App = () => {
  return (
    <div>
      <header className="navbar">
        <div className="logo">Quanta</div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/background">Background</Link>
          <Link to="/setup">Set Up</Link>
          <Link to="/research">Research</Link>
        </nav>
      </header>
      <Outlet /> {/* This renders the child routes */}
    </div>
  );
};

export default App;

