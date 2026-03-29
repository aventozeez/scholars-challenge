"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Users, Plus, Search, Edit2, Trash2, CheckCircle,
  Loader2, AlertTriangle, X, Save, Filter,
} from "lucide-react";
import clsx from "clsx";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type TeamStatus = "active" | "eliminated" | "winner";
type TeamCategory = "science" | "arts" | "commercial" | "general";

type MatchTeam = {
  id: string;
  team_name: string;
  school_name: string;
  state: string;
  category: TeamCategory;
  status: TeamStatus;
  total_score: number;
  created_at: string;
};

type FormData = {
  team_name: string;
  school_name: string;
  state: string;
  category: TeamCategory;
  status: TeamStatus;
};

const BLANK_FORM: FormData = {
  team_name: "",
  school_name: "",
  state: "",
  category: "general",
  status: "active",
};

const DEMO_TEAMS: MatchTeam[] = [
  { id: "d1", team_name: "Lagos Panthers",      school_name: "Kings College, Lagos",    state: "Lagos",   category: "science",    status: "active",    total_score: 890, created_at: "" },
  { id: "d2", team_name: "Ibadan Royals",        school_name: "Govt College, Ibadan",    state: "Oyo",     category: "science",    status: "active",    total_score: 845, created_at: "" },
  { id: "d3", team_name: "Abuja Scholars",       school_name: "Federal Science, Abuja",  state: "FCT",     category: "commercial", status: "active",    total_score: 810, created_at: "" },
  { id: "d4", team_name: "Port Harcourt Elite",  school_name: "Rumuola Secondary",       state: "Rivers",  category: "arts",       status: "eliminated", total_score: 790, created_at: "" },
  { id: "d5", team_name: "Kano Champions",       school_name: "GSS Kano",               state: "Kano",    category: "science",    status: "active",    total_score: 775, created_at: "" },
];

const STATUS_STYLES: Record<TeamStatus, string> = {
  active:     "bg-green-500/20 text-green-400 border-green-500/20",
  eliminated: "bg-red-500/20 text-red-400 border-red-500/20",
  winner:     "bg-yellow-400/20 text-yellow-300 border-yellow-400/20",
};

