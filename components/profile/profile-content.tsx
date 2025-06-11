"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { ProfileActivity } from "@/components/profile/profile-activity"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth/AuthContext"
import { Settings, Edit } from "lucide-react"
import Link from "next/link"

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useIsMobile()
  const { user } = useAuth()

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Card className="bg-white border-gray-200 overflow-hidden">
          <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-600 to-indigo-800"></div>
          <CardContent className="p-6 relative">            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=128&width=128"} />
                <AvatarFallback className="text-3xl">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user?.name || 'User'}
                </h1>
                <p className="text-gray-600">
                  {user?.profile?.bio || 'Welcome to GenEdu! Complete your profile to personalize your experience.'}
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Link href="/settings">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
            <TabsList
              className={`p-0 bg-transparent border-b border-gray-200 rounded-none w-full ${isMobile ? "grid grid-cols-3" : "flex"}`}
            >
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 py-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 py-4"
              >
                Activity
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              {activeTab === "overview" && <ProfileOverview />}
              {activeTab === "activity" && <ProfileActivity />}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
