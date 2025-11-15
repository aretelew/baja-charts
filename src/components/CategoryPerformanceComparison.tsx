
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useMemo } from "react";
import bajaData from "../../baja-data.json";

interface Team {
  token: string;
  competition: string;
  school: string;
  teamKey: string;
}

interface CategoryPerformanceComparisonProps {
  teams: Team[];
}

const EVENT_CATEGORIES = [
  "Acceleration",
  "Suspension",
  "Maneuverability",
  "Hill Climb",
  "Rock Crawl",
  "Endurance",
];

const EVENT_POINTS: { [key: string]: number } = {
  "Acceleration": 75,
  "Suspension": 75,
  "Maneuverability": 75,
  "Hill Climb": 75,
  "Rock Crawl": 75,
  "Sled Pull": 75,
  "Endurance": 400,
};

// Normalize across many historical schema variants
const CATEGORY_ALIASES: Record<string, { overallKeys: string[]; sectionKeys: string[]; scoreKeys: string[] }> = {
  "Acceleration": {
    overallKeys: ["Acceleration (75)"],
    sectionKeys: ["Acceleration", "Accel"],
    scoreKeys: ["Acceleration Score (75)", "Score", "score"],
  },
  "Maneuverability": {
    overallKeys: ["Maneuverability (75)", "Land Manuverability (75)"],
    sectionKeys: ["Maneuverability", "Manv"],
    scoreKeys: ["Maneuverability Score (75)", "Land Manuverability Score (75)", "Score", "score"],
  },
  "Hill Climb": {
    overallKeys: ["Hill Climb (75)"],
    sectionKeys: ["Hill Climb", "Hill"],
    scoreKeys: ["Hill Climb Score (75)", "Score", "score"],
  },
  "Suspension": {
    overallKeys: ["Suspension & Traction (75)"],
    sectionKeys: ["Suspension & Traction", "S&T"],
    scoreKeys: ["Suspension & Traction Score (75)", "Score", "score"],
  },
  "Rock Crawl": {
    overallKeys: ["Rock Crawl (75)"],
    sectionKeys: ["Rock Crawl"],
    scoreKeys: ["Rock Crawl Score (75)", "Score", "score"],
  },
  "Endurance": {
    overallKeys: ["Endurance (400)", "Endurance Race (400)"],
    sectionKeys: ["Endurance"],
    scoreKeys: ["Endurance Race Score (400)", "Points (400)", "Points", "Score", "score"],
  },
};

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return null;
}

function readOverallPoints(teamData: any, category: string): number | null {
  const overall = teamData?.Overall;
  if (!overall) return null;
  const aliases = CATEGORY_ALIASES[category]?.overallKeys ?? [];
  for (const key of aliases) {
    const val = coerceNumber(overall[key as keyof typeof overall]);
    if (val != null) return val;
  }
  return null;
}

function readSectionPoints(teamData: any, category: string): number | null {
  const aliasCfg = CATEGORY_ALIASES[category];
  if (!aliasCfg) return null;
  for (const sectionKey of aliasCfg.sectionKeys) {
    const section = teamData?.[sectionKey];
    if (!section) continue;
    for (const scoreKey of aliasCfg.scoreKeys) {
      const val = coerceNumber(section[scoreKey as keyof typeof section]);
      if (val != null) return val;
    }
    // Generic fallback: find first numeric key that includes "Score"
    const candidate = Object.entries(section).find(([k, v]) => /score/i.test(k) && typeof v === "number");
    if (candidate && typeof candidate[1] === "number") return candidate[1] as number;
  }
  return null;
}

function getScore(teamData: any, category: string): number {
  if (!teamData) return 0;

  const maxPoints = EVENT_POINTS[category];
  if (!maxPoints) return 0;

  // Prefer explicit event sections, then fall back to Overall aggregates
  const sectionPoints = readSectionPoints(teamData, category);
  const points = sectionPoints ?? readOverallPoints(teamData, category) ?? 0;
  return (points / maxPoints) * 100;
}

