'use client';

import { useState } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuardianReputationRankings } from '@/components/guardians/guardian-reputation-rankings';
import { GuardianActivityRankings } from '@/components/guardians/guardian-activity-rankings';
import { GuardianBadgeDisplay } from '@/components/guardians/guardian-badge-display';
import { GuardianKnowledgeBase } from '@/components/guardians/guardian-knowledge-base';
import { ManageGuardiansView } from "@/components/guardians/manage-view";
import { Award, TrendingUp, Trophy, BookOpen, Settings } from 'lucide-react';

export default function GuardiansPage() {
    const [activeTab, setActiveTab] = useState('reputation');

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col justify-start px-6 py-8 md:px-8 md:py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Guardian Management</h1>
                    <p className="text-lg text-muted-foreground">
                        Manage, monitor, and evaluate your vault guardians
                    </p>
                </div>

                {/* Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                        <TabsTrigger value="reputation" className="gap-2">
                            <Award className="h-4 w-4" />
                            <span className="hidden sm:inline">Reputation</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Activity</span>
                        </TabsTrigger>
                        <TabsTrigger value="badges" className="gap-2">
                            <Trophy className="h-4 w-4" />
                            <span className="hidden sm:inline">Badges</span>
                        </TabsTrigger>
                        <TabsTrigger value="help" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Help</span>
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Manage</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Contents */}
                    <TabsContent value="reputation" className="space-y-6">
                        <GuardianReputationRankings />
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <GuardianActivityRankings />
                    </TabsContent>

                    <TabsContent value="badges" className="space-y-6">
                        <GuardianBadgeDisplay />
                    </TabsContent>

                    <TabsContent value="help" className="space-y-6">
                        <GuardianKnowledgeBase />
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-6">
                        <ManageGuardiansView />
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
