"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Shield } from "lucide-react"

export function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [activityTracking, setActivityTracking] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-visibility" className="text-gray-700">
            Profile Visibility
          </Label>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger id="profile-visibility" className="border-gray-300 bg-white text-gray-900">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
              <SelectItem value="friends">Friends Only - Only connections can view</SelectItem>
              <SelectItem value="private">Private - Only you can view</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="activity-tracking" className="text-base font-medium text-gray-900">
              Activity Tracking
            </Label>
            <p className="text-sm text-gray-600 mt-1">Allow us to track your learning activity for personalization</p>
          </div>
          <Switch
            id="activity-tracking"
            checked={activityTracking}
            onCheckedChange={setActivityTracking}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="data-sharing" className="text-base font-medium text-gray-900">
              Data Sharing
            </Label>
            <p className="text-sm text-gray-600 mt-1">Share your learning data with third-party services</p>
          </div>
          <Switch
            id="data-sharing"
            checked={dataSharing}
            onCheckedChange={setDataSharing}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="two-factor-auth" className="text-base font-medium text-gray-900">
              Two-Factor Authentication
            </Label>
            <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
          </div>
          <Switch
            id="two-factor-auth"
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-indigo-900">Privacy Protection</h4>
              <p className="text-sm text-indigo-700 mt-1">
                We take your privacy seriously. Your data is encrypted and stored securely. You can request a copy or
                deletion of your data at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Privacy Settings
        </Button>
      </div>
    </div>
  )
}
