"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Users, HelpCircle, Zap, Trophy, TrendingUp, Activity,
  Radio, Layers, Database, AlertTriangle, CheckCircle, Settings,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Counts = { questions: number; teams: number; pools: number };

const quickLinks = [
  { href: "/admin/questions",      label: "Manage Questions",  desc: "Add, edit, delete question bank",       icon: HelpCircle, color: "from-purple-500 to-purple-700" },
  { href: "/admin/teams",          label: "Manage Teams",      desc: "Add teams, update status & scores",     icon: Users,      color: "from-blue-500 to-blue-700" },
  { href: "/admin/pools",          label: "Question Pools",    desc: "Build pools of 10 questions each",      icon: Layers,     color: "from-teal-500 to-teal-700" },
  { href: "/admin/live/rapid-fire",label: "Start Rapid Fire",  desc: "Multi-team 60-second rounds",           icon: Zap,        color: "from-yellow-500 to-orange-600" },
  { href: "/admin/live/buzzer",    label: "Buzzer Round",      desc: "Head-to-head two-team buzzer match",    icon: Radio,      color: "from-red-500 to-pink-700" },
  { href: "/admin/setup",          label: "DB Setup Guide",    desc: "Connect Supabase for live data",        icon: Database,   color: "from-slate-500 to-slate-700" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("sc_questions").select("id", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("sc_match_teams").select("id", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("sc_question_pools").select("id", { count: "exact", head: true }),
    ]).then(([q, t, p]) => {
      setCounts({
        questions: q.count ?? 0,
        teams:     t.count ?? 0,
        pools:     p.count ?? 0,
      });
    });
  }, []);

  const stats = [
    { label: "Questions", value: counts ? String(counts.questions) : "—", icon: HelpCircle, change: "In question bank", color: "text-purple-400" },
    { label: "Teams",     value: counts ? String(counts.teams)     : "—", icon: Users,      change: "Registered teams",  color: "text-blue-400"   },
    { label: "Pools",     value: counts ? String(counts.pools)     : "—", icon: Layers,     change: "Question pools",    color: "text-teal-400"   },
    { label: "Live Mode", value: "2",  icon: Activity, change: "Rapid Fire + Buzzer",       color: "text-yellow-400"  },
  ];

  return (
    <div className="p-8 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="text-white/50 mt-1">AventoLinks Scholars Challenge — Control Panel</p>
      </div>

      {/* Supabase connection banner */}
      {!isSupabaseConfigured ? (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4 flex items-start gap-4">
          <AlertTriangle size={22} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-yellow-400 font-black mb-0.5">Running in Demo Mode</div>
            <div className="text-yellow-400/60 text-sm">
              Supabase is not configured. Questions, teams, and pools won&apos;t save permanently.
              Connect a database to enable live data.
            </div>
          </div>
          <Link
            href="/admin/setup"
            className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 font-bold px-4 py-2 rounded-xl text-sm transition-all"
          >
            <Settings size={14} /> Set Up Database
          </Link>
        </div>
      ) : (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          <div>
            <div className="text-green-400 font-bold">Supabase Connected</div>
            <div className="text-green-400/60 text-sm">All data is saving to your database.</div>
          </div>
        </div>
      )}

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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}
