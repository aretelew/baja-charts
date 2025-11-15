import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import bajaData from '../../baja-data.json';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamStats {
  schoolName: string;
  teamName: string;
  averageScore: number;
  bestScore: number;
  competitionCount: number;
  totalPoints: number;
}

interface TeamData {
  Overall?: {
    School?: string;
    team_key?: string;
    'Overall (1000)'?: number;
  };
}

export function MostConsistentPrograms() {
  const [sortColumn, setSortColumn] = useState<keyof TeamStats>('totalPoints');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortedTeamStats = useMemo(() => {
    const jsonData = bajaData;
    const stats: { [key: string]: { scores: number[]; count: number; best: number; recentTeamName: string; recentCompetitionYear: number; } } = {};

    const competitionKeys = Object.keys(jsonData).sort();

    for (const competition of competitionKeys) {
      const competitionYearMatch = competition.match(/\d{4}/);
      const competitionYear = competitionYearMatch ? parseInt(competitionYearMatch[0]) : 0;

      const competitionData = jsonData[competition as keyof typeof jsonData];
      for (const team of Object.values(competitionData) as TeamData[]) {
        if (team && team.Overall && team.Overall.School && team.Overall.team_key) {
          const schoolName = team.Overall.School;
          const teamName = team.Overall.team_key;
          const score = team.Overall['Overall (1000)'];

          if (typeof score === 'number') {
            if (!stats[schoolName]) {
              stats[schoolName] = { scores: [], count: 0, best: 0, recentTeamName: '', recentCompetitionYear: 0 };
            }

            stats[schoolName].scores.push(score);
            stats[schoolName].count++;
            if (score > stats[schoolName].best) {
              stats[schoolName].best = score;
            }

            if (competitionYear >= stats[schoolName].recentCompetitionYear) {
              stats[schoolName].recentCompetitionYear = competitionYear;
              stats[schoolName].recentTeamName = teamName;
            }
          }
        }
      }
    }

    const calculatedStats: TeamStats[] = Object.keys(stats).map(schoolName => {
      const schoolData = stats[schoolName];
      const totalPoints = schoolData.scores.reduce((a, b) => a + b, 0);
      const averageScore = totalPoints / schoolData.count;
      return {
        schoolName: schoolName,
        teamName: schoolData.recentTeamName,
        averageScore: parseFloat(averageScore.toFixed(2)),
        bestScore: schoolData.best,
        competitionCount: schoolData.count,
        totalPoints: parseFloat(totalPoints.toFixed(2)),
      };
    });

    const sorted = calculatedStats
      .filter(team => team.competitionCount >= 3)
      .sort((a, b) => {
        if (sortDirection === 'asc') {
          return a[sortColumn] > b[sortColumn] ? 1 : -1;
        }
        return b[sortColumn] > a[sortColumn] ? 1 : -1;
      });

    return sorted.slice(0, 20);
  }, [sortColumn, sortDirection]);

  const handleSort = (column: keyof TeamStats) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center">
        <CardTitle>Most Consistent Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table style={{tableLayout: 'fixed'}}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left font-bold" style={{width: '40%'}}><span className="cursor-pointer" onClick={() => handleSort('teamName')}>Team <span style={{color: sortColumn === 'teamName' ? 'white' : 'transparent'}}>{sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />}</span></span></TableHead>
              <TableHead className="text-left font-bold" style={{width: '15%'}}><span className="cursor-pointer" onClick={() => handleSort('averageScore')}>Average Score <span style={{color: sortColumn === 'averageScore' ? 'white' : 'transparent'}}>{sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />}</span></span></TableHead>
              <TableHead className="text-left font-bold" style={{width: '15%'}}><span className="cursor-pointer" onClick={() => handleSort('bestScore')}>Best Score <span style={{color: sortColumn === 'bestScore' ? 'white' : 'transparent'}}>{sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />}</span></span></TableHead>
              <TableHead className="text-left font-bold" style={{width: '15%'}}><span className="cursor-pointer" onClick={() => handleSort('totalPoints')}>Total Points <span style={{color: sortColumn === 'totalPoints' ? 'white' : 'transparent'}}>{sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />}</span></span></TableHead>
              <TableHead className="text-left font-bold" style={{width: '15%'}}><span className="cursor-pointer" onClick={() => handleSort('competitionCount')}>Competitions <span style={{color: sortColumn === 'competitionCount' ? 'white' : 'transparent'}}>{sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />}</span></span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeamStats.map(team => (
              <TableRow key={team.schoolName}>
                <TableCell className="text-left">{team.teamName}</TableCell>
                <TableCell className="text-left">{team.averageScore}</TableCell>
                <TableCell className="text-left">{team.bestScore}</TableCell>
                <TableCell className="text-left">{team.totalPoints}</TableCell>
                <TableCell className="text-left">{team.competitionCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}