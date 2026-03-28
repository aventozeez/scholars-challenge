"use client";
import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";

const mockTeams = [
  { id: "1", name: "Lagos Panthers", school: "Kings College, Lagos", state: "Lagos", category: "Science", members: 4, score: 890, status: "active" },
  { id: "2", name: "Ibadan Royals", school: "Govt College, Ibadan", state: "Oyo", category: "Science", members: 4, score: 845, status: "active" },
  { id: "3", name: "Abuja Scholars", school: "Federal Science, Abuja", state: "FCT", category: "Commercial", members: 3, score: 810, status: "active" },
  { id: "4", name: "Port Harcourt Elite", school: "Rumuola Secondary", state: "Rivers", category: "Arts", members: 4, score: 790, status: "eliminated" },
  { id: "5", name: "Kano Champions", school: "GSS Kano", state: "Kano", category: "Science", members: 4, score: 775, status: "active" },
];

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  eliminated: "bg-red-500/20 text-red-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  winner: "bg-yellow-400/20 text-yellow-300",
};

export default function TeamsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Team Management</h1>
          <p className="text-white/50 mt-1">{mockTeams.length} teams registered</p>
        </div>
        <button className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] px-4 py-2 rounded-xl text-sm font-black transition-colors">
          <Plus size={16} /> Add Team
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Teams", val: "48" },
          { label: "Active", val: "36" },
          { label: "Eliminated", val: "10" },
          { label: "Winners", val: "2" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black">{s.val}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-6 max-w-sm">
        <Search size={16} className="text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
        />
      </div>

      {/* Teams table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-white/40 text-xs uppercase">
              <th className="py-3 px-5 text-left">Team</th>
              <th className="py-3 px-5 text-left hidden md:table-cell">School</th>
              <th className="py-3 px-5 text-left hidden sm:table-cell">Category</th>
              <th className="py-3 px-5 text-left hidden sm:table-cell">Members</th>
              <th className="py-3 px-5 text-right">Score</th>
              <th className="py-3 px-5 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((team) => (
              <tr key={team.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f5a623]/20 rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-[#f5a623]" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{team.name}</div>
                      <div className="text-white/40 text-xs">{team.state}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 text-white/60 text-sm hidden md:table-cell">{team.school}</td>
                <td className="py-4 px-5 hidden sm:table-cell">
                  <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-1 rounded-full font-bold">
                    {team.category}
                  </span>
                </td>
                <td className="py-4 px-5 text-white/60 text-sm hidden sm:table-cell">
                  {team.members}/4 members
                </td>
                <td className="py-4 px-5 text-right">
                  <span className="text-[#f5a623] font-black">{team.score}</span>
                  <span className="text-white/30 text-xs"> pts</span>
                </td>
                <td className="py-4 px-5">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold capitalize ${statusColors[team.status]}`}>
                    {team.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
