import { Trophy, Medal } from "lucide-react";

// Static placeholder data — replace with real Supabase query
const leaderboardData = [
  { rank: 1, team: "Team Lagos Panthers", school: "Kings College, Lagos", score: 890, category: "Science", state: "Lagos" },
  { rank: 2, team: "Ibadan Royals", school: "Govt College, Ibadan", score: 845, category: "Science", state: "Oyo" },
  { rank: 3, team: "Abuja Scholars", school: "Federal Science, Abuja", score: 810, category: "Commercial", state: "FCT" },
  { rank: 4, team: "Port Harcourt Elite", school: "Rumuola Secondary", score: 790, category: "Arts", state: "Rivers" },
  { rank: 5, team: "Kano Champions", school: "GSS Kano", score: 775, category: "Science", state: "Kano" },
  { rank: 6, team: "Enugu Eagles", school: "Government Secondary, Enugu", score: 760, category: "Commercial", state: "Enugu" },
  { rank: 7, team: "Kaduna Stars", school: "BSS Kaduna", score: 745, category: "Arts", state: "Kaduna" },
  { rank: 8, team: "Delta Warriors", school: "Warri Grammar School", score: 730, category: "Science", state: "Delta" },
];

const rankColors: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-slate-400",
  3: "text-amber-600",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#0a1628] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Rankings</div>
          <h1 className="text-5xl font-black text-white mb-4">Leaderboard</h1>
          <p className="text-white/60 text-xl">Live standings from the current competition season</p>
        </div>
      </section>

      {/* Top 3 podium */}
      <section className="bg-[#112244] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex-1 max-w-[180px] bg-white/10 border border-white/20 rounded-3xl p-5 text-center">
              <Medal size={32} className="text-slate-300 mx-auto mb-2" />
              <div className="text-white font-black text-sm mb-1">{leaderboardData[1].team}</div>
              <div className="text-white/50 text-xs mb-2">{leaderboardData[1].school}</div>
              <div className="text-slate-300 font-black text-2xl">{leaderboardData[1].score}</div>
              <div className="text-slate-300/60 text-xs">pts</div>
              <div className="mt-2 bg-slate-400 text-[#0a1628] font-black rounded-full text-xs py-1">2nd</div>
            </div>
            {/* 1st */}
            <div className="flex-1 max-w-[200px] bg-[#f5a623]/20 border border-[#f5a623]/40 rounded-3xl p-6 text-center -mt-4">
              <Trophy size={40} className="text-[#f5a623] mx-auto mb-2" />
              <div className="text-white font-black text-sm mb-1">{leaderboardData[0].team}</div>
              <div className="text-white/50 text-xs mb-2">{leaderboardData[0].school}</div>
              <div className="text-[#f5a623] font-black text-3xl">{leaderboardData[0].score}</div>
              <div className="text-[#f5a623]/60 text-xs">pts</div>
              <div className="mt-2 bg-[#f5a623] text-[#0a1628] font-black rounded-full text-xs py-1">1st</div>
            </div>
            {/* 3rd */}
            <div className="flex-1 max-w-[180px] bg-white/10 border border-white/20 rounded-3xl p-5 text-center">
              <Medal size={32} className="text-amber-600 mx-auto mb-2" />
              <div className="text-white font-black text-sm mb-1">{leaderboardData[2].team}</div>
              <div className="text-white/50 text-xs mb-2">{leaderboardData[2].school}</div>
              <div className="text-amber-600 font-black text-2xl">{leaderboardData[2].score}</div>
              <div className="text-amber-600/60 text-xs">pts</div>
              <div className="mt-2 bg-amber-700 text-white font-black rounded-full text-xs py-1">3rd</div>
            </div>
          </div>
        </div>
      </section>

      {/* Full table */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-[#0a1628] mb-6">All Teams</h2>
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0a1628] text-white text-sm">
                <tr>
                  <th className="py-4 px-5 text-left font-bold">Rank</th>
                  <th className="py-4 px-5 text-left font-bold">Team</th>
                  <th className="py-4 px-5 text-left font-bold hidden md:table-cell">School</th>
                  <th className="py-4 px-5 text-left font-bold hidden sm:table-cell">Category</th>
                  <th className="py-4 px-5 text-left font-bold hidden sm:table-cell">State</th>
                  <th className="py-4 px-5 text-right font-bold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardData.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className={`font-black text-lg ${rankColors[row.rank] ?? "text-slate-400"}`}>
                        #{row.rank}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#0a1628]">{row.team}</td>
                    <td className="py-4 px-5 text-slate-500 text-sm hidden md:table-cell">{row.school}</td>
                    <td className="py-4 px-5 hidden sm:table-cell">
                      <span className="bg-[#f5a623]/20 text-[#0a1628] text-xs font-bold px-2 py-1 rounded-full">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-sm hidden sm:table-cell">{row.state}</td>
                    <td className="py-4 px-5 text-right">
                      <span className="text-[#f5a623] font-black text-lg">{row.score}</span>
                      <span className="text-slate-400 text-xs"> pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">
            Standings update in real-time during active competition rounds.
          </p>
        </div>
      </section>
    </div>
  );
}
