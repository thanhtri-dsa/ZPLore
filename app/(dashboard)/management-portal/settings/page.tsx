'use client';

import React, { useState, useEffect } from 'react';
import {
  OrganizationProfile,
  OrganizationList,
  useOrganization,
  CreateOrganization
} from '@clerk/nextjs';

import { Users, Building } from "lucide-react";
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
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Trang này cần bật đăng nhập Clerk.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Bật Clerk bằng cách set <span className="font-mono">FORCE_CLERK_AUTH=true</span> và cấu hình key hợp lệ.
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Loading"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl">Create an Organization</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              You need to create an organization to access settings and team features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="clerk-create-org w-full">
              <style jsx global>{`
                .clerk-create-org .cl-form-root {
                  width: 100%;
                }
              `}</style>
              <CreateOrganization
                afterCreateOrganizationUrl="/management-portal/settings"
                routing="hash"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your organization settings and team members
          </p>
        </div>
        
        <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
          <DialogContent className="sm:max-w-[425px] mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Create New Organization</DialogTitle>
              <DialogDescription className="text-sm">
                Set up a new organization to collaborate with your team.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="clerk-create-org">
                <style jsx global>{`
                  .clerk-create-org .cl-form-root {
                    width: 100%;
                  }
                `}</style>
                <CreateOrganization 
                  afterCreateOrganizationUrl="/management-portal/settings"
                  routing="hash"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 sm:mb-8 w-full sm:w-auto flex overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none">
            <Building className="h-4 w-4 hidden sm:inline" />
            <span className="whitespace-nowrap">Organization Profile</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none">
            <Users className="h-4 w-4 hidden sm:inline" />
            <span className="whitespace-nowrap">Members</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl">Organization Profile</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your organization&apos;s profile and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-3xl mx-auto">
                <OrganizationProfile 
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-4xl mx-auto",
                      card: "shadow-none p-4 sm:p-6",
                      navbar: "",
                      pageScrollBox: "px-2 sm:px-4 py-2",
                      formFieldInput: "w-full",
                      formButtonPrimary: "w-full sm:w-auto",
                      formFieldGroup: "space-y-4",
                      organizationSwitcherTrigger: "w-full",
                      organizationPreview: "w-full",
                      organizationSwitcherPopoverCard: "w-full max-w-[380px]",
                      avatarBox: "w-16 h-16 sm:w-20 sm:h-20",
                      badge: "bg-primary/10 text-primary text-sm",
                      dividerLine: "my-4 border-border",
                      headerTitle: "text-lg sm:text-xl font-semibold",
                      headerSubtitle: "text-sm text-muted-foreground"
                    },
                  }}
                  routing="hash"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="border rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl">Organization Members</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                View and manage your organization&apos;s members
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <OrganizationList
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "border-0 shadow-none p-0",
                    navbar: "hidden",
                    pageScrollBox: "px-4 sm:px-6",
                    table: "min-w-full",
                    tableHead: "hidden sm:table-header-group",
                    tableBody: "divide-y divide-gray-200",
                    tableRow: "flex flex-col sm:table-row",
                    tableCell: "px-2 py-3 sm:px-4 sm:py-4 text-sm",
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
