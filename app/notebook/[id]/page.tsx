"use client"

import { Navbar } from "@/components/navbar"
import { NotebookEditor } from "@/components/notebook/notebook-editor"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useParams } from "next/navigation"

export default function NotebookDetailPage() {
  const params = useParams()
  const notebookId = params.id as string

  return (
    <ProtectedRoute>
      <main className="h-screen flex flex-col bg-gray-100 overflow-hidden">
        <Navbar />
        <NotebookEditor notebookId={notebookId} />
      </main>
    </ProtectedRoute>
  )
}
