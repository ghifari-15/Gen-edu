import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CountryStats() {
  const countries = [
    { name: "United States", value: "38.1k" },
    { name: "India", value: "6.4k" },
    { name: "Canada", value: "4.2k" },
  ]

  return (
    <Card className="h-full bg-gray-900/90 backdrop-blur-sm border-gray-800 rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-gray-300 font-medium mb-6">Student locations</h3>

        <div className="space-y-6">
          {countries.map((country) => (
            <div key={country.name} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="h-0.5 w-8 bg-gray-700"></div>
                <span className="text-gray-300">{country.name}</span>
              </div>
              <span className="text-gray-300">{country.value}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="text-gray-500">+19 more</div>
        <Button variant="outline" className="text-gray-400 border-gray-700 text-sm rounded-lg">
          View all countries
        </Button>
      </CardFooter>
    </Card>
  )
}
