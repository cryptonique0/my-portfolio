import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Last updated: January 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        {/* 1. Overview */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                1. Privacy Overview
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy 
                                    explains how we collect, use, disclose, and safeguard your information when you use our 
                                    application, website, and services (collectively, the "Service").
                                </p>
                                <p>
                                    Please read this Privacy Policy carefully. If you do not agree with our policies and practices, 
                                    please do not use our Service.
                                </p>
                            </div>
                        </section>

                        {/* 2. Non-Custodial Nature */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                2. Non-Custodial & Decentralized Architecture
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard is a non-custodial service. This means:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>We do not hold your funds</strong> - Your cryptocurrency remains in smart contracts you control</li>
                                    <li><strong>We do not store private keys</strong> - Your keys remain exclusively with you</li>
                                    <li><strong>We do not control your wallet</strong> - You maintain full ownership and control</li>
                                    <li><strong>We do not have access to your assets</strong> - Your funds are not accessible to us</li>
                                    <li><strong>We cannot recover lost keys</strong> - Only you can access your accounts</li>
                                </ul>
                                <p className="mt-4">
                                    This architecture provides maximum security and privacy but means you are responsible 
                                    for protecting your credentials.
                                </p>
                            </div>
                        </section>

                        {/* 3. Blockchain Data Transparency */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                3. Blockchain Data Transparency
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard operates on public blockchains. Be aware that:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>All transactions are publicly visible on the blockchain</li>
                                    <li>Wallet addresses and transaction amounts are publicly viewable</li>
                                    <li>Blockchain transactions cannot be deleted or modified</li>
                                    <li>Your public wallet address is linked to your activity</li>
                                    <li>Transaction history is permanently recorded</li>
                                </ul>
                                <p className="mt-4">
                                    We do not control blockchain transparency. Your financial activity on the blockchain 
                                    is inherently public and permanent.
                                </p>
                            </div>
                        </section>

                        {/* 4. Information We Collect */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                4. Information We Collect
                            </h2>
                            <div className="space-y-4 text-slate-700 dark:text-slate-300">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.1 Information You Provide</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Wallet address (public)</li>
                                        <li>Guardian addresses (public)</li>
                                        <li>Email address (optional, for notifications)</li>
                                        <li>Vault configuration and settings</li>
                                        <li>Display name or profile information (optional)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.2 Information Automatically Collected</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Browser type and version</li>
                                        <li>Device type and operating system</li>
                                        <li>IP address (for security and fraud prevention)</li>
                                        <li>Pages visited and time spent</li>
                                        <li>Referral information</li>
                                        <li>Interaction with Service features</li>
                                        <li>Error logs and system diagnostics</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.3 Blockchain-Based Information</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Your public wallet address</li>
                                        <li>Transaction hashes and amounts</li>
                                        <li>Guardian voting history</li>
                                        <li>Vault configuration parameters</li>
                                        <li>Smart contract interaction events</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 5. How We Use Information */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                5. How We Use Your Information
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>We use collected information to:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Provide and improve the Service</li>
                                    <li>Authenticate your identity and secure your account</li>
                                    <li>Process transactions and send notifications</li>
                                    <li>Detect and prevent fraud and security violations</li>
                                    <li>Debug and troubleshoot technical issues</li>
                                    <li>Analyze usage patterns and improve user experience</li>
                                    <li>Comply with legal obligations</li>
                                    <li>Send updates about the Service (if you opt-in)</li>
                                </ul>
                            </div>
                        </section>

                        {/* 6. Data Sharing & Disclosure */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                6. Data Sharing & Disclosure
                            </h2>
                            <div className="space-y-4 text-slate-700 dark:text-slate-300">
                                <p>We may disclose information in the following circumstances:</p>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">6.1 Legal Compliance</h3>
                                    <p>
                                        We may disclose information when required by law, court order, subpoena, or 
                                        governmental request.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">6.2 Service Providers</h3>
                                    <p>
                                        We may share information with third-party service providers who assist us in 
                                        operating the Service (analytics, hosting, security) under confidentiality agreements.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">6.3 Business Transfers</h3>
                                    <p>
                                        If SpendGuard is acquired or merged, information may be transferred as part of 
                                        that transaction.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">6.4 With Your Consent</h3>
                                    <p>
                                        We may share information with third parties when you explicitly consent.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">6.5 Public Blockchain Data</h3>
                                    <p>
                                        Wallet addresses and transaction history are inherently public on blockchains 
                                        and cannot be kept private.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 7. Cookies & Tracking */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                7. Cookies & Tracking Technologies
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    We use cookies and similar technologies to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Remember your login information (session cookies)</li>
                                    <li>Track website usage and analytics</li>
                                    <li>Improve user experience</li>
                                    <li>Detect fraud and security threats</li>
                                </ul>
                                <p className="mt-4">
                                    You can control cookies through your browser settings. Disabling cookies may limit 
                                    Service functionality.
                                </p>
                            </div>
                        </section>

                        {/* 8. Third-Party Services */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                8. Third-Party Services & Integrations
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard integrates with third-party services including:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Wallet providers (MetaMask, WalletConnect, Coinbase Wallet)</li>
                                    <li>Blockchain networks (Ethereum, Base Sepolia)</li>
                                    <li>Analytics services</li>
                                    <li>Email notification services</li>
                                </ul>
                                <p className="mt-4">
                                    These services have their own privacy policies. We are not responsible for their 
                                    data practices. Review their policies before using their services.
                                </p>
                            </div>
                        </section>

                        {/* 9. Data Security */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                9. Data Security
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    We implement industry-standard security measures including:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>HTTPS encryption for data in transit</li>
                                    <li>Secure authentication protocols</li>
                                    <li>Regular security audits and penetration testing</li>
                                    <li>Minimal data retention (see retention policy)</li>
                                    <li>Access controls and role-based permissions</li>
                                </ul>
                                <p className="mt-4">
                                    However, no security system is completely secure. We cannot guarantee absolute 
                                    protection from all threats.
                                </p>
                            </div>
                        </section>

                        {/* 10. Data Retention */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                10. Data Retention
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>We retain information as follows:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Account information:</strong> Retained while account is active</li>
                                    <li><strong>Transaction logs:</strong> Retained for 12 months</li>
                                    <li><strong>Analytics data:</strong> Retained for 90 days</li>
                                    <li><strong>Security logs:</strong> Retained for 180 days</li>
                                    <li><strong>Blockchain data:</strong> Permanently recorded (not within our control)</li>
                                </ul>
                                <p className="mt-4">
                                    You may request deletion of personal data subject to legal and operational requirements.
                                </p>
                            </div>
                        </section>

                        {/* 11. Your Privacy Rights */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                11. Your Privacy Rights
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    Depending on your jurisdiction, you may have the following rights:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                                    <li><strong>Right to Deletion:</strong> Request deletion of your data</li>
                                    <li><strong>Right to Correction:</strong> Correct inaccurate information</li>
                                    <li><strong>Right to Portability:</strong> Receive data in machine-readable format</li>
                                    <li><strong>Right to Object:</strong> Opt-out of data processing</li>
                                    <li><strong>Right to Withdraw Consent:</strong> Stop email communications</li>
                                </ul>
                                <p className="mt-4">
                                    To exercise these rights, contact us through our support portal. We will respond 
                                    within 30 days.
                                </p>
                            </div>
                        </section>

                        {/* 12. Children's Privacy */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                12. Children's Privacy
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard is not intended for children under 18 years of age. We do not knowingly 
                                    collect information from children. If we become aware that we have collected information 
                                    from a child under 18, we will delete such information promptly.
                                </p>
                            </div>
                        </section>

                        {/* 13. International Data Transfers */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                13. International Data Transfers
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    Your information may be transferred to, stored in, and processed in countries other 
                                    than your country of residence, which may have different data protection laws. By using 
                                    SpendGuard, you consent to such transfers.
                                </p>
                            </div>
                        </section>

                        {/* 14. Anonymized & Aggregated Data */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                14. Anonymized & Aggregated Data
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    We may collect, use, and disclose anonymized and aggregated data that cannot identify 
                                    you personally. This includes:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Usage statistics and trends</li>
                                    <li>Feature popularity analysis</li>
                                    <li>Demographic information in aggregate</li>
                                </ul>
                                <p className="mt-4">
                                    This data may be used for research, analytics, and improving the Service.
                                </p>
                            </div>
                        </section>

                        {/* 15. Email Communications */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                15. Email Communications
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    If you provide an email address, we may send:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Transaction notifications (withdrawal approvals, deposits)</li>
                                    <li>Security alerts (unauthorized access attempts)</li>
                                    <li>Service updates (feature releases, maintenance)</li>
                                    <li>Marketing communications (with your consent)</li>
                                </ul>
                                <p className="mt-4">
                                    You can manage email preferences in your account settings and unsubscribe from 
                                    non-essential communications.
                                </p>
                            </div>
                        </section>

                        {/* 16. Contact & Data Requests */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                16. Contact & Data Requests
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    To exercise your privacy rights or request information about our privacy practices:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Use our in-app contact support form</li>
                                    <li>Submit a request through our GitHub repository</li>
                                    <li>Join our community Discord to report concerns</li>
                                </ul>
                                <p className="mt-4">
                                    We will verify your identity and respond to legitimate requests within 30 days.
                                </p>
                            </div>
                        </section>

                        {/* 17. Changes to Privacy Policy */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                17. Changes to This Privacy Policy
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    We may update this Privacy Policy periodically. Changes will be posted with the 
                                    "Last updated" date. Continued use of the Service after changes constitutes acceptance 
                                    of the updated policy. We encourage you to review this policy regularly.
                                </p>
                            </div>
                        </section>

                        {/* 18. Decentralization Notice */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                18. Blockchain Decentralization Notice
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard leverages decentralized blockchain technology. This means:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Smart contracts execute autonomously without our intervention</li>
                                    <li>Blockchain data is replicated across thousands of nodes</li>
                                    <li>Transactions cannot be undone or deleted</li>
                                    <li>We cannot access or modify blockchain data</li>
                                    <li>Guardian agreements are self-executing via smart contracts</li>
                                </ul>
                            </div>
                        </section>

                        {/* Final Notice */}
                        <section className="mt-12 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                <span className="font-semibold">🔒 Privacy Commitment:</span> We take your privacy seriously. 
                                However, by using SpendGuard, you acknowledge the inherent transparency of blockchain 
                                technology and the non-custodial nature of our service. Your financial data on the blockchain 
                                is permanent and public.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
