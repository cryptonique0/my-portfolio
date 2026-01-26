import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ActivityDashboard } from "@/components/activity-dashboard";

export default function ActivityPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                <ActivityDashboard />
            </main>
            <Footer />
        </div>
    );
}
