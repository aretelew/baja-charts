import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"

interface TeamSelectionCardProps {
  schools: { value: string; label: string }[];
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
  /** Optional compare page UI: small team badge/icon at left */
  showSelectedBadge?: boolean;
}

export function TeamSelectionCard({ 
  schools, 
  selectedSchool, 
  setSelectedSchool,
  showSelectedBadge = false,
}: TeamSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Selection</CardTitle>
        <CardDescription>Select a team to view analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {showSelectedBadge && selectedSchool && (
            <span
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: stringToColor(selectedSchool) }}
            />
          )}
          <Combobox
            options={schools}
            value={selectedSchool}
            onChange={(value) => setSelectedSchool(typeof value === 'string' ? value : value?.[0] || "")}
            placeholder="Select School"
            searchPlaceholder="Search schools..."
            noResultsText="No schools found."
            className="w-full"
            maxSelections={1}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Simple deterministic color generator based on school string
function stringToColor(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 70% 50%)`
}