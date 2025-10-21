'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  openModal: (modal: string) => void;
}

const Header = ({ openModal }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (modalName: string) => {
    setIsMobileMenuOpen(false);
    openModal(modalName);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-black/20 border-b border-primary/20 py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="#" className="relative group">
          <h2 className="text-2xl font-bold text-white">
            John Doe
          </h2>
          <p className="text-sm text-gray-400">Full Stack Developer</p>
        </a>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center ml-auto space-x-8">
          <a 
            onClick={() => handleNavClick('projects')}
            className="nav-link text-sm font-medium tracking-wider transition-all cursor-pointer uppercase hover:text-primary"
          >
            View Projects
          </a>
          <button 
            onClick={() => handleNavClick('contact')}
            className="btn btn-primary text-sm font-medium tracking-wider"
          >
            Get in Touch
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden fixed inset-x-0 top-[64px] bg-black/95
          transition-transform duration-300 backdrop-blur-md border-b border-primary/10
          ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
        `}>
          <nav className="flex flex-col p-6 gap-6">
            <a 
              onClick={() => handleNavClick('projects')}
              className="nav-link text-lg font-medium tracking-wider transition-all cursor-pointer uppercase text-center"
            >
              View Projects
            </a>
            <button 
              onClick={() => handleNavClick('contact')}
              className="btn btn-primary text-lg font-medium w-full"
            >
              Get in Touch
            </button>
          </nav>
        </div>
      </div>  
    </header>
  );
};

export default Header;