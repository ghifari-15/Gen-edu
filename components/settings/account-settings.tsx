"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Save } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function AccountSettings() {
  const [name, setName] = useState("User1")
  const [email, setEmail] = useState("user1@genedu.site")
  const [username, setUsername] = useState("user1")
  const [bio, setBio] = useState("AI education enthusiast and lifelong learner")
  const isMobile = useIsMobile()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
          <Avatar className="h-24 w-24 border-2 border-gray-200">
            <AvatarImage src="/placeholder.svg?height=96&width=96" />
            <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">KM</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
            <Upload className="h-4 w-4" />
            Change Avatar
          </Button>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                Phone (optional)
              </Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="border-gray-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-700">
              Bio
            </Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
