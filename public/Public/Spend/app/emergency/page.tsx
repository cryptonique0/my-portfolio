"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmergencyView } from "@/components/emergency/emergency-view";
import { EmergencyContacts } from "@/components/settings/emergency-contacts";

export default function EmergencyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
                    <EmergencyView />
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <EmergencyContacts />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
