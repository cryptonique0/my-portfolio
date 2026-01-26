import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NotificationsClient } from "@/components/notifications/notifications-page-client";

export default function NotificationsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Notifications Center
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Manage all your alerts and notification preferences
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-surface-border">
                        <button className="px-4 py-3 border-b-2 border-primary font-semibold text-primary dark:text-primary transition-colors">
                            All Notifications
                        </button>
                        <a href="/settings?tab=notifications" className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors">
                            Preferences
                        </a>
                    </div>

                    {/* Notifications List */}
                    <NotificationsClient />
                </div>
            </main>
            <Footer />
        </div>
    );
}
