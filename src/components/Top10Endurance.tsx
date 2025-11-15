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
  'Endurance (400)': number;
  'team_key': string;
  'school': string;
}

interface RawTeam {
  Overall: {
    School: string;
    team_key: string;
  };
  Endurance: {
    'Points (400)': number;
  };
}

const chartConfig = {
  Endurance: {
    label: 'Endurance Score',
    color: 'var(--chart-1)',
  },
};

const CustomBarLabel = (props: { x: number; y: number; height: number; data: TeamData[], index: number }) => {
  const { x, y, height, data, index } = props;
  const entry = data[index];
  return <text x={x + 10} y={y + height / 2} fill="#fff" textAnchor="start" dominantBaseline="middle">{entry.Canonical_Team}</text>;
};

export function Top10Endurance({ selectedCompetition, selectedSchool }: { selectedCompetition: string, selectedSchool: string }) {
  const [chartData, setChartData] = useState<TeamData[]>([]);

  useEffect(() => {
    if (selectedCompetition) {
      const competitionData =
        bajaData[selectedCompetition as keyof typeof bajaData];
      const top10 = Object.values(competitionData ?? {})
        .filter((team: RawTeam) => team && team.Endurance)
        .map((team: RawTeam) => {
          const school = team.Overall.School;
          const team_key = team.Overall.team_key;
          const teamName = team_key.replace(school + ' - ', '');
          return {
            'Canonical_Team': teamName,
            'Endurance (400)': team.Endurance['Points (400)'],
            'team_key': team_key,
            'school': school,
          }
        })
        .sort((a, b) => b['Endurance (400)'] - a['Endurance (400)'])
        .slice(0, 10);
      setChartData(top10 as TeamData[]);
    }
  }, [selectedCompetition]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Top 10 Endurance</CardTitle>
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
            <XAxis dataKey="Endurance (400)" type="number" domain={[0, 400]} />
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
            <Bar dataKey="Endurance (400)" radius={4} label={<CustomBarLabel data={chartData} />}>
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