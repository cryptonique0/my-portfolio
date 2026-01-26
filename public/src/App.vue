<template>
  <div id="app" class="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🪂 AirStack</h1>
        <p class="app-subtitle">Token Airdrop System on Stacks</p>
      </div>
      <WalletConnect />
    </header>

    <main class="app-main">
      <section class="hero">
        <h2>Efficient Token Distribution</h2>
        <p>
          AirStack is a comprehensive airdrop system with wallet integration,
          vesting schedules, governance, and analytics.
        </p>
      </section>

      <section class="features">
        <h3>Key Features</h3>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="feature-icon">🔐</span>
            <h4>Wallet Support</h4>
            <p>Connect with Xverse, Leather, Hiro, and more Stacks wallets</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🌳</span>
            <h4>Merkle Trees</h4>
            <p>Gas-efficient proof-based token claims</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">⏰</span>
            <h4>Vesting</h4>
            <p>Time-locked distributions with cliff periods</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🗳️</span>
            <h4>Governance</h4>
            <p>Community voting on airdrop proposals</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">📊</span>
            <h4>Analytics</h4>
            <p>Track distributions and claim metrics</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🔄</span>
            <h4>Batch Processing</h4>
            <p>Distribute to hundreds of addresses at once</p>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h3>Getting Started</h3>
        <div class="info-content">
          <div class="step">
            <span class="step-number">1</span>
            <div>
              <h4>Connect Your Wallet</h4>
              <p>
                Click "Connect Wallet" at the top to link your Stacks wallet
              </p>
            </div>
          </div>

          <div class="step">
            <span class="step-number">2</span>
            <div>
              <h4>View Airdrop Campaigns</h4>
              <p>Browse active airdrops and your eligible claims</p>
            </div>
          </div>

          <div class="step">
            <span class="step-number">3</span>
            <div>
              <h4>Claim Tokens</h4>
              <p>Claim your tokens from active campaigns</p>
            </div>
          </div>

          <div class="step">
            <span class="step-number">4</span>
            <div>
              <h4>Participate in Governance</h4>
              <p>Vote on proposals to shape future airdrops</p>
            </div>
          </div>
        </div>
      </section>

      <section class="tech-stack">
        <h3>Built With</h3>
        <div class="tech-items">
          <span class="tech-item">Stacks Blockchain</span>
          <span class="tech-item">Clarity Smart Contracts</span>
          <span class="tech-item">Xverse Wallet</span>
          <span class="tech-item">Leather Wallet</span>
          <span class="tech-item">WalletConnect</span>
          <span class="tech-item">Vue 3</span>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; 2024 AirStack. All rights reserved.</p>
      <div class="footer-links">
        <a href="https://github.com/cryptonique0/AirStack" target="_blank"
          >GitHub</a
        >
        <a href="#docs">Documentation</a>
        <a href="#support">Support</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import WalletConnect from './components/WalletConnect.vue';
</script>

<style scoped>
:root {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e0e0e0;
  --success: #4caf50;
  --error: #ff6b6b;
}

.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 40px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.app-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
}

.app-subtitle {
  margin: 8px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 80px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--border-color);
}

.hero h2 {
  font-size: 36px;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  margin-bottom: 80px;
}

.features h3 {
  font-size: 28px;
  margin: 0 0 40px 0;
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.feature-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.feature-card h4 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.feature-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.info-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 48px 40px;
  margin-bottom: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-section h3 {
  font-size: 28px;
  margin: 0 0 40px 0;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.step {
  display: flex;
  gap: 20px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 20px;
  flex-shrink: 0;
}

.step h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 16px;
}

.step p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.tech-stack {
  text-align: center;
}

.tech-stack h3 {
  font-size: 28px;
  margin: 0 0 32px 0;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.tech-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--primary);
  transition: all 0.2s;
}

.tech-item:hover {
  background: var(--primary);
  color: white;
}

.app-footer {
  background: var(--text-primary);
  color: white;
  padding: 40px 20px;
  text-align: center;
  margin-top: 60px;
}

.app-footer p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-links a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.2s;
}

.footer-links a:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 20px;
  }

  .app-main {
    padding: 40px 16px;
  }

  .hero h2 {
    font-size: 24px;
  }

  .hero p {
    font-size: 16px;
  }

  .features h3,
  .info-section h3,
  .tech-stack h3 {
    font-size: 22px;
  }

  .app-title {
    font-size: 24px;
  }

  .feature-grid,
  .info-content {
    gap: 16px;
  }

  .info-section {
    padding: 32px 20px;
  }
}
</style>
