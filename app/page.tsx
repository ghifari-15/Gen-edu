import { Navbar } from "@/components/navbar"
import { DashboardContent } from "@/components/dashboard-content"

export default function Home() {
  // This is a server component, so we can't use useEffect here
  // The scroll reset will be handled in the client components

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <DashboardContent />
    </main>
  )
}