function resolveCompetitionData(competitionKey: string): any | null {
  const dataAny = bajaData as any;
  // Exact
  if (dataAny[competitionKey]) return dataAny[competitionKey];
  // Trimmed
  const trimmed = competitionKey.trim();
  if (dataAny[trimmed]) return dataAny[trimmed];
  // Case-insensitive + trimmed match across keys
  const target = trimmed.toLowerCase();
  const matchKey = Object.keys(dataAny).find(k => k.trim().toLowerCase() === target);
  return matchKey ? dataAny[matchKey] : null;
}

function findTeamDataInCompetition(competitionData: any, teamKey: string): any | null {
  const trimmedTeamKey = (teamKey ?? "").trim();
  const values: any[] = Object.values(competitionData ?? {});
  let found = values.find((t: any) => t?.Overall?.team_key === teamKey);
  if (found) return found;
  found = values.find((t: any) => (t?.Overall?.team_key ?? "").trim() === trimmedTeamKey);
  return found ?? null;
}

export function CategoryPerformanceComparison({ teams = [] }: CategoryPerformanceComparisonProps) {
  const chartData = useMemo(() => {
    if (teams.length === 0) {
      return EVENT_CATEGORIES.map(category => ({ category }));
    }

    return EVENT_CATEGORIES.map(category => {
      const entry: { [key: string]: string | number } = { category };
      teams.forEach(team => {
        // Resolve competition with potential trailing spaces or minor variants
        const competitionData = resolveCompetitionData(team.competition);
        if (competitionData) {
          const teamData = findTeamDataInCompetition(competitionData, team.teamKey);
          const rawScore = getScore(teamData, category);
          const cappedScore = Math.min(rawScore, 100);
          const overflowAmount = Math.max(0, rawScore - 100);
          entry[team.token] = cappedScore;
          entry[`${team.token}__overflow`] = overflowAmount;
        } else {
          entry[team.token] = 0;
          entry[`${team.token}__overflow`] = 0;
        }
      });
      return entry;
    });
  }, [teams]);

  const chartConfig = useMemo(() => {
    const config: { [key: string]: { label: string, color: string } } = {};
    teams.forEach(team => {
      const competitionLabel = team.competition.trim();
      config[team.token] = {
        label: `${extractTeamName(team.teamKey)} - ${team.school} - ${competitionLabel}`,
        color: `hsl(${stringToColor(team.token)})`,
      };
    });
    return config;
  }, [teams]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={chartData} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <ChartLegend content={((props: any) => <ChartLegendContent {...props} />) as any} />
        {teams.map((team) => (
          <Bar key={team.token} dataKey={team.token} fill={chartConfig[team.token]?.color} radius={4}>
            <LabelList content={(props: any) => (
              <OverflowMarker
                {...props}
                teamToken={team.token}
                color={chartConfig[team.token]?.color}
              />
            )} />
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function OverflowMarker(props: any & { teamToken: string; color: string }) {
  const { x, y, width, payload, teamToken, color } = props;
  const overflowAmount = (payload?.[`${teamToken}__overflow`] ?? 0) as number;
  if (!overflowAmount || x == null || y == null || width == null) return null;

  const centerX = x + width / 2;
  const markerHeight = 8;
  const markerWidth = 10;
  const offset = 4; // small gap above the bar top

  const pathD = `M ${centerX} ${y - offset} l ${markerWidth / 2} ${markerHeight} l -${markerWidth} 0 z`;

  return (
    <g pointerEvents="none">
      <path d={pathD} fill={color} />
    </g>
  );
}

function stringToColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `${hue}, 70%, 50%`;
}

function extractTeamName(teamKey: string): string {
  // team_key is typically "School - Team Name" or "School - Campus - Team Name".
  // We treat the last segment as the team name.
  const parts = teamKey.split(" - ").map((p) => p.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join(" - ") : parts[0] || teamKey;
}
