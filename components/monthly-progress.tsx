import { Card, CardContent } from "@/components/ui/card"

export function MonthlyProgress() {
  return (
    <Card className="h-full bg-gray-900/90 backdrop-blur-sm border-gray-800 rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-gray-300 font-medium mb-6">Learning progress this month</h3>

        <div className="flex items-center space-x-4">
          <div className="text-5xl font-bold text-white">
            +65.3<span className="text-3xl">%</span>
          </div>
          <div className="h-2 w-2 bg-white rounded-full"></div>
        </div>

        <div className="mt-12 flex items-end space-x-2 h-16">
          <div className="flex-1 bg-gray-800 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-stripes opacity-30"></div>
          </div>
          <div className="flex-1 light-blue-card h-3/4"></div>
          <div className="text-gray-500 mt-2">Dec</div>
          <div className="text-gray-500 mt-2">Jan</div>
        </div>
      </CardContent>
    </Card>
  )
}
