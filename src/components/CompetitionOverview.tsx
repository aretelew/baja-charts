import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import bajaData from '../../baja-data.json';

import { Cell } from 'recharts';

interface TeamData {
  'Canonical_Team': string;
  'Overall (1000)': number;
  'team_key': string;
  'school': string;
}

interface RawTeam {
  Overall: {
    School: string;
    team_key: string;
    'Overall (1000)': number;
  };
}

type CompetitionTeams = Record<string, RawTeam>;

const chartConfig = {
  Overall: {
    label: 'Overall Score',
    color: 'var(--chart-1)',
  },
};

interface CustomBarLabelProps {
  x?: number;
  y?: number;
  height?: number;
  data: TeamData[];
  index?: number;
}

const CustomBarLabel = ({
  x = 0,
  y = 0,
  height = 0,
  data,
  index = 0,
}: CustomBarLabelProps) => {
  const entry = data[index];
  if (!entry) {
    return null;
  }

  return (
    <text
      x={x + 10}
      y={y + height / 2}
      fill="#fff"
      textAnchor="start"
      dominantBaseline="middle"
    >
      {entry.Canonical_Team}
    </text>
  );
};

export function CompetitionOverview({ selectedCompetition, selectedSchool }: { selectedCompetition: string, selectedSchool: string }) {
  const [chartData, setChartData] = useState<TeamData[]>([]);

  useEffect(() => {
    if (selectedCompetition) {
      const competitionData =
        bajaData[selectedCompetition as keyof typeof bajaData] as CompetitionTeams | undefined;
      const teamEntries = competitionData ? Object.values(competitionData) : [];
      const top10 = teamEntries
        .filter((team) => team?.Overall)
        .map((team) => {
          const school = team.Overall.School;
          const team_key = team.Overall.team_key;
          const teamName = team_key.replace(school + ' - ', '');
          return {
            Canonical_Team: teamName,
            'Overall (1000)': team.Overall['Overall (1000)'],
            team_key,
            school,
          };
        })
        .sort((a, b) => b['Overall (1000)'] - a['Overall (1000)'])
        .slice(0, 10);
      setChartData(top10);
    }
  }, [selectedCompetition]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Top 10 Teams</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[400px]">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="Canonical_Team"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={0}
            />
            <XAxis dataKey="Overall (1000)" type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                indicator="line"
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    return (
                      <div className="flex flex-col gap-1 p-1">
                        <span className="font-bold">{value}</span>
                        <span className="text-muted-foreground">{payload[0].payload.school}</span>
                      </div>
                    )
                  }
                  return value;
                }}
              />}
            />
            <Bar dataKey="Overall (1000)" radius={4} label={<CustomBarLabel data={chartData} />}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={'var(--chart-1)'} stroke={entry.school === selectedSchool ? 'var(--selected-border-color)' : 'transparent'} strokeWidth={2} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}