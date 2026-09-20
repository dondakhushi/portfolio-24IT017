import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

import PortfolioData from './Data/PortfolioData';

import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Lazy-loaded route components
const Project = lazy(() => import('./pages/Project'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Login = lazy(() => import('./pages/Login'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <div className="App">
      <Header name={PortfolioData.name} />

      <Navbar navLinks={PortfolioData.navLinks} />

      <Suspense
        fallback={
          <div className="page-loading">
            <h2>Loading page...</h2>
            <p>Please wait.</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Projects" element={<Project />} />
          <Route path="/Tasks" element={<Tasks />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer
        email={PortfolioData.Footer.email}
        name={PortfolioData.name}
        year={PortfolioData.Footer.year}
      />
    </div>
  );
}

export default App;