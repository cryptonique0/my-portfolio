'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  openModal: (modal: string) => void;
}

const Header = ({ openModal }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const performSearch = () => {
    if (!searchQuery.trim()) return;

    const searchTerm = searchQuery.toLowerCase();
    
    // Map search terms to page sections
    const sections: { [key: string]: string } = {
      'experience': 'experience',
      'skills': 'skills',
      'project': 'projects-showcase',
      'projects': 'projects-showcase',
      'testimonial': 'testimonials',
      'certification': 'certifications',
      'certifications': 'certifications',
      'blog': 'blog',
      'article': 'blog',
      'faq': 'faq',
      'contact': 'contact',
      'about': 'about-me',
      'metrics': 'metrics',
    };

    for (const [key, sectionId] of Object.entries(sections)) {
      if (searchTerm.includes(key)) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setSearchQuery('');
          return;
        }
      }
    }

    // If no match found
    alert(`No results found for "${searchQuery}". Try searching for: Experience, Skills, Projects, Testimonials, Certifications, Blog, FAQ, or Contact.`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <>
      {/* Top Search Bar - Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`transition-all duration-300 ${
          isSearchActive 
            ? 'w-64 bg-black/80 backdrop-blur-md border border-primary/30 rounded-lg' 
            : 'w-12 h-12 bg-black/80 backdrop-blur-md border border-primary/30 rounded-full'
        }`}>
          <div className="flex items-center h-12 px-4 gap-2">
            <button
              onClick={() => {
                if (!isSearchActive) setIsSearchActive(true);
                if (isSearchActive && searchQuery) performSearch();
              }}
              className="p-1 hover:bg-primary/20 rounded-lg transition-colors shrink-0"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>

            {isSearchActive && (
              <>
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyPress={handleSearchKeyPress}
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-text-secondary/50 min-w-0"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }}
                  className="p-1 hover:bg-primary/20 rounded-lg transition-colors shrink-0"
                  aria-label="Close search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-text-secondary">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Search Suggestions */}
          {isSearchActive && (
            <div className="border-t border-primary/10 p-2 bg-black/40">
              <p className="text-xs text-text-secondary/70 px-2 py-1 font-semibold">Quick search:</p>
              <div className="grid grid-cols-2 gap-1">
                {['Experience', 'Skills', 'Projects', 'Blog', 'Testimonials', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchQuery(item);
                      setTimeout(() => {
                        setSearchQuery(item);
                        setTimeout(() => performSearch(), 0);
                      }, 0);
                    }}
                    className="text-xs px-2 py-1 rounded hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <header 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-md bg-[#000033]/90 border border-primary/20' : 'bg-linear-to-r from-black/80 to-black/80'
        } rounded-full px-6 py-3 shadow-lg`}
      >
        <div className="flex items-center gap-8">
          <a href="#" className="relative group">
            <h2 className="text-lg font-bold bg-linear-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent font-display">
              CRYPTONIQUE
            </h2>
            <div className="absolute inset-x-0 bottom-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform bg-linear-to-r from-primary/50 to-secondary/50" />
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
          <nav className="hidden md:flex items-center ml-auto">
          </nav>

          {/* Mobile Navigation */}
          <div className={`
            md:hidden fixed inset-x-0 top-[64px] bg-black/95
            transition-transform duration-300 backdrop-blur-md border-b border-primary/10
            ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
          `}>
            <nav className="flex flex-col p-6 gap-6">
            </nav>
          </div>
        </div>  
      </header>
    </>
  );
};

export default Header;