const CAT_STYLES: Record<TeamCategory, string> = {
  science:    "bg-blue-500/20 text-blue-400",
  arts:       "bg-purple-500/20 text-purple-400",
  commercial: "bg-orange-500/20 text-orange-400",
  general:    "bg-white/10 text-white/60",
};

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamsPage() {
  const [teams, setTeams] = useState<MatchTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [dbError, setDbError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<TeamCategory | "">("");
  const [filterStatus, setFilterStatus] = useState<TeamStatus | "">("");

  // Add / edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<MatchTeam | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setDbError("");
    if (!isSupabaseConfigured) {
      setTeams(DEMO_TEAMS);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sc_match_teams")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTeams(data ?? []);
      setIsDemo(false);
    } catch (e: any) {
      setDbError(e.message ?? "Failed to load teams");
      setTeams(DEMO_TEAMS);
      setIsDemo(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setSaveError("");
    setShowAddModal(true);
  };

  const openEdit = (t: MatchTeam) => {
    setEditingId(t.id);
    setForm({ team_name: t.team_name, school_name: t.school_name, state: t.state, category: t.category, status: t.status });
    setSaveError("");
    setShowAddModal(true);
  };

  const closeModal = () => { setShowAddModal(false); setEditingId(null); };

  // ── Save (add or edit) ─────────────────────────────────────────────────
  const saveTeam = async () => {
    if (!form.team_name.trim()) { setSaveError("Team name is required"); return; }
    setSaving(true);
    setSaveError("");

    const payload = {
      team_name: form.team_name.trim(),
      school_name: form.school_name.trim(),
      state: form.state.trim(),
      category: form.category,
      status: form.status,
    };

    if (!isSupabaseConfigured) {
      if (editingId) {
        setTeams((prev) => prev.map((t) => t.id === editingId ? { ...t, ...payload } : t));
      } else {
        setTeams((prev) => [{
          id: `local-${Date.now()}`,
          ...payload,
          total_score: 0,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
      setSaving(false);
      closeModal();
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      if (editingId) {
        const { error } = await db.from("sc_match_teams").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await db.from("sc_match_teams").insert(payload);
        if (error) throw error;
      }
      await fetchTeams();
      closeModal();
    } catch (e: any) {
      setSaveError(e.message ?? "Save failed");
    }
    setSaving(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (!isSupabaseConfigured) {
      setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleting(false);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("sc_match_teams").delete().eq("id", deleteTarget.id);
      await fetchTeams();
    } catch { /* ignore */ }
    setDeleteTarget(null);
    setDeleting(false);
  };

  // ── Quick status update ────────────────────────────────────────────────
  const cycleStatus = async (t: MatchTeam) => {
    const next: TeamStatus = t.status === "active" ? "eliminated" : t.status === "eliminated" ? "winner" : "active";
    if (!isSupabaseConfigured) {
      setTeams((prev) => prev.map((x) => x.id === t.id ? { ...x, status: next } : x));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("sc_match_teams").update({ status: next }).eq("id", t.id);
    setTeams((prev) => prev.map((x) => x.id === t.id ? { ...x, status: next } : x));
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = teams.filter((t) => {
    const s = search.toLowerCase();
    return (
      (!s || t.team_name.toLowerCase().includes(s) || t.school_name.toLowerCase().includes(s) || t.state.toLowerCase().includes(s)) &&
      (!filterCat    || t.category === filterCat) &&
      (!filterStatus || t.status   === filterStatus)
    );
  });

  const stats = {
    total: teams.length,
    active: teams.filter((t) => t.status === "active").length,
    eliminated: teams.filter((t) => t.status === "eliminated").length,
    winners: teams.filter((t) => t.status === "winner").length,
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="text-[#f5a623]" size={28} /> Team Management
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Add and manage competition teams. Saved teams can be selected in Buzzer &amp; Rapid Fire rounds.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black px-5 py-3 rounded-xl transition-all"
        >
          <Plus size={18} /> Add Team
        </button>
      </div>

      {/* Banners */}
      {isDemo && (
        <div className="mb-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
          <AlertTriangle size={15} className="flex-shrink-0" />
          Demo mode — Supabase not configured. Teams added here won&apos;t persist on reload.
          <a href="/admin/setup" className="ml-auto underline underline-offset-2 hover:text-yellow-300 text-xs whitespace-nowrap">
            Set up Supabase →
          </a>
        </div>
      )}
      {dbError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {dbError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Teams",  val: stats.total,      color: "text-white" },
          { label: "Active",       val: stats.active,     color: "text-green-400" },
          { label: "Eliminated",   val: stats.eliminated, color: "text-red-400" },
          { label: "Winners",      val: stats.winners,    color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className={clsx("text-3xl font-black", s.color)}>{s.val}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-white/30 flex-shrink-0" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams, schools or states…"
            className="bg-transparent text-sm text-white placeholder-white/20 outline-none w-full"
          />
          {search && <button onClick={() => setSearch("")} className="text-white/20 hover:text-white"><X size={13} /></button>}
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value as TeamCategory | "")}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
          <option value="" className="bg-[#0a1628]">All Categories</option>
          <option value="science"    className="bg-[#0a1628]">Science</option>
          <option value="arts"       className="bg-[#0a1628]">Arts</option>
          <option value="commercial" className="bg-[#0a1628]">Commercial</option>
          <option value="general"    className="bg-[#0a1628]">General</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TeamStatus | "")}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
          <option value="" className="bg-[#0a1628]">All Statuses</option>
          <option value="active"     className="bg-[#0a1628]">Active</option>
          <option value="eliminated" className="bg-[#0a1628]">Eliminated</option>
          <option value="winner"     className="bg-[#0a1628]">Winner</option>
        </select>
        {(search || filterCat || filterStatus) && (
          <button onClick={() => { setSearch(""); setFilterCat(""); setFilterStatus(""); }}
            className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1.5">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/30">
          <Loader2 size={36} className="animate-spin" />
          <span>Loading teams…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <Users size={40} className="text-white/10" />
          <div className="text-white/40 font-medium">{teams.length === 0 ? "No teams yet" : "No teams match your filters"}</div>
          {teams.length === 0 && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#f5a623] text-[#0a1628] font-black px-5 py-2.5 rounded-xl">
              <Plus size={16} /> Add First Team
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="py-3 px-5 text-left">Team</th>
                <th className="py-3 px-5 text-left hidden md:table-cell">School</th>
                <th className="py-3 px-5 text-left hidden sm:table-cell">Category</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((team) => (
                <tr key={team.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f5a623]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users size={15} className="text-[#f5a623]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{team.team_name}</div>
                        <div className="text-white/30 text-xs">{team.state || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-white/50 text-sm hidden md:table-cell">
                    {team.school_name || <span className="text-white/20 italic">No school</span>}
                  </td>
                  <td className="py-4 px-5 hidden sm:table-cell">
                    <span className={clsx("text-xs px-2.5 py-1 rounded-full font-bold capitalize", CAT_STYLES[team.category])}>
                      {team.category}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => cycleStatus(team)}
                      title="Click to change status"
                      className={clsx("text-xs px-2.5 py-1 rounded-full font-bold capitalize border transition-all hover:opacity-80 cursor-pointer", STATUS_STYLES[team.status])}
                    >
                      {team.status}
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(team)}
                        className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(team)}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-white/5 text-white/20 text-xs">
            Showing {filtered.length} of {teams.length} teams · Click status badge to cycle Active → Eliminated → Winner
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black">{editingId ? "Edit Team" : "Add New Team"}</h2>
              <button onClick={closeModal} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            {saveError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {saveError}
              </div>
            )}

            <div className="space-y-4">
              {/* Team name */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.team_name}
                  onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))}
                  placeholder="e.g. Lagos Panthers"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40"
                  autoFocus
                />
              </div>

              {/* School name */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">School Name</label>
                <input
                  value={form.school_name}
                  onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))}
                  placeholder="e.g. Kings College, Lagos"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40"
                />
              </div>

              {/* State + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-[#f5a623]/40 text-sm"
                  >
                    <option value="" className="bg-[#0a1628]">Select state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a1628]">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TeamCategory }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-[#f5a623]/40 text-sm"
                  >
                    <option value="general"    className="bg-[#0a1628]">General</option>
                    <option value="science"    className="bg-[#0a1628]">Science</option>
                    <option value="arts"       className="bg-[#0a1628]">Arts</option>
                    <option value="commercial" className="bg-[#0a1628]">Commercial</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["active", "eliminated", "winner"] as TeamStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={clsx(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all",
                        form.status === s ? STATUS_STYLES[s] : "bg-white/3 border-white/10 text-white/30 hover:bg-white/5"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all">
                Cancel
              </button>
              <button
                onClick={saveTeam}
                disabled={saving || !form.team_name.trim()}
                className="flex-1 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0a1628] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <div className="font-black text-white">Delete Team?</div>
                <div className="text-white/40 text-sm">{deleteTarget.team_name}</div>
              </div>
            </div>
            <p className="text-white/40 text-sm mb-5">
              This will permanently remove the team from the database. Match records won&apos;t be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
