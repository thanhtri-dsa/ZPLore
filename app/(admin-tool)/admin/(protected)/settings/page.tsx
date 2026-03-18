'use client';

import React, { useState, useEffect } from 'react';
import {
  OrganizationProfile,
  OrganizationList,
  useOrganization,
  CreateOrganization
} from '@clerk/nextjs';

import { Users, Building, Settings, Shield, Globe, Zap, RefreshCw } from "lucide-react";
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClerkEnabled } from '@/components/clerk-enabled'

export default function SettingsPage() {
  const clerkEnabled = useClerkEnabled()
  if (!clerkEnabled) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-none saas-glass rounded-[2.5rem] p-8">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-amber-50 p-4 rounded-3xl w-fit">
              <Settings className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900">System Configuration</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Enterprise settings are currently restricted.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Please enable Clerk by setting <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">FORCE_CLERK_AUTH=true</span> and configuring valid API keys.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SettingsPageWithClerk />
}

function SettingsPageWithClerk() {
  const [showCreateOrg, setShowCreateOrg] = useState<boolean>(false);
  const { organization, isLoaded } = useOrganization();
  const [isCreatingOrg, setIsCreatingOrg] = useState<boolean>(false);

  useEffect(() => {
    if (organization && isCreatingOrg) {
      setIsCreatingOrg(false);
      setShowCreateOrg(false);
    }
  }, [organization, isCreatingOrg]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" aria-label="Loading"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="border-none saas-glass rounded-[3rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto bg-emerald-50 p-4 rounded-[2rem] w-fit shadow-inner">
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Establish Organization</CardTitle>
                <CardDescription className="text-slate-500 font-bold max-w-xs mx-auto">
                  You need to create or join an organization to access collaborative team features.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="clerk-create-org-wrapper">
                <style jsx global>{`
                  .clerk-create-org-wrapper .cl-rootBox { width: 100%; }
                  .clerk-create-org-wrapper .cl-card { 
                    border: none !important; 
                    box-shadow: none !important; 
                    background: #f8fafc !important; 
                    border-radius: 2rem !important;
                    padding: 2rem !important;
                  }
                  .clerk-create-org-wrapper .cl-headerTitle { font-weight: 800 !important; }
                  .clerk-create-org-wrapper .cl-formButtonPrimary {
                    background-color: #064e3b !important;
                    border-radius: 1rem !important;
                    height: 3rem !important;
                    font-weight: 700 !important;
                  }
                `}</style>
                <CreateOrganization
                  afterCreateOrganizationUrl="/admin/settings"
                  routing="hash"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1 opacity-80">
            <Building className="h-3 w-3" />
            <span>Workspace Infrastructure</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            System Settings
          </h1>
          <p className="text-sm text-slate-500 font-bold max-w-xl leading-relaxed">
            Configure your organization, team members, and global preferences.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs defaultValue="organization" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="h-14 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[1.25rem] border border-slate-200/50">
              <TabsTrigger value="organization" className="px-8 rounded-xl font-black text-xs tracking-wider data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">
                ORGANIZATION
              </TabsTrigger>
              <TabsTrigger value="members" className="px-8 rounded-xl font-black text-xs tracking-wider data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">
                TEAM ACCESS
              </TabsTrigger>
              <TabsTrigger value="billing" className="px-8 rounded-xl font-black text-xs tracking-wider data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">
                INFRASTRUCTURE
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="organization" className="focus-visible:outline-none">
            <div className="saas-card p-1 overflow-hidden">
              <div className="clerk-org-profile-wrapper">
                <style jsx global>{`
                  .clerk-org-profile-wrapper .cl-card {
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                  .clerk-org-profile-wrapper .cl-navbar {
                    border-right: 1px solid #f1f5f9 !important;
                    padding: 2rem !important;
                  }
                  .clerk-org-profile-wrapper .cl-scrollBox {
                    padding: 2rem !important;
                  }
                  .clerk-org-profile-wrapper .cl-headerTitle {
                    font-weight: 900 !important;
                  }
                  .clerk-org-profile-wrapper .cl-navbarButton[data-active="true"] {
                    background: #f0fdf4 !important;
                    color: #059669 !important;
                  }
                `}</style>
                <OrganizationProfile 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "w-full shadow-none",
                      navbar: "hidden md:flex",
                      pageScrollBox: "p-8",
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="focus-visible:outline-none">
            <div className="saas-card p-10 bg-white min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="bg-blue-50 p-4 rounded-3xl mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Team Governance</h3>
              <p className="text-sm text-slate-500 font-bold max-w-sm leading-relaxed mb-8">
                Team member management is handled via the Organization Profile.
              </p>
              <Button onClick={() => {}} className="eco-gradient rounded-xl h-11 px-6 font-bold text-white shadow-lg shadow-emerald-900/10">
                Manage Access
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="focus-visible:outline-none">
            <div className="saas-card p-10 bg-white min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="bg-amber-50 p-4 rounded-3xl mb-6">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">System Resources</h3>
              <p className="text-sm text-slate-500 font-bold max-w-sm leading-relaxed mb-8">
                Usage metrics and infrastructure scaling options.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">API Calls</span>
                  <div className="text-xl font-black text-slate-900">42.8k</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Storage</span>
                  <div className="text-xl font-black text-slate-900">1.2 GB</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
