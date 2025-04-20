"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, LayoutGrid, List, Book, Code, Binary, Brain, File, Lock } from "lucide-react"
import Link from "next/link"
import { sampleNotebooks } from "@/data/sample-notebooks"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function NotebookList() {
  const [notebooks, setNotebooks] = useState(sampleNotebooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState("Most recent")
  const isMobile = useIsMobile()

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "book":
        return <Book className="h-5 w-5 text-indigo-600" />
      case "code":
        return <Code className="h-5 w-5 text-lime-400" />
      case "binary":
        return <Binary className="h-5 w-5 text-indigo-600" />
      case "brain":
        return <Brain className="h-5 w-5 text-lime-400" />
      case "lock":
        return <Lock className="h-5 w-5 text-indigo-600" />
      default:
        return <File className="h-5 w-5 text-gray-400" />
    }
  }

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const createNewNotebook = () => {
    const newNotebook = {
      id: `${notebooks.length + 1}`,
      title: "Untitled notebook",
      lastEdited: "Just now",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: "",
      sources: 0,
      icon: "file",
    }
    setNotebooks([newNotebook, ...notebooks])
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
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl px-6 py-2 h-auto flex items-center w-full md:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create new
          </Button>
        </motion.div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className={viewMode === "grid" ? "bg-indigo-950 text-white rounded-none" : "text-gray-500 rounded-none"}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className={viewMode === "list" ? "bg-indigo-950 text-white rounded-none" : "text-gray-500 rounded-none"}
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-200 rounded-lg flex-1 md:flex-none justify-between"
              >
                {sortOption} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("Most recent")}>Most recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Oldest")}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Alphabetical")}>Alphabetical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotebooks.map((notebook, index) => (
            <motion.div
              key={notebook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/notebook/${notebook.id}`}>
                <Card className="h-full bg-white border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-5">
                    <div className="mb-4 bg-gray-100 rounded-lg p-2 inline-block">
                      {getIconComponent(notebook.icon)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{notebook.title}</h3>
                    <div className="text-sm text-gray-500">
                      {notebook.date} · {notebook.sources} sources
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotebooks.map((notebook, index) => (
            <motion.div
              key={notebook.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/notebook/${notebook.id}`}>
                <Card className="bg-white border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4 flex items-center">
                    <div className="mr-4 bg-gray-100 rounded-lg p-2">{getIconComponent(notebook.icon)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{notebook.title}</h3>
                      <div className="text-sm text-gray-500">
                        {notebook.date} · {notebook.sources} sources
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 hidden sm:block">{notebook.lastEdited}</div>
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
