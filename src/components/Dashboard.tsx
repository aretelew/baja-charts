import { useState, useEffect } from "react"
import { MostConsistentPrograms } from "./MostConsistentPrograms"
import { CompetitionOverview } from "./CompetitionOverview"
import { TeamPerformance } from "./TeamPerformance"

import { ComparisonView } from "./ComparisonView"
import { Header } from "./Header"
import { TeamSelectionCard } from "./TeamSelectionCard"
import { CompetitionSelectionCard } from "./CompetitionSelectionCard"
import { Top10Endurance } from "./Top10Endurance"
import bajaData from "../../baja-data.json";

interface TeamData {
  Overall: {
    School: string;
    team_key: string;
  };
}

export function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<Record<string, Record<string, TeamData>>>({});
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [schools, setSchools] = useState<{ value: string; label: string }[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  useEffect(() => {
    setData(bajaData as Record<string, Record<string, TeamData>>);
    const allTeams: TeamData[] = Object.values(bajaData).flatMap(comp => Object.values(comp)) as TeamData[];
    const uniqueSchools = [...new Set(allTeams.map((team) => team.Overall.School))];
    
    const schoolList = uniqueSchools.map(schoolName => {
      const teamForSchool = allTeams.find(team => team.Overall.School === schoolName);
      return {
        value: schoolName,
        label: teamForSchool ? teamForSchool.Overall.team_key : schoolName,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));

    setSchools(schoolList);
    if (schoolList.length > 0) {
      const initialSchool = "Case Western Reserve University";
      setSelectedSchool(initialSchool);

      const competitionsForSchool = Object.keys(bajaData).filter(comp =>
        (Object.values(bajaData[comp as keyof typeof bajaData]) as TeamData[]).some(team => team.Overall.School === initialSchool)
      );
      setCompetitions(competitionsForSchool);
      if (competitionsForSchool.length > 0) {
        setSelectedCompetition(competitionsForSchool[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSchool && data) {
      const competitionsForSchool = Object.keys(data).filter(comp =>
        (Object.values(data[comp as keyof typeof data]) as TeamData[]).some(team => team.Overall.School === selectedSchool)
      );
      setCompetitions(competitionsForSchool);

      if (!competitionsForSchool.includes(selectedCompetition)) {
        setSelectedCompetition(competitionsForSchool[0]);
      }
    }
  }, [selectedSchool, data, selectedCompetition]);

  return (
    <div className="min-h-screen bg-background">
      <Header activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {activeView !== "compare" && (
          <div className="grid grid-cols-2 gap-4">
            <TeamSelectionCard 
              schools={schools}
              selectedSchool={selectedSchool}
              setSelectedSchool={setSelectedSchool}
            />
            <CompetitionSelectionCard 
              competitions={competitions}
              selectedCompetition={selectedCompetition}
              setSelectedCompetition={setSelectedCompetition}
            />
          </div>
        )}



        {activeView === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <CompetitionOverview selectedCompetition={selectedCompetition} selectedSchool={selectedSchool} />
              <Top10Endurance selectedCompetition={selectedCompetition} selectedSchool={selectedSchool} />
            </div>
            <MostConsistentPrograms />
          </div>
        )}

        {activeView === "teams" && (
          <div className="space-y-6">
            <TeamPerformance selectedSchool={selectedSchool} selectedCompetition={selectedCompetition} />
          </div>
        )}

        {activeView === "trends" && (
          <div className="space-y-6">
            {/* Add TrendAnalysis content here if needed */}
          </div>
        )}

        {activeView === "compare" && (
          <ComparisonView
            schools={schools}
            selectedCompetition={selectedCompetition}
            selectedSchool={selectedSchool}
          />
        )}
      </main>
    </div>
  )
}