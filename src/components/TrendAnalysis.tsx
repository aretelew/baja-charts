import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface RawTeam {
  Overall: {
    team_key: string;
    "Overall (1000)": number;
  };
}

interface ChartDataRow {
  competition: string;
  [teamName: string]: string | number | null;
}

interface ChartConfig {
  [teamName: string]: {
    label: string;
    color: string;
  };
}

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function TrendAnalysis() {
  const [chartData, setChartData] = useState<ChartDataRow[]>([]);
  const [topTeams, setTopTeams] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    fetch('/baja-data.json')
      .then(response => response.json())
      .then(jsonData => {
                const stats: { [key: string]: { scores: number[]; count: number } } = {};

        for (const competition in jsonData) {
          for (const team of Object.values(jsonData[competition as keyof typeof jsonData])) {
            if ((team as RawTeam) && (team as RawTeam).Overall && (team as RawTeam).Overall.team_key) {
              const teamName = (team as RawTeam).Overall.team_key;
              const score = (team as RawTeam).Overall['Overall (1000)'];

              if (typeof score === 'number') {
                if (!stats[teamName]) {
                  stats[teamName] = { scores: [], count: 0 };
                }
                stats[teamName].scores.push(score);
                stats[teamName].count++;
              }
            }
          }
        }

        const calculatedStats = Object.keys(stats).map(teamName => {
          const teamData = stats[teamName];
          const averageScore = teamData.scores.reduce((a, b) => a + b, 0) / teamData.count;
          return { teamName, averageScore };
        });

        const top10Teams = calculatedStats
          .sort((a, b) => b.averageScore - a.averageScore)
          .slice(0, 10)
          .map(t => t.teamName);

        setTopTeams(top10Teams);

        const competitionNames = Object.keys(jsonData).sort((a, b) => {
          const yearA = parseInt(a.slice(-4));
          const yearB = parseInt(b.slice(-4));
          return yearA - yearB;
        });

        const newChartData = competitionNames.map(competition => {
          const competitionData: ChartDataRow = { competition };
          for (const teamName of top10Teams) {
            const teamData = Object.values(jsonData[competition as keyof typeof jsonData]).find((t) => (t as RawTeam).Overall && (t as RawTeam).Overall.team_key === teamName);
            competitionData[teamName] = teamData ? (teamData as RawTeam).Overall['Overall (1000)'] : null;
          }
          return competitionData;
        });

        setChartData(newChartData);

        const newChartConfig: ChartConfig = {};
        top10Teams.forEach((teamName, index) => {
          newChartConfig[teamName] = {
            label: teamName,
            color: chartColors[index],
          };
        });
        setChartConfig(newChartConfig);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-year Score Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[400px]">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="competition"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(-4)}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={(props: any) => <ChartTooltipContent {...props} />} />
            <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} />
            {topTeams.map((teamName, index) => (
              <Line
                key={teamName}
                dataKey={teamName}
                stroke={chartColors[index]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}