'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Modal from './components/Modal';
import StarryBackground from './components/StarryBackground';
import ProjectCard from './components/ProjectCard';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modal: string) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <main className="min-h-screen relative">
      <Toaster />
      <div className="bg-gradient"></div>
      <StarryBackground />
      <Header openModal={openModal} />
      
      {/* Hero Section */}
      <section className="section relative">
        <div className="container flex flex-col items-center justify-center text-center min-h-[90vh]">
          <div className="relative w-40 h-40 mb-8 rounded-full overflow-hidden border-4 border-primary/30 glow">
            <Image
              src="/profile-placeholder.jpg"
              alt="Profile"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="slide-up mb-4">
            CRYPTONIQUE
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-12 text-text-secondary slide-up delay-1">
            Building the Future of Web Decentraliazation
          </p>
          <div className="flex flex-wrap justify-center gap-6 slide-up delay-2">
            <button 
              onClick={() => openModal('projects')}
              className="btn btn-primary"
            >
              View Projects
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
              </svg>
            </button>
            <button 
              onClick={() => openModal('contact')}
              className="btn btn-secondary"
            >
              Get in Touch
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section bg-bg-light/5">
        <div className="container">
          <h2 className="text-center mb-16">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card slide-up delay-1">
              <h3 className="text-xl font-semibold mb-4">NFT Marketplace</h3>
              <p className="text-text-secondary mb-6">
                A decentralized marketplace built on the Sui blockchain, enabling users to mint, buy, sell, and trade NFTs.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Key Features</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• Custom NFT minting interface</li>
                    <li>• Automated royalty distribution</li>
                    <li>• Real-time price updates</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Move</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">React</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">TypeScript</span>
                  </div>
                </div>
                <button 
                  onClick={() => openModal('project-nft')} 
                  className="w-full mt-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                >
                  Learn More →
                </button>
              </div>
            </div>

            <div className="card slide-up delay-2">
              <h3 className="text-xl font-semibold mb-4">DeFi Protocol</h3>
              <p className="text-text-secondary mb-6">
                An automated market maker protocol enabling users to provide liquidity and trade tokens with minimal slippage.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Key Features</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• Constant product AMM model</li>
                    <li>• Flash loan prevention</li>
                    <li>• Yield farming capabilities</li>
                    <li>• Governance token integration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Solidity</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Web3.js</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Next.js</span>
                  </div>
                </div>
                <button 
                  onClick={() => openModal('project-defi')} 
                  className="w-full mt-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                >
                  Learn More →
                </button>
              </div>
            </div>

            <div className="card slide-up delay-3">
              <h3 className="text-xl font-semibold mb-4">Smart Contract Development</h3>
              <p className="text-text-secondary mb-6">
                Various smart contracts for DeFi and NFT projects, focusing on security, efficiency, and composability.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Key Features</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• ERC standards implementation</li>
                    <li>• Gas optimization</li>
                    <li>• Secure access control</li>
                    <li>• Upgradeable contracts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary/80 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Solidity</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Hardhat</span>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary">Ethers.js</span>
                  </div>
                </div>
                <button 
                  onClick={() => openModal('project-smart-contracts')} 
                  className="w-full mt-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-16">Skills & Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card slide-up delay-1">
              <h3 className="text-xl font-semibold mb-4">Blockchain Development</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>Solidity & Move Smart Contracts</li>
                <li>DeFi Protocol Development</li>
                <li>NFT Standards (ERC-721, ERC-1155)</li>
                <li>Web3.js & Ethers.js</li>
              </ul>
            </div>
            <div className="card slide-up delay-2">
              <h3 className="text-xl font-semibold mb-4">Frontend Development</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>React & Next.js</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Web3 Integration</li>
              </ul>
            </div>
            <div className="card slide-up delay-3">
              <h3 className="text-xl font-semibold mb-4">Tools & Frameworks</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>Hardhat & Truffle</li>
                <li>IPFS & Filecoin</li>
                <li>GraphQL & The Graph</li>
                <li>Git & GitHub</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section bg-bg-light/5">
        <div className="container">
          <h2 className="text-center mb-16">Get in Touch</h2>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xl text-text-secondary mb-8">
                Interested in collaborating or have a project in mind? Let's connect and create something amazing together!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card slide-up delay-1">
                <h3 className="text-lg font-semibold mb-4">Direct Contact</h3>
                <div className="space-y-4">
                  <a href="mailto:cryptonique@web3mail.com" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                      </svg>
                    </span>
                    cryptonique@web3mail.com
                  </a>
                  <a href="https://t.me/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.744-3.776 15.314-3.776 15.314s-.237.588-.884.588c-.317 0-.637-.122-.884-.477 0 0-2.643-2.063-3.77-3.087-.245-.221-.521-.633.043-1.125l3.936-3.733c.275-.262.275-.483.275-.483s-1.482.372-2.589.372c-.261 0-.566-.038-.871-.261-.479-.353-.479-.995-.479-.995s6.491-2.724 6.491-2.724.588-.261 1.004-.261c.152 0 .323.037.442.11.359.221.359.744.359.744s-.152 4.492-.296 5.018z"/>
                      </svg>
                    </span>
                    @cryptonique
                  </a>
                  <a href="https://x.com/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </span>
                    @cryptonique
                  </a>
                </div>
              </div>
              <div className="card slide-up delay-2">
                <h3 className="text-lg font-semibold mb-4">Other Platforms</h3>
                <div className="space-y-4">
                  <a href="https://github.com/cryptonique0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </span>
                    github.com/cryptonique0
                  </a>
                  <a href="https://discord.com/users/cryptonique#1234" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <span className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                      </svg>
                    </span>
                    cryptonique#1234
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <Modal isOpen={activeModal === 'about'} onClose={closeModal} title="About Me">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-lg text-text-secondary">
              Hi, I'm Cryptonique, a full-stack developer passionate about building clean, scalable web apps using React, Node.js, and MongoDB.
            </p>
            <p>
              As a Web3 developer specializing in blockchain technology and decentralized applications, I combine my full-stack expertise with blockchain knowledge to create secure and efficient solutions for the decentralized web. With a strong foundation in both front-end and smart contract development, I focus on building robust and user-friendly dApps that bridge traditional web development with blockchain innovation.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold">My expertise includes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-primary/80 font-medium">Web3 Development</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary">
                  <li>Smart Contract Development (Solidity, Move)</li>
                  <li>DeFi Protocol Implementation</li>
                  <li>NFT Collection Development</li>
                  <li>Web3 Integration (Web3.js, Ethers.js)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-primary/80 font-medium">Full-Stack Development</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary">
                  <li>Frontend (React, Next.js)</li>
                  <li>Backend (Node.js, Express)</li>
                  <li>Database (MongoDB, PostgreSQL)</li>
                  <li>API Design & Integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'project-nft'} onClose={closeModal} title="NFT Marketplace">
        <div className="space-y-4">
          <p>
            A full-featured NFT marketplace built on the Sui blockchain, enabling users to mint, buy, sell, and trade NFTs in a decentralized manner.
          </p>
          <h3 className="font-semibold">Key Features:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Custom NFT minting interface</li>
            <li>Automated royalty distribution</li>
            <li>Real-time price updates</li>
            <li>Multi-wallet support</li>
          </ul>
          <p className="font-semibold mt-4">Tech Stack:</p>
          <p>Move, React, TypeScript, Sui SDK, TailwindCSS</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'project-defi'} onClose={closeModal} title="DeFi Protocol">
        <div className="space-y-4">
          <p>
            An automated market maker protocol that enables users to provide liquidity and trade tokens with minimal slippage.
          </p>
          <h3 className="font-semibold">Key Features:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Constant product AMM model</li>
            <li>Flash loan prevention</li>
            <li>Yield farming capabilities</li>
            <li>Governance token integration</li>
          </ul>
          <p className="font-semibold mt-4">Tech Stack:</p>
          <p>Solidity, Web3.js, Next.js, Hardhat</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contact">
        <div className="space-y-4">
          <p>
            Interested in collaborating or have a project in mind? Let's connect!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Direct Contact</h3>
              <div className="space-y-2">
                <a href="mailto:cryptonique@web3mail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  cryptonique@web3mail.com
                </a>
                <a href="https://t.me/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.744-3.776 15.314-3.776 15.314s-.237.588-.884.588c-.317 0-.637-.122-.884-.477 0 0-2.643-2.063-3.77-3.087-.245-.221-.521-.633.043-1.125l3.936-3.733c.275-.262.275-.483.275-.483s-1.482.372-2.589.372c-.261 0-.566-.038-.871-.261-.479-.353-.479-.995-.479-.995s6.491-2.724 6.491-2.724.588-.261 1.004-.261c.152 0 .323.037.442.11.359.221.359.744.359.744s-.152 4.492-.296 5.018z"/>
                  </svg>
                  @cryptonique
                </a>
                <a href="https://x.com/cryptonique" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @cryptonique
                </a>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Other Platforms</h3>
              <div className="space-y-2">
                <a href="https://github.com/cryptonique0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  github.com/cryptonique0
                </a>
                <a href="https://discord.com/users/cryptonique#1234" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                  </svg>
                  cryptonique#1234
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}