'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import StarryBackground from './components/StarryBackground';
import ParticleBackground from './components/ParticleBackground';
import ThemeToggle from './components/ThemeToggle';
import BackToTop from './components/BackToTop';
import Timeline from './components/Timeline';
import Skills from './components/Skills';
import Metrics from './components/Metrics';
import ProgressBar from './components/ProgressBar';
import Certifications from './components/Certifications';
import ProjectShowcase from './components/ProjectShowcase';

export default function Home() {
  const [contactExpanded, setContactExpanded] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          entry.target.classList.remove('animate-out');
        } else {
          entry.target.classList.add('animate-out');
          entry.target.classList.remove('animate-in');
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-10% 0px -10% 0px'
    });

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen relative">
      <div className="bg-gradient"></div>
      <ParticleBackground />
      <StarryBackground />
      <ThemeToggle />
      <BackToTop />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/50 border-b border-primary/10">
        <div className="container mx-auto px-6">
          <div className="flex justify-end items-center space-x-6 bg-bg-light/5 backdrop-blur-sm py-4 px-8 rounded-full shadow-lg">
            <button 
              onClick={() => {
                document.querySelector('main')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="btn btn-secondary group px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Home
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                document.getElementById('about-me')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="btn btn-secondary group px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              About Me
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={() => {
                document.getElementById('projects-showcase')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="btn btn-secondary group px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Projects
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="btn btn-secondary group px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section relative transform-gpu pt-32">
        <div className="container flex flex-col items-center justify-center text-center min-h-[90vh]">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="animate-fade-in">
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-full bg-linear-to-br from-black via-blue-600 to-white p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-linear-to-tr from-orange-500 via-purple-600 to-emerald-400 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      <Image
                        src="/profile.png"
                        alt="Cryptonique Profile"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="hero-title animate-slide-up transform transition-all duration-500 hover:scale-105">
              King Byran
            </h1>
            <p className="text-gray-400 text-lg animate-fade-in max-w-2xl mx-auto leading-relaxed">
              Senior Community Manager & Project Manager with over 3 years of experience in Web3. Proven track record of building and nurturing thriving communities of 150,000+ members and delivering successful blockchain projects.
            </p>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-row gap-4 items-center justify-center flex-nowrap">
                <button 
                  onClick={() => {
                    document.getElementById('experience')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="btn btn-primary whitespace-nowrap"
                >
                  View Experience
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('skills')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="btn btn-primary whitespace-nowrap"
                >
                  View Skills & Expertise
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('certifications')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="btn btn-primary whitespace-nowrap"
                >
                  View Certifications
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-3">
                <a 
                  href="https://t.me/cryptonique0"
                  className="btn btn-secondary group p-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on Telegram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.744-3.776 15.314-3.776 15.314s-.237.588-.884.588c-.317 0-.637-.122-.884-.477 0 0-2.643-2.063-3.77-3.087-.245-.221-.521-.633.043-1.125l3.936-3.733c.275-.262.275-.483.275-.483s-1.482.372-2.589.372c-.261 0-.566-.038-.871-.261-.479-.353-.479-.995-.479-.995s6.491-2.724 6.491-2.724.588-.261 1.004-.261c.152 0 .323.037.442.11.359.221.359.744.359.744s-.152 4.492-.296 5.018z"/>
                  </svg>
                </a>
                <a 
                  href="mailto:abdulganiyu838@gmail.com"
                  className="btn btn-secondary group p-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Send Email"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                </a>
                <a 
                  href="https://x.com/theweb3joker"
                  className="btn btn-secondary group p-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow on X"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
  <section id="about-me" className="section transform-gpu py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-8">About Me</h2>
            <div className="space-y-16">
              {/* Profile Content */}
              <div className="card slide-up">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-primary/90 tracking-wide">Community Strategist & Project Manager</h3>
                    <p className="text-text-secondary leading-relaxed text-lg">
                      I'm passionate about building engaged Web3 communities, coordinating teams, and delivering high-impact campaigns that grow user loyalty and brand trust.
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      As a dedicated Web3 community leader, I specialize in creating and nurturing vibrant digital communities while ensuring sustainable growth and meaningful engagement.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="card bg-bg-light/5 p-6">
                      <h4 className="font-bold text-lg mb-3 text-primary tracking-wide uppercase mt-8">Core Focus Areas</h4>
                      <ul className="space-y-4 text-text-secondary text-lg">
                        <li className="flex items-center gap-3">
                          <span className="p-1 rounded-md bg-primary/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </span>
                          Community Engagement Strategies
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="p-1 rounded-md bg-primary/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                          </span>
                          Project Management
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="p-1 rounded-md bg-primary/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                          </span>
                          Analytics & Growth
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="p-1 rounded-md bg-primary/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            </svg>
                          </span>
                          Community Building
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 tracking-wider text-primary mt-8">
                SKILLS
              </h2>
              {/* Skills Grid */}
              <div className="grid grid-cols-1 gap-6">
                <div className="card slide-up delay-1">
                  <h3 className="text-2xl font-bold mb-6 text-primary/90 tracking-wide flex items-center gap-2">
                    <span className="text-primary">🔹</span>
                    Community Management Skills
                  </h3>
                  <div className="space-y-4">
                    <ProgressBar skill="Discord / Telegram / Slack moderation" percentage={95} />
                    <ProgressBar skill="Event planning & Campaigns" percentage={90} />
                    <ProgressBar skill="Engagement & Retention Strategy" percentage={88} />
                    <ProgressBar skill="Analytics & User Insights" percentage={85} />
                  </div>
                </div>

                <div className="card slide-up delay-2">
                  <h3 className="text-2xl font-bold mb-6 text-primary/90 tracking-wide flex items-center gap-2">
                    <span className="text-primary">🔹</span>
                    Project Management Skills
                  </h3>
                  <ul className="space-y-4 text-text-secondary text-lg">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Agile / Scrum / Kanban methodologies
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Task & time management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Stakeholder communication
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Risk assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Reporting & documentation
                    </li>
                  </ul>
                </div>

                <div className="card slide-up delay-3">
                  <h3 className="text-2xl font-bold mb-6 text-primary/90 tracking-wide flex items-center gap-2">
                    <span className="text-primary">🔹</span>
                    Tools & Platforms
                  </h3>
                  <p className="text-text-secondary text-lg leading-relaxed">
                    Notion, Trello, Asana, ClickUp, Google Workspace, Telegram, Twitter (X), Slack, HubSpot, Airtable, Discord.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section bg-bg-light/5 transform-gpu py-12">
        <div className="container">
          <h2 className="text-center mb-8">Professional Experience</h2>
          <Timeline />
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section transform-gpu py-12">
        <div className="container">
          <h2 className="text-center mb-8">Expertise & Skills</h2>
          <Skills />
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className="section bg-bg-light/5 transform-gpu py-12">
        <div className="container">
          <h2 className="text-center mb-8">Impact & Achievements</h2>
          <Metrics />
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects-showcase" className="section transform-gpu py-12">
        <div className="container">
          <h2 className="text-center mb-8">Featured Projects & Case Studies</h2>
          <ProjectShowcase />
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="section transform-gpu py-12">
        <div className="container">
          <h2 className="text-center mb-8">Certifications</h2>
          <Certifications />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section bg-bg-light/5 py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8 cursor-pointer hover:text-primary transition-colors" onClick={() => setContactExpanded(!contactExpanded)}>Get in Touch</h2>
              
              {contactExpanded && (
                <div className="mt-8 p-8 rounded-2xl border-2 border-primary/30 hover:border-primary/60 bg-linear-to-br from-primary/5 to-primary/10 backdrop-blur-sm transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-6">Direct Contact</h3>
                  <div className="space-y-4">
                    <a href="mailto:abdulganiyu838@gmail.com" className="flex items-center justify-center gap-3 hover:text-primary transition-colors group">
                      <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                        </svg>
                      </span>
                      abdulganiyu838@gmail.com
                    </a>
                    <a href="https://t.me/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 hover:text-primary transition-colors group">
                      <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.744-3.776 15.314-3.776 15.314s-.237.588-.884.588c-.317 0-.637-.122-.884-.477 0 0-2.643-2.063-3.77-3.087-.245-.221-.521-.633.043-1.125l3.936-3.733c.275-.262.275-.483.275-.483s-1.482.372-2.589.372c-.261 0-.566-.038-.871-.261-.479-.353-.479-.995-.479-.995s6.491-2.724 6.491-2.724.588-.261 1.004-.261c.152 0 .323.037.442.11.359.221.359.744.359.744s-.152 4.492-.296 5.018z"/>
                        </svg>
                      </span>
                      @cryptonique
                    </a>
                    <a href="https://x.com/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 hover:text-primary transition-colors group">
                      <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </span>
                      @cryptonique
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}