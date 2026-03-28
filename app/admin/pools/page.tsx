"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Layers, Plus, Edit2, Trash2, Search, X, CheckCircle,
  Loader2, AlertTriangle, BookOpen, Save, ArrowLeft, ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  id: string;
  question_text: string;
  answer_key: string;
  subject: string;
  category: string;
  difficulty?: string;
};

type Pool = {
  id: string;
  pool_number: number;
  name: string;
  questions: Question[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const REQUIRED = 10;
const MAX_POOLS = 30;

const DEMO_QUESTIONS: Question[] = [
  { id: "f1",  question_text: "What is the chemical symbol for Gold?",           answer_key: "Au",                     subject: "Chemistry",   category: "science",    difficulty: "easy"   },
  { id: "f2",  question_text: "What is the capital of Ghana?",                    answer_key: "Accra",                  subject: "Geography",   category: "general",    difficulty: "easy"   },
  { id: "f3",  question_text: "Who wrote 'Things Fall Apart'?",                   answer_key: "Chinua Achebe",          subject: "Literature",  category: "arts",       difficulty: "medium" },
  { id: "f4",  question_text: "What is the powerhouse of the cell?",              answer_key: "Mitochondria",           subject: "Biology",     category: "science",    difficulty: "medium" },
  { id: "f5",  question_text: "What does GDP stand for?",                         answer_key: "Gross Domestic Product", subject: "Economics",   category: "commercial", difficulty: "easy"   },
  { id: "f6",  question_text: "What is the square root of 144?",                  answer_key: "12",                     subject: "Mathematics", category: "science",    difficulty: "easy"   },
  { id: "f7",  question_text: "Name the longest river in Africa.",                answer_key: "Nile",                   subject: "Geography",   category: "general",    difficulty: "easy"   },
  { id: "f8",  question_text: "What element has the symbol 'Fe'?",                answer_key: "Iron",                   subject: "Chemistry",   category: "science",    difficulty: "easy"   },
  { id: "f9",  question_text: "In what year did Nigeria gain independence?",      answer_key: "1960",                   subject: "History",     category: "general",    difficulty: "easy"   },
  { id: "f10", question_text: "What is the approximate speed of light?",          answer_key: "300,000 km/s",           subject: "Physics",     category: "science",    difficulty: "medium" },
  { id: "f11", question_text: "What gas do plants absorb during photosynthesis?", answer_key: "Carbon Dioxide (CO₂)",  subject: "Biology",     category: "science",    difficulty: "easy"   },
  { id: "f12", question_text: "Who was the first President of Nigeria?",          answer_key: "Nnamdi Azikiwe",         subject: "History",     category: "general",    difficulty: "easy"   },
  { id: "f13", question_text: "What is the chemical formula for water?",          answer_key: "H₂O",                   subject: "Chemistry",   category: "science",    difficulty: "easy"   },
  { id: "f14", question_text: "How many sides does a hexagon have?",              answer_key: "6",                      subject: "Mathematics", category: "science",    difficulty: "easy"   },
  { id: "f15", question_text: "What is the hardest natural substance on Earth?",  answer_key: "Diamond",                subject: "Science",     category: "science",    difficulty: "medium" },
  { id: "f16", question_text: "What planet is known as the Red Planet?",          answer_key: "Mars",                   subject: "Physics",     category: "science",    difficulty: "easy"   },
  { id: "f17", question_text: "What is the capital of Nigeria?",                  answer_key: "Abuja",                  subject: "Geography",   category: "general",    difficulty: "easy"   },
  { id: "f18", question_text: "Who invented the telephone?",                      answer_key: "Alexander Graham Bell",  subject: "History",     category: "general",    difficulty: "easy"   },
  { id: "f19", question_text: "What is 15% of 200?",                              answer_key: "30",                     subject: "Mathematics", category: "commercial", difficulty: "easy"   },
  { id: "f20", question_text: "What is the boiling point of water in Celsius?",   answer_key: "100°C",                  subject: "Chemistry",   category: "science",    difficulty: "easy"   },
];

const DEMO_POOLS: Pool[] = [
  {
    id: "demo-pool-1", pool_number: 1, name: "Science Basics",
    questions: DEMO_QUESTIONS.slice(0, 10),
  },
  {
    id: "demo-pool-2", pool_number: 2, name: "History & Geography",
    questions: [DEMO_QUESTIONS[1], DEMO_QUESTIONS[6], DEMO_QUESTIONS[8], DEMO_QUESTIONS[11],
                DEMO_QUESTIONS[16], DEMO_QUESTIONS[17], DEMO_QUESTIONS[2], DEMO_QUESTIONS[4],
                DEMO_QUESTIONS[14], DEMO_QUESTIONS[18]],
  },
  {
    id: "demo-pool-3", pool_number: 3, name: "Mixed Challenge",
    questions: [DEMO_QUESTIONS[0], DEMO_QUESTIONS[2], DEMO_QUESTIONS[4], DEMO_QUESTIONS[6],
                DEMO_QUESTIONS[8], DEMO_QUESTIONS[10], DEMO_QUESTIONS[12], DEMO_QUESTIONS[14],
                DEMO_QUESTIONS[16], DEMO_QUESTIONS[18]],
  },
];

const DIFF_COLORS: Record<string, string> = {
  easy:   "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard:   "bg-red-500/20 text-red-400",
};

function PoolNumberBadge({ num }: { num: number }) {
  return (
    <div className="w-14 h-14 rounded-2xl bg-[#f5a623]/20 border border-[#f5a623]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-[#f5a623] font-black text-xl">{String(num).padStart(2, "0")}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQ, setLoadingQ] = useState(false);
  const [dbError, setDbError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pool | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Editor state
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingPool, setEditingPool] = useState<Pool | null>(null); // null = creating
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [qSearch, setQSearch] = useState("");
  const [qFilterCat, setQFilterCat] = useState("");
  const [qFilterDiff, setQFilterDiff] = useState("");

  // ── Fetch pools ──────────────────────────────────────────────────────────
  const fetchPools = useCallback(async () => {
    setLoading(true);
    setDbError("");
    if (!isSupabaseConfigured) {
      setPools(DEMO_POOLS);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("sc_question_pools")
        .select(`
          id, pool_number, name,
          sc_pool_questions (
            order_index,
            sc_questions ( id, question_text, answer_key, subject, category, difficulty )
          )
        `)
        .order("pool_number") as { data: any[] | null; error: any };

      if (error) throw error;
      const mapped: Pool[] = (data ?? []).map((p: any) => ({
        id: p.id,
        pool_number: p.pool_number,
        name: p.name,
        questions: (p.sc_pool_questions ?? [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((pq: any) => pq.sc_questions)
          .filter(Boolean),
      }));
      setPools(mapped);
    } catch (e: any) {
      setDbError(e.message ?? "Failed to load pools");
      setPools([]);
    }
    setLoading(false);
  }, []);

  // ── Fetch question bank (for editor) ─────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    if (!isSupabaseConfigured) {
      setAllQuestions(DEMO_QUESTIONS);
      setLoadingQ(false);
      return;
    }
    const { data, error } = await supabase
      .from("sc_questions")
      .select("id, question_text, answer_key, subject, category, difficulty")
      .order("subject");
    setAllQuestions(error || !data?.length ? DEMO_QUESTIONS : data);
    setLoadingQ(false);
  }, []);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  // ── Open editor ────────────────────────────────────────────────────────
  const openCreate = () => {
    fetchQuestions();
    const usedNums = new Set(pools.map((p) => p.pool_number));
    const firstFree = Array.from({ length: MAX_POOLS }, (_, i) => i + 1).find((n) => !usedNums.has(n)) ?? 1;
    setEditingPool(null);
    setEditName("");
    setEditNumber(firstFree);
    setSelectedIds(new Set());
    setSaveError("");
    setQSearch("");
    setQFilterCat("");
    setQFilterDiff("");
    setView("editor");
  };

  const openEdit = (pool: Pool) => {
    fetchQuestions();
    setEditingPool(pool);
    setEditName(pool.name);
    setEditNumber(pool.pool_number);
    setSelectedIds(new Set(pool.questions.map((q) => q.id)));
    setSaveError("");
    setQSearch("");
    setQFilterCat("");
    setQFilterDiff("");
    setView("editor");
  };

  const closeEditor = () => { setView("list"); setEditingPool(null); };

  // ── Selection helpers ──────────────────────────────────────────────────
  const toggleQuestion = (q: Question) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) { next.delete(q.id); }
      else if (next.size < REQUIRED) { next.add(q.id); }
      return next;
    });
  };

  const filteredQ = allQuestions.filter((q) => {
    const t = qSearch.toLowerCase();
    return (
      (!t || q.question_text.toLowerCase().includes(t) || q.subject.toLowerCase().includes(t)) &&
      (!qFilterCat  || q.category  === qFilterCat) &&
      (!qFilterDiff || q.difficulty === qFilterDiff)
    );
  });

  const selectedCount = selectedIds.size;
  const canSave = editName.trim().length > 0 && selectedCount === REQUIRED;

  // ── Save pool ──────────────────────────────────────────────────────────
  const savePool = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError("");
    const chosenQuestions = allQuestions.filter((q) => selectedIds.has(q.id));
    const isEditing = editingPool !== null;

    if (!isSupabaseConfigured) {
      // Demo mode: update local state only
      if (isEditing) {
        setPools((prev) => prev.map((p) => p.id === editingPool!.id
          ? { ...p, name: editName.trim(), pool_number: editNumber, questions: chosenQuestions }
          : p
        ));
      } else {
        const newPool: Pool = {
          id: `demo-pool-${Date.now()}`,
          pool_number: editNumber,
          name: editName.trim(),
          questions: chosenQuestions,
        };
        setPools((prev) => [...prev, newPool].sort((a, b) => a.pool_number - b.pool_number));
      }
      setSaving(false);
      closeEditor();
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      if (isEditing) {
        // Update name + number
        const { error: upErr } = await db
          .from("sc_question_pools")
          .update({ name: editName.trim(), pool_number: editNumber })
          .eq("id", editingPool!.id);
        if (upErr) throw upErr;

        // Replace all pool questions
        const { error: delErr } = await db
          .from("sc_pool_questions")
          .delete()
          .eq("pool_id", editingPool!.id);
        if (delErr) throw delErr;

        const rows = chosenQuestions.map((q, i) => ({
          pool_id: editingPool!.id,
          question_id: q.id,
          order_index: i,
        }));
        const { error: insErr } = await db.from("sc_pool_questions").insert(rows);
        if (insErr) throw insErr;
      } else {
        // Create new pool
        const { data: newPoolData, error: newErr } = await db
          .from("sc_question_pools")
          .insert({ pool_number: editNumber, name: editName.trim() })
          .select()
          .single();
        if (newErr) throw newErr;

        const rows = chosenQuestions.map((q, i) => ({
          pool_id: newPoolData.id,
          question_id: q.id,
          order_index: i,
        }));
        const { error: insErr } = await db.from("sc_pool_questions").insert(rows);
        if (insErr) throw insErr;
      }
      await fetchPools();
      closeEditor();
    } catch (e: any) {
      setSaveError(e.message ?? "Save failed");
    }
    setSaving(false);
  };

  // ── Delete pool ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (!isSupabaseConfigured) {
      setPools((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleting(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("sc_question_pools")
      .delete()
      .eq("id", deleteTarget.id);
    if (!error) { await fetchPools(); }
    setDeleteTarget(null);
    setDeleting(false);
  };

  // ── Used pool numbers (excluding the one being edited) ────────────────
  const usedNumbers = new Set(
    pools.filter((p) => p.id !== editingPool?.id).map((p) => p.pool_number)
  );
  const availableNumbers = Array.from({ length: MAX_POOLS }, (_, i) => i + 1).filter(
    (n) => !usedNumbers.has(n) || n === editNumber
  );

  // ── EDITOR VIEW ────────────────────────────────────────────────────────
  if (view === "editor") {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={closeEditor}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm px-3 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors">
              <ArrowLeft size={15} /> Back to Pools
            </button>
            <div>
              <h1 className="text-xl font-black">{editingPool ? "Edit Pool" : "New Question Pool"}</h1>
              <p className="text-white/40 text-xs mt-0.5">Select exactly {REQUIRED} questions for this pool</p>
            </div>
          </div>
          <button
            disabled={!canSave || saving}
            onClick={savePool}
            className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a1628] font-black px-6 py-2.5 rounded-xl transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Pool"}
          </button>
        </div>

        {saveError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={15} /> {saveError}
          </div>
        )}

        {/* Pool meta */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Pool Number (1–30)</label>
            <select
              value={editNumber}
              onChange={(e) => setEditNumber(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#f5a623]/40 text-lg font-black"
            >
              {availableNumbers.map((n) => (
                <option key={n} value={n} className="bg-[#0a1628]">Pool {String(n).padStart(2, "0")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Pool Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Science Basics, History Mix…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40"
            />
          </div>
        </div>

        {/* Selection counter */}
        <div className={clsx(
          "flex items-center justify-between rounded-2xl px-5 py-3 mb-4 border transition-colors",
          selectedCount === REQUIRED
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-white/5 border-white/10 text-white/60"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx("text-3xl font-black", selectedCount === REQUIRED ? "text-green-400" : "text-[#f5a623]")}>
              {selectedCount}
            </div>
            <div className="text-sm">
              of {REQUIRED} questions selected
              {selectedCount < REQUIRED && <span className="text-white/30 ml-2">· Need {REQUIRED - selectedCount} more</span>}
              {selectedCount === REQUIRED && <span className="ml-2 font-bold">✓ Ready to save!</span>}
            </div>
          </div>
          {selectedCount > 0 && (
            <button onClick={() => setSelectedIds(new Set())} className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Clear all
            </button>
          )}
        </div>

        {/* Selected pills */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/3 border border-white/5 rounded-xl">
            {allQuestions.filter((q) => selectedIds.has(q.id)).map((q, i) => (
              <div key={q.id} className="flex items-center gap-1.5 bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] rounded-full px-3 py-1 text-xs font-medium">
                <span className="text-[#f5a623]/60 font-black">{i + 1}.</span>
                <span className="max-w-[180px] truncate">{q.question_text}</span>
                <button onClick={() => toggleQuestion(q)} className="text-[#f5a623]/50 hover:text-[#f5a623] ml-1">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={14} className="text-white/30 flex-shrink-0" />
            <input
              value={qSearch} onChange={(e) => setQSearch(e.target.value)}
              placeholder="Search questions or subjects…"
              className="bg-transparent text-sm text-white placeholder-white/20 outline-none w-full"
            />
            {qSearch && <button onClick={() => setQSearch("")} className="text-white/20 hover:text-white"><X size={13} /></button>}
          </div>
          <select value={qFilterCat} onChange={(e) => setQFilterCat(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
            <option value="" className="bg-[#0a1628]">All Categories</option>
            <option value="science"    className="bg-[#0a1628]">Science</option>
            <option value="arts"       className="bg-[#0a1628]">Arts</option>
            <option value="commercial" className="bg-[#0a1628]">Commercial</option>
            <option value="general"    className="bg-[#0a1628]">General</option>
          </select>
          <select value={qFilterDiff} onChange={(e) => setQFilterDiff(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
            <option value="" className="bg-[#0a1628]">All Difficulties</option>
            <option value="easy"   className="bg-[#0a1628]">Easy</option>
            <option value="medium" className="bg-[#0a1628]">Medium</option>
            <option value="hard"   className="bg-[#0a1628]">Hard</option>
          </select>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-auto">
          {loadingQ ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
              <Loader2 size={32} className="animate-spin" />
              <span>Loading questions…</span>
            </div>
          ) : filteredQ.length === 0 ? (
            <div className="text-center py-20 text-white/20">No questions match your filters.</div>
          ) : (
            <div className="space-y-2">
              {filteredQ.map((q) => {
                const isSelected = selectedIds.has(q.id);
                const isDisabled = !isSelected && selectedCount >= REQUIRED;
                const selIdx = isSelected
                  ? allQuestions.filter((x) => selectedIds.has(x.id)).findIndex((x) => x.id === q.id) + 1
                  : null;
                return (
                  <button
                    key={q.id}
                    onClick={() => !isDisabled && toggleQuestion(q)}
                    disabled={isDisabled}
                    className={clsx(
                      "w-full flex items-start gap-4 px-5 py-4 rounded-2xl border text-left transition-all",
                      isSelected
                        ? "bg-[#f5a623]/15 border-[#f5a623]/40"
                        : isDisabled
                        ? "bg-white/2 border-white/5 opacity-30 cursor-not-allowed"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={clsx(
                      "w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all",
                      isSelected ? "bg-[#f5a623] border-[#f5a623]" : "border-white/20"
                    )}>
                      {isSelected && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1" stroke="#0a1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={clsx("font-medium text-sm leading-relaxed", isSelected ? "text-white" : "text-white/80")}>
                          {q.question_text}
                        </p>
                        {selIdx !== null && (
                          <span className="text-[#f5a623] text-xs font-black flex-shrink-0">#{selIdx}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-white/30 text-xs">{q.subject}</span>
                        <span className="text-white/10">·</span>
                        <span className="text-white/30 text-xs capitalize">{q.category}</span>
                        {q.difficulty && (
                          <>
                            <span className="text-white/10">·</span>
                            <span className={clsx("text-xs px-1.5 py-0.5 rounded-full capitalize font-medium", DIFF_COLORS[q.difficulty] ?? "text-white/40")}>
                              {q.difficulty}
                            </span>
                          </>
                        )}
                        <span className="text-white/10">·</span>
                        <span className="text-white/30 text-xs">Ans: <em className="not-italic text-white/50">{q.answer_key}</em></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Layers className="text-[#f5a623]" size={28} />
            Question Pools
          </h1>
          <p className="text-white/40 mt-1">
            Create up to {MAX_POOLS} pools of {REQUIRED} questions each. Teams pick their pool before a round.
          </p>
        </div>
        <button
          disabled={pools.length >= MAX_POOLS}
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0a1628] font-black px-5 py-3 rounded-xl transition-all"
        >
          <Plus size={18} /> New Pool
        </button>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>Demo mode — Supabase not configured. Pools created here are for preview only and won&apos;t persist on reload.</span>
        </div>
      )}

      {/* DB error */}
      {dbError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {dbError}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/30">
          <Loader2 size={40} className="animate-spin" />
          <span>Loading pools…</span>
        </div>
      ) : pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Layers size={36} className="text-white/20" />
          </div>
          <div>
            <div className="text-white/50 font-bold text-lg">No question pools yet</div>
            <div className="text-white/20 text-sm mt-1">Create your first pool to get started</div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black px-6 py-3 rounded-xl transition-all"
          >
            <Plus size={18} /> Create First Pool
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Pools Created", val: pools.length, sub: `of ${MAX_POOLS} max` },
              { label: "Questions Total", val: pools.reduce((s, p) => s + p.questions.length, 0) },
              { label: "Available Slots", val: MAX_POOLS - pools.length, sub: "remaining" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-3xl font-black text-[#f5a623]">{s.val}</div>
                <div className="text-white/60 text-sm font-medium mt-0.5">{s.label}</div>
                {s.sub && <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Pool grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pools.map((pool) => (
              <div key={pool.id} className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-4 transition-all group">
                {/* Pool header */}
                <div className="flex items-start gap-4">
                  <PoolNumberBadge num={pool.pool_number} />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-lg leading-tight">{pool.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <BookOpen size={12} className="text-white/30" />
                      <span className="text-white/40 text-xs">{pool.questions.length} questions</span>
                      {pool.questions.length < REQUIRED && (
                        <span className="text-yellow-400 text-xs font-medium">
                          · {REQUIRED - pool.questions.length} more needed
                        </span>
                      )}
                      {pool.questions.length === REQUIRED && (
                        <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={11} /> Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question preview */}
                <div className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1 flex-1">
                  {pool.questions.slice(0, 5).map((q, i) => (
                    <div key={q.id} className="flex items-start gap-2 text-xs text-white/40">
                      <span className="text-[#f5a623]/40 font-black flex-shrink-0 w-4">{i + 1}.</span>
                      <span className="truncate">{q.question_text}</span>
                    </div>
                  ))}
                  {pool.questions.length > 5 && (
                    <div className="text-white/20 text-xs pl-6">+{pool.questions.length - 5} more…</div>
                  )}
                  {pool.questions.length === 0 && (
                    <div className="text-white/20 text-xs text-center py-2">No questions assigned</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(pool)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-[#f5a623]/20 border border-white/10 hover:border-[#f5a623]/30 text-white/60 hover:text-[#f5a623] font-medium py-2.5 rounded-xl text-sm transition-all"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(pool)}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/30 hover:text-red-400 py-2.5 px-3 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            {pools.length < MAX_POOLS && (
              <button
                onClick={openCreate}
                className="border-2 border-dashed border-white/10 hover:border-[#f5a623]/30 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-[#f5a623]/60 transition-all min-h-48"
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div className="text-sm font-medium">Add Pool {String(pools.length + 1).padStart(2, "0")}</div>
              </button>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <div className="font-black text-white">Delete Pool {String(deleteTarget.pool_number).padStart(2, "0")}?</div>
                <div className="text-white/40 text-sm">{deleteTarget.name}</div>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-5">
              This will permanently remove the pool and its {deleteTarget.questions.length} question assignments.
              The questions themselves will not be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
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
