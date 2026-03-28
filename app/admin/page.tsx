import Link from "next/link";
import { Users, HelpCircle, Zap, Trophy, TrendingUp, Activity } from "lucide-react";

const stats = [
  { label: "Registered Students", value: "2,847", icon: Users, change: "+142 today", color: "text-blue-400" },
  { label: "Total Questions", value: "350", icon: HelpCircle, change: "Across 3 categories", color: "text-purple-400" },
  { label: "Active Teams", value: "48", icon: Trophy, change: "From 36 states", color: "text-yellow-400" },
  { label: "Rounds Played", value: "12", icon: Activity, change: "This season", color: "text-green-400" },
];

const quickLinks = [
  { href: "/admin/questions", label: "Manage Questions", desc: "Add, edit, import question bank", icon: HelpCircle, color: "from-purple-500 to-purple-700" },
  { href: "/admin/teams", label: "Manage Teams", desc: "View, create and manage teams", icon: Users, color: "from-blue-500 to-blue-700" },
  { href: "/admin/live/rapid-fire", label: "Start Rapid Fire", desc: "Launch a live competition round", icon: Zap, color: "from-yellow-500 to-orange-600" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="text-white/50 mt-1">AventoLinks Scholars Challenge — Control Panel</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <Icon size={20} className={s.color} />
                <TrendingUp size={14} className="text-white/30" />
              </div>
              <div className="text-3xl font-black mb-1">{s.value}</div>
              <div className="text-white/60 text-sm font-medium">{s.label}</div>
              <div className="text-white/30 text-xs mt-1">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <h2 className="text-xl font-black mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((ql) => {
          const Icon = ql.icon;
          return (
            <Link
              key={ql.href}
              href={ql.href}
              className="bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-6 group transition-all hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ql.color} flex items-center justify-center mb-4`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="font-bold text-white mb-1">{ql.label}</div>
              <div className="text-white/50 text-sm">{ql.desc}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent registrations placeholder */}
      <h2 className="text-xl font-black mb-4">Recent Registrations</h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-white/50 text-sm">
              <th className="py-4 px-5 text-left font-medium">Name</th>
              <th className="py-4 px-5 text-left font-medium hidden md:table-cell">School</th>
              <th className="py-4 px-5 text-left font-medium hidden sm:table-cell">Category</th>
              <th className="py-4 px-5 text-left font-medium hidden sm:table-cell">State</th>
              <th className="py-4 px-5 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { name: "Amina Yusuf", school: "Govt College, Lagos", cat: "Science", state: "Lagos", status: "confirmed" },
              { name: "Chukwuemeka Obi", school: "BSS, Enugu", cat: "Commercial", state: "Enugu", status: "pending" },
              { name: "Fatima Aliyu", school: "GSS, Kano", cat: "Arts", state: "Kano", status: "confirmed" },
              { name: "David Eze", school: "King's College, Lagos", cat: "Science", state: "Lagos", status: "pending" },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-5 font-medium">{row.name}</td>
                <td className="py-4 px-5 text-white/50 text-sm hidden md:table-cell">{row.school}</td>
                <td className="py-4 px-5 hidden sm:table-cell">
                  <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-1 rounded-full font-bold">{row.cat}</span>
                </td>
                <td className="py-4 px-5 text-white/50 text-sm hidden sm:table-cell">{row.state}</td>
                <td className="py-4 px-5">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${row.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {row.status}
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
