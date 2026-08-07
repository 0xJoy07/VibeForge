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

export default function ScoreRing({ scores, grade }: { scores: Scores; grade: Grade }) {
  const score = overallScore(scores);
  const data = AXES.map((axis, index) => ({
    name: axis.label,
    value: scores[axis.key],
    fill: axis.color,
    innerRadius: 42 + index * 13,
    outerRadius: 51 + index * 13,
  }));

  return (
    <div className="grid gap-[48px] rounded-[16px] border border-white/10 bg-[#0b1a11] p-[32px] lg:grid-cols-[360px_1fr] lg:items-center">
      <div className="relative h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="28%" outerRadius="95%" data={data} startAngle={90} endAngle={-270} barSize={10}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#183522" }} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-black text-white">{score}</div>
          <div className={`mt-2 rounded-md border px-3 py-1 text-sm font-bold ${gradeClasses[grade]}`}>Grade {grade}</div>
        </div>
      </div>
      <div className="space-y-4">
        {AXES.map((axis) => (
          <div key={axis.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-white">{axis.label}</span>
              <span className="text-zinc-400">{scores[axis.key]}/100</span>
            </div>
            <div className="h-[4px] overflow-hidden rounded-[2px] bg-zinc-800">
              <div className="h-full rounded-[2px]" style={{ width: `${scores[axis.key]}%`, background: axis.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
