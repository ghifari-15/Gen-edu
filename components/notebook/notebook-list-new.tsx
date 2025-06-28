use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, LayoutGrid, List, Book, Code, Binary, Brain, File, Loader2, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth/AuthContext"

interface Notebook {
  notebookId: string;
  title: string;
  description?: string;
  metadata: {
    tags: string[];
    difficulty: string;
    subjects: string[];
  };
  stats: {
    views: number;
  };
  createdAt: string;
  updatedAt: string;
  lastSaved: string;
}

export function NotebookList() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState("Most recent")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()

  // Fetch notebooks on component mount
  useEffect(() => {
    fetchNotebooks()
  }, [])

  const fetchNotebooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notebooks')
      const data = await response.json()
      
      if (data.success) {
        setNotebooks(data.notebooks)
      } else {
        console.error('Failed to fetch notebooks:', data.message)
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconComponent = (difficulty: string, subjects: string[]) => {
    if (subjects.includes('Computer Science') || subjects.includes('Programming')) {
      return <Code className="h-5 w-5 text-lime-400" />
    }
    if (subjects.includes('Data Science') || subjects.includes('Machine Learning')) {
      return <Binary className="h-5 w-5 text-indigo-600" />
    }
    if (subjects.includes('AI') || subjects.includes('Artificial Intelligence')) {
      return <Brain className="h-5 w-5 text-lime-400" />
    }
    return <Book className="h-5 w-5 text-indigo-600" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    switch (sortOption) {
      case "Most recent":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case "Oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "Title A-Z":
        return a.title.localeCompare(b.title)
      case "Title Z-A":
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  const createNewNotebook = async () => {
    try {
      setIsCreating(true)
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: "Untitled Notebook",
          description: "A new notebook ready for your ideas",
          metadata: {
            tags: [],
            difficulty: 'beginner',
            subjects: []
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh notebooks list
        await fetchNotebooks()
      } else {
        console.error('Failed to create notebook:', data.message)
      }
    } catch (error) {
      console.error('Error creating notebook:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">Notebook</span>
        </h1>
        <p className="text-gray-600">Your AI-powered notebook for learning and research</p>
      </motion.div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="pl-10 bg-white border-gray-200 rounded-xl h-12"
          placeholder="Search notebooks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={createNewNotebook}
            disabled={isCreating}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl px-6 py-2 h-auto flex items-center w-full md:w-auto"
          >
            {isCreating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            Create new
          </Button>
        </motion.div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none border-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 rounded-lg">
                {sortOption}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {["Most recent", "Oldest", "Title A-Z", "Title Z-A"].map((option) => (
                <DropdownMenuItem key={option} onClick={() => setSortOption(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {sortedNotebooks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "No notebooks found" : "No notebooks yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Create your first notebook to get started"
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={createNewNotebook}
              disabled={isCreating}
              className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              Create your first notebook
            </Button>
          )}
        </motion.div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {sortedNotebooks.map((notebook, index) => (
            <motion.div
              key={notebook.notebookId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/notebook/${notebook.notebookId}`}>
                <Card className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getIconComponent(notebook.metadata.difficulty, notebook.metadata.subjects)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {notebook.title}
                        </h3>
                        {notebook.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notebook.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(notebook.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{notebook.stats.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notebook.metadata.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {notebook.metadata.tags.length > 2 && (
                        <span className="text-gray-400 text-xs">
                          +{notebook.metadata.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
