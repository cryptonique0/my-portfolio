import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Last updated: January 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        {/* 1. Introduction */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                1. Introduction
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                Welcome to SpendGuard ("Platform", "we", "our", or "us"). These Terms of Service ("Terms") 
                                govern your access to and use of the SpendGuard application, website, and services 
                                (collectively, the "Service"). By accessing or using SpendGuard, you agree to be bound 
                                by these Terms. If you do not agree to any part of these Terms, you may not use the Service.
                            </p>
                        </section>

                        {/* 2. Eligibility */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                2. Eligibility
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>To use SpendGuard, you must:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
                                    <li>Have the legal capacity to enter into binding contracts</li>
                                    <li>Not be restricted or prohibited from using the Service under applicable laws</li>
                                    <li>Have a valid Ethereum wallet and network connection</li>
                                    <li>Be responsible for maintaining the confidentiality of your private keys and account credentials</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. User Accounts & Wallets */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                3. User Accounts & Wallets
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard uses blockchain-based wallets for account management. You are solely 
                                    responsible for:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Maintaining the security of your private keys and seed phrases</li>
                                    <li>Preventing unauthorized access to your wallet and accounts</li>
                                    <li>Updating your password and security settings promptly</li>
                                    <li>Notifying us immediately of unauthorized account access</li>
                                </ul>
                                <p className="mt-4">
                                    We cannot recover lost or stolen private keys. You assume all responsibility for 
                                    activities that occur under your account.
                                </p>
                            </div>
                        </section>

                        {/* 4. Smart Contracts & Blockchain */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                4. Smart Contracts & Blockchain
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard operates on smart contracts deployed on the Ethereum blockchain 
                                    (Base Sepolia testnet for testing). You acknowledge that:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Blockchain transactions are immutable and irreversible</li>
                                    <li>Smart contract code may contain vulnerabilities or bugs</li>
                                    <li>We are not responsible for loss of funds due to smart contract exploits</li>
                                    <li>Gas fees and transaction costs are your responsibility</li>
                                    <li>Network congestion may delay transaction processing</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Vault Deposits & Funds */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                5. Vault Deposits & Funds
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    When you deposit funds into your SpendGuard vault:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>You retain ownership of your deposited funds</li>
                                    <li>Your funds are locked according to your vault settings</li>
                                    <li>Guardian approval may be required for withdrawals</li>
                                    <li>Spending limits and time-locks are enforced by smart contracts</li>
                                    <li>We do not hold or control your funds directly</li>
                                </ul>
                                <p className="mt-4">
                                    SpendGuard is a non-custodial service. You are responsible for monitoring 
                                    your vault balance and transaction history.
                                </p>
                            </div>
                        </section>

                        {/* 6. Guardian Participation */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                6. Guardian Participation
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    If you participate as a guardian:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>You agree to participate in good faith</li>
                                    <li>You are responsible for voting on withdrawal requests diligently</li>
                                    <li>You may receive compensation (ETH or tokens) for participation</li>
                                    <li>You cannot reverse or undo your voting decisions</li>
                                    <li>Guardians hold no liability for vault owner decisions</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Disclaimers & Limitations of Liability */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                7. Disclaimers & Limitations of Liability
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p className="font-semibold">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES.</p>
                                <p>
                                    SpendGuard disclaims all warranties, express or implied, including but not limited to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Implied warranties of merchantability or fitness for a particular purpose</li>
                                    <li>Warranties regarding the accuracy, completeness, or timeliness of information</li>
                                    <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                                </ul>
                                <p className="mt-4">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Loss of funds or cryptocurrency</li>
                                    <li>Smart contract vulnerabilities or exploits</li>
                                    <li>Network or blockchain failures</li>
                                    <li>Loss of private keys or wallet access</li>
                                    <li>Indirect, incidental, consequential, or special damages</li>
                                    <li>Loss of profits, revenue, or business opportunity</li>
                                </ul>
                            </div>
                        </section>

                        {/* 8. Risk Acknowledgment */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                8. Risk Acknowledgment
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    You acknowledge the following risks:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Cryptocurrency and smart contracts are experimental technologies</li>
                                    <li>Market volatility may affect asset values</li>
                                    <li>Regulatory changes may impact blockchain operations</li>
                                    <li>Smart contract bugs may result in permanent loss of funds</li>
                                    <li>No insurance or government protection for cryptocurrency assets</li>
                                    <li>Guardian conflicts or unavailability may occur</li>
                                </ul>
                            </div>
                        </section>

                        {/* 9. Prohibited Activities */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                9. Prohibited Activities
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    You agree not to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Use the Service for illegal activities or money laundering</li>
                                    <li>Attempt to exploit smart contracts or blockchain vulnerabilities</li>
                                    <li>Harass, abuse, or threaten other users or guardians</li>
                                    <li>Interfere with the Service's operation or other users' access</li>
                                    <li>Use the Service to violate sanctions or trade restrictions</li>
                                    <li>Engage in fraud, market manipulation, or insider trading</li>
                                    <li>Reverse engineer or attempt to access non-public parts of the Service</li>
                                </ul>
                            </div>
                        </section>

                        {/* 10. Privacy & Data */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                10. Privacy & Data
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    Your use of SpendGuard is subject to our Privacy Policy. Blockchain transactions 
                                    and wallet addresses are publicly visible on the blockchain. We do not store your 
                                    private keys or seed phrases.
                                </p>
                            </div>
                        </section>

                        {/* 11. Intellectual Property */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                11. Intellectual Property
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard's code, design, and documentation are protected by copyright and 
                                    intellectual property laws. You may use the Service for personal, non-commercial purposes. 
                                    Unauthorized copying, modification, or distribution is prohibited.
                                </p>
                            </div>
                        </section>

                        {/* 12. Third-Party Services */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                12. Third-Party Services
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    SpendGuard may integrate with third-party services (wallets, networks, APIs). 
                                    We are not responsible for third-party service availability, security, or performance. 
                                    Use of third-party services is governed by their respective terms.
                                </p>
                            </div>
                        </section>

                        {/* 13. Modifications to Service */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                13. Modifications to Service
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    We reserve the right to modify, suspend, or discontinue the Service at any time. 
                                    Changes to these Terms will be posted with notice. Continued use of the Service 
                                    after changes constitutes acceptance of new Terms.
                                </p>
                            </div>
                        </section>

                        {/* 14. Termination */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                14. Termination
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    Your right to use the Service may be terminated if you violate these Terms or engage 
                                    in prohibited activities. You may stop using the Service at any time. Termination does 
                                    not affect your rights to withdrawn funds from your vault.
                                </p>
                            </div>
                        </section>

                        {/* 15. Governing Law */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                15. Governing Law & Jurisdiction
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    These Terms are governed by the laws of the jurisdiction where the Service 
                                    is principally operated, without regard to conflicts of law principles. 
                                    You agree to submit to the exclusive jurisdiction of courts in that jurisdiction.
                                </p>
                            </div>
                        </section>

                        {/* 16. Dispute Resolution */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                16. Dispute Resolution
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    Any disputes arising out of these Terms or the Service will be resolved through:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>First, good faith negotiation between the parties</li>
                                    <li>Then, binding arbitration if negotiation fails</li>
                                    <li>Arbitration will be conducted according to applicable rules</li>
                                </ul>
                            </div>
                        </section>

                        {/* 17. Indemnification */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                17. Indemnification
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    You agree to indemnify and hold harmless SpendGuard and its officers, employees, 
                                    and agents from any claims, damages, or liabilities arising from:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Your use of the Service</li>
                                    <li>Your violation of these Terms</li>
                                    <li>Your violation of applicable laws</li>
                                    <li>Your infringement of third-party rights</li>
                                </ul>
                            </div>
                        </section>

                        {/* 18. Contact & Support */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                18. Contact & Support
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    For questions about these Terms, please contact us through:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Our support portal within the application</li>
                                    <li>GitHub issues on our open-source repository</li>
                                    <li>Community Discord server</li>
                                </ul>
                            </div>
                        </section>

                        {/* 19. Entire Agreement */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                19. Entire Agreement
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    These Terms, along with our Privacy Policy, constitute the entire agreement 
                                    between you and SpendGuard regarding the Service. Any prior agreements or 
                                    understandings are superseded by these Terms.
                                </p>
                            </div>
                        </section>

                        {/* 20. Severability */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                20. Severability
                            </h2>
                            <div className="space-y-3 text-slate-700 dark:text-slate-300">
                                <p>
                                    If any provision of these Terms is found to be invalid or unenforceable, 
                                    that provision will be modified to the minimum extent necessary to make it 
                                    enforceable, and the remaining provisions will continue in full effect.
                                </p>
                            </div>
                        </section>

                        {/* Final Notice */}
                        <section className="mt-12 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                <span className="font-semibold">⚠️ Important Notice:</span> SpendGuard operates on 
                                experimental blockchain technology. These Terms are designed to protect both users 
                                and the platform. Please read carefully and ensure you understand all risks before 
                                using the Service.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
