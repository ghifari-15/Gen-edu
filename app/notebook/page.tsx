"use client"
import { Navbar } from "@/components/navbar"
import { NotebookList } from "@/components/notebook/notebook-list"

export default function NotebookPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <NotebookList />
      </div>
    </main>
  )
}
