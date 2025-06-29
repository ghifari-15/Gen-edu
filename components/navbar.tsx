"use client"

import { BrainCircuit, Bell, Settings, Home, Book, BarChart2, MessageCircle, LogOut, User, ChevronDown, ChartArea } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth/AuthContext"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isHomePage = pathname === "/"
  const { user, logout, isLoading } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
                <NavButton href="/chat" active={pathname === "/chat"}>
                  Chat
                </NavButton>
                <NavButton href="/notebook" active={pathname.startsWith("/notebook") && pathname !== "/notebook/create"}>
                  Notebook
                </NavButton>
                <NavButton href="/quiz" active={pathname.startsWith("/quiz") && pathname !== "/quiz/create"}>
                  Quiz
                </NavButton>
                
              </div>              {/* User Section */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Bell className="h-5 w-5" />
                </Button>
                
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex flex-col space-y-1">
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="w-20 h-2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-indigo-600 text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {user.role} • {user.subscription?.plan || 'free'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Mobile Bottom Navbar
  return (
    <>      {/* Mobile Top Navbar - Simplified */}
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-indigo-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
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
          <MobileNavButton
            href="/chat"
            active={pathname === "/chat"}
            icon={<MessageCircle className="h-7 w-7" />}
            label="Chat"
          />

          <MobileNavButton
            href="/quiz"
            active={pathname.startsWith("/quiz")}
            icon={<BarChart2 className="h-6 w-6" />}
            label="Quiz"
          />

          <MobileNavButton
            href="/analytics"
            active={pathname.startsWith("/analytics")}
            icon={<ChartArea className="h-6 w-6" />}
            label="Analytics"
          />
        </div>
      </div>

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
