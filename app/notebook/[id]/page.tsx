"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { NotebookEditor } from "@/components/notebook/notebook-editor"
import { useParams } from "next/navigation"
import { sampleNotebooks } from "@/data/sample-notebooks"

interface Notebook {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function NotebookDetailPage() {
  const params = useParams()
  const notebookId = params.id as string
  const [notebook, setNotebook] = useState<Notebook | null>(null)

  useEffect(() => {
    // In a real app, you would fetch the notebook from an API
    const foundNotebook = sampleNotebooks.find((n) => n.id === notebookId) || sampleNotebooks[0]
    setNotebook(foundNotebook as Notebook)
  }, [notebookId])

  if (!notebook) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading notebook...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <NotebookEditor notebook={notebook} />
    </main>
  )
}
