import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"

interface CompetitionSelectionCardProps {
  competitions: string[];
  selectedCompetition: string;
  setSelectedCompetition: (competition: string) => void;
  /** Optional overrides used on the compare page only */
  title?: string;
  description?: string;
}

export function CompetitionSelectionCard({ 
  competitions, 
  selectedCompetition, 
  setSelectedCompetition,
  title,
  description,
}: CompetitionSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? "Competition Selection"}</CardTitle>
        <CardDescription>{description ?? "Select a competition to view analytics."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Combobox
          options={competitions.map(comp => ({ value: comp, label: comp }))}
          value={selectedCompetition}
          onChange={(value) => setSelectedCompetition(value || "")}
          placeholder="Select Competition"
          searchPlaceholder="Search competitions..."
          noResultsText="No competitions found."
          maxSelections={1}
        />
      </CardContent>
    </Card>
  )
}