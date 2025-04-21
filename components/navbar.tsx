"use client"

import { BrainCircuit, Bell, Settings, Home, Book, BarChart2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatPopup } from "@/components/chat-popup"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [chatOpen, setChatOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isHomePage = pathname === "/"

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const toggleChat = (): void => {
    setChatOpen(!chatOpen)
  }

  // Desktop Navbar
  if (!isMobile) {
    return (
      <>
        <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <div className="flex items-center">
                    <img src="/genedu.png" alt="Genedu Logo" className="h-12 w-auto" />
                  </div>
                </Link>
              </div>

              {/* Navigation Links - Desktop */}
              <div className="flex space-x-2 absolute left-1/2 transform -translate-x-1/2">
                <NavButton href="/" active={pathname === "/"}>
                  Dashboard
                </NavButton>
                <NavButton href="/analytics" active={pathname === "/analytics"}>
                  Analytics
                </NavButton>
                <NavButton href="/notebook" active={pathname.startsWith("/notebook")}>
                  Notebook
                </NavButton>
                <NavButton href="/quiz" active={pathname.startsWith("/quiz") && pathname !== "/quiz/create"}>
                  Quiz
                </NavButton>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Settings className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>KM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">User1</span>
                    <span className="text-xs text-gray-500">user1@genedu.site</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Chat Button (only shown when not on home page) */}
        {!isHomePage && (
          <Button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-indigo-950 text-white hover:bg-indigo-900 z-40"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {/* Chat Popup */}
        <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </>
    )
  }

  // Mobile Bottom Navbar
  return (
    <>
      {/* Mobile Top Navbar - Simplified */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <div className="flex items-center">
              <img src="/genedu.png" alt="Genedu Logo" className="h-12 w-auto" />
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>KM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          <MobileNavButton href="/" active={pathname === "/"} icon={<Home className="h-6 w-6" />} label="Home" />
          <MobileNavButton
            href="/notebook"
            active={pathname.startsWith("/notebook")}
            icon={<Book className="h-6 w-6" />}
            label="Notebook"
          />

          {/* Center Chat Button */}
          <div className="-mt-8" onClick={toggleChat}>
            <Button
              className="rounded-full w-16 h-16 shadow-lg bg-indigo-950 text-white hover:bg-indigo-900"
              size="icon"
            >
              <MessageCircle className="h-7 w-7" />
            </Button>
          </div>

          <MobileNavButton
            href="/quiz"
            active={pathname.startsWith("/quiz")}
            icon={<BarChart2 className="h-6 w-6" />}
            label="Quiz"
          />

          <MobileNavButton
            href="/settings"
            active={pathname.startsWith("/settings")}
            icon={<Settings className="h-6 w-6" />}
            label="Settings"
          />
        </div>
      </div>

      {/* Chat Popup */}
      <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Add padding to the bottom of the page to account for the fixed navbar (only on desktop) */}
      {!isMobile && <div className="h-16"></div>}
    </>
  )
}

interface NavButtonProps {
  children: ReactNode;
  active?: boolean;
  href: string;
}

function NavButton({ children, active = false, href }: NavButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href={href}>
        <Button
          variant="ghost"
          className={`rounded-full px-5 py-2 ${
            active
              ? "bg-indigo-950 text-white hover:bg-indigo-800 hover:text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {children}
        </Button>
      </Link>
    </motion.div>
  )
}

interface MobileNavButtonProps {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
}

function MobileNavButton({ href, active, icon, label }: MobileNavButtonProps) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-16">
      <div className={`flex flex-col items-center justify-center ${active ? "text-indigo-600" : "text-gray-500"}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  )
}
