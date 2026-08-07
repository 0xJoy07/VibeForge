"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AXES, overallScore, type Grade, type Scores } from "@/lib/analysis";

const gradeClasses: Record<Grade, string> = {
  A: "text-green-300 border-green-400/40 bg-green-400/10",
  B: "text-green-300 border-green-400/40 bg-green-400/10",
  C: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  D: "text-lime-300 border-lime-400/40 bg-lime-400/10",
  F: "text-red-300 border-red-400/40 bg-red-400/10",
};

export default function ScoreRingEditor({ scores, grade }: { scores: Scores; grade: Grade }) {
  const score = overallScore(scores);
  const data = AXES.map((axis, index) => ({
    name: axis.label,
    value: scores[axis.key],
    fill: axis.color,
    innerRadius: 28 + index * 9,
    outerRadius: 35 + index * 9,
  }));

  return (
    <div className="flex h-[180px] w-full flex-row items-center gap-6 rounded-xl border border-white/10 bg-[#0b1a11] p-4">
      {/* Left side: Radial Chart */}
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={6}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#183522" }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black text-white leading-none">{score}</div>
          <div className={`mt-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${gradeClasses[grade]}`}>
            Grade {grade}
          </div>
        </div>
      </div>

      {/* Right side: Axis Breakdown */}
      <div className="flex w-full flex-col justify-center space-y-2.5">
        {AXES.map((axis) => (
          <div key={axis.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: axis.color }} />
                <span className="font-medium text-white">{axis.label}</span>
              </div>
              <span className="text-zinc-400">{scores[axis.key]}/100</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${scores[axis.key]}%`, backgroundColor: axis.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
