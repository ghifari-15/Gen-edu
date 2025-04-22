"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AccountSettings } from "@/components/settings/account-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { PrivacySettings } from "@/components/settings/privacy-settings"
import { useIsMobile } from "@/hooks/use-mobile"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("account")
  const isMobile = useIsMobile()

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      <Card className="bg-white border-gray-200 shadow-sm overflow-visible">
        <CardHeader className="pb-0 pt-6">
          <Tabs defaultValue="account" onValueChange={setActiveTab} className="w-full">
            <TabsList className={`mb-4 ${isMobile ? "grid grid-cols-2 gap-2" : ""}`}>
              <TabsTrigger value="account" className={isMobile ? "w-full" : ""}>
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className={isMobile ? "w-full" : ""}>
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className={isMobile ? "w-full" : ""}>
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" className={isMobile ? "w-full" : ""}>
                Privacy
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
        </CardContent>
      </Card>
    </div>
  )
}
