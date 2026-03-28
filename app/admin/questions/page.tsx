"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Plus, Search, Edit2, Trash2, X, Check, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  id: string;
  round_type: "rapid_fire" | "buzzer" | "puzzle";
  category: "science" | "arts" | "commercial" | "general";
  subject: string;
  question_text: string;
  answer_key: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

type FormData = Omit<Question, "id">;

const EMPTY_FORM: FormData = {
  round_type: "rapid_fire",
  category: "science",
  subject: "",
  question_text: "",
  answer_key: "",
  difficulty: "easy",
  points: 10,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "bg-green-500/20 text-green-400 border border-green-500/20",
  medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20",
  hard:   "bg-red-500/20 text-red-400 border border-red-500/20",
};

const ROUND_COLORS: Record<string, string> = {
  rapid_fire: "bg-blue-500/20 text-blue-400",
  buzzer:     "bg-purple-500/20 text-purple-400",
  puzzle:     "bg-orange-500/20 text-orange-400",
};

// ─── Inline field component ───────────────────────────────────────────────────
function Field({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-white/50 font-medium mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SelectInput({
  value, onChange, options, className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0a1628]">{o.label}</option>
      ))}
    </select>
  );
}

// ─── Question Form (Add / Edit) ───────────────────────────────────────────────
function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set = (key: keyof FormData) => (value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.question_text.trim() && form.answer_key.trim() && form.subject.trim();

  return (
    <div className="bg-[#051020] border border-[#f5a623]/20 rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Round Type">
          <SelectInput
            value={form.round_type}
            onChange={set("round_type")}
            options={[
              { value: "rapid_fire", label: "Rapid Fire" },
              { value: "buzzer",     label: "Buzzer"     },
              { value: "puzzle",     label: "Puzzle"     },
            ]}
          />
        </Field>
        <Field label="Category">
          <SelectInput
            value={form.category}
            onChange={set("category")}
            options={[
              { value: "science",    label: "Science"    },
              { value: "arts",       label: "Arts"       },
              { value: "commercial", label: "Commercial" },
              { value: "general",    label: "General"    },
            ]}
          />
        </Field>
        <Field label="Difficulty">
          <SelectInput
            value={form.difficulty}
            onChange={set("difficulty")}
            options={[
              { value: "easy",   label: "Easy"   },
              { value: "medium", label: "Medium" },
              { value: "hard",   label: "Hard"   },
            ]}
          />
        </Field>
        <Field label="Subject">
          <input
            value={form.subject}
            onChange={(e) => set("subject")(e.target.value)}
            placeholder="e.g. Chemistry"
            className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
          />
        </Field>
      </div>

      <Field label="Question Text">
        <textarea
          value={form.question_text}
          onChange={(e) => set("question_text")(e.target.value)}
          placeholder="Type the full question here..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none resize-none transition-colors"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Answer / Answer Key">
          <input
            value={form.answer_key}
            onChange={(e) => set("answer_key")(e.target.value)}
            placeholder="Correct answer"
            className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
          />
        </Field>
        <Field label="Points">
          <input
            type="number"
            value={form.points}
            onChange={(e) => set("points")(Number(e.target.value))}
            min={5}
            max={50}
            step={5}
            className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors"
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => valid && onSave(form)}
          disabled={!valid || saving}
          className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a1628] font-black px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {saving ? "Saving…" : "Save Question"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({
  question,
  onConfirm,
  onCancel,
  deleting,
}: {
  question: Question;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#051020] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-black">Delete Question?</h3>
            <p className="text-white/40 text-xs">This cannot be undone.</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 text-sm text-white/70 leading-relaxed">
          {question.question_text}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Seed data shown when Supabase is not yet configured ─────────────────────
const DEMO_QUESTIONS: Question[] = [
  { id: "d1", round_type: "rapid_fire", category: "science",    subject: "Chemistry",   question_text: "What is the chemical symbol for Gold?",       answer_key: "Au",                     difficulty: "easy",   points: 10 },
  { id: "d2", round_type: "buzzer",     category: "general",    subject: "Geography",   question_text: "What is the capital of Ghana?",                answer_key: "Accra",                  difficulty: "easy",   points: 10 },
  { id: "d3", round_type: "rapid_fire", category: "arts",       subject: "Literature",  question_text: "Who wrote 'Things Fall Apart'?",               answer_key: "Chinua Achebe",          difficulty: "medium", points: 10 },
  { id: "d4", round_type: "puzzle",     category: "science",    subject: "Physics",     question_text: "Rearrange: TGENERY (a form of energy)",        answer_key: "ENTROPY",                difficulty: "hard",   points: 20 },
  { id: "d5", round_type: "rapid_fire", category: "commercial", subject: "Economics",   question_text: "What does GDP stand for?",                     answer_key: "Gross Domestic Product", difficulty: "easy",   points: 10 },
  { id: "d6", round_type: "rapid_fire", category: "science",    subject: "Biology",     question_text: "What is the powerhouse of the cell?",          answer_key: "Mitochondria",           difficulty: "medium", points: 10 },
  { id: "d7", round_type: "buzzer",     category: "general",    subject: "History",     question_text: "In what year did Nigeria gain independence?",  answer_key: "1960",                   difficulty: "easy",   points: 10 },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDiff, setFilterDiff] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setDbError(null);

    if (!isSupabaseConfigured) {
      // No DB yet — show demo data so the UI is usable
      setQuestions(DEMO_QUESTIONS);
      setDbError("not_configured");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sc_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setDbError(error.message);
      setQuestions(DEMO_QUESTIONS); // fallback so the page still renders
    } else {
      setQuestions(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (form: FormData) => {
    setSaving(true);

    if (!isSupabaseConfigured) {
      // Local-only mode: generate a temp ID
      const newQ: Question = { ...form, id: `local-${Date.now()}` };
      setQuestions((prev) => [newQ, ...prev]);
      setShowAddForm(false);
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("sc_questions")
      .insert(form)
      .select()
      .single();

    if (error) {
      alert("Error saving question: " + error.message);
    } else {
      setQuestions((prev) => [data, ...prev]);
      setShowAddForm(false);
    }
    setSaving(false);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = async (form: FormData) => {
    if (!editingId) return;
    setSaving(true);

    if (!isSupabaseConfigured) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, ...form } : q))
      );
      setEditingId(null);
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("sc_questions")
      .update(form)
      .eq("id", editingId)
      .select()
      .single();

    if (error) {
      alert("Error updating question: " + error.message);
    } else {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? data : q)));
      setEditingId(null);
    }
    setSaving(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingQuestion) return;
    setDeleting(true);

    if (!isSupabaseConfigured) {
      setQuestions((prev) => prev.filter((q) => q.id !== deletingQuestion.id));
      setDeletingQuestion(null);
      setDeleting(false);
      return;
    }

    const { error } = await supabase
      .from("sc_questions")
      .delete()
      .eq("id", deletingQuestion.id);

    if (error) {
      alert("Error deleting question: " + error.message);
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== deletingQuestion.id));
      setDeletingQuestion(null);
    }
    setDeleting(false);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = questions.filter((q) => {
    const term = search.toLowerCase();
    return (
      (!term || q.question_text.toLowerCase().includes(term) || q.subject.toLowerCase().includes(term) || q.answer_key.toLowerCase().includes(term)) &&
      (!filterRound || q.round_type === filterRound) &&
      (!filterCat   || q.category   === filterCat)   &&
      (!filterDiff  || q.difficulty  === filterDiff)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Delete confirmation modal */}
      {deletingQuestion && (
        <DeleteModal
          question={deletingQuestion}
          onConfirm={handleDelete}
          onCancel={() => setDeletingQuestion(null)}
          deleting={deleting}
        />
      )}

      <div className="p-8 text-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Question Bank</h1>
            <p className="text-white/50 mt-1">
              {loading ? "Loading…" : `${questions.length} question${questions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-3 py-2 rounded-xl text-sm transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] px-4 py-2 rounded-xl text-sm font-black transition-colors"
            >
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>

        {/* Supabase banner */}
        {dbError && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-2xl p-4 mb-6 text-sm">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              {dbError === "not_configured" ? (
                <>
                  <div className="font-bold mb-0.5">Running in demo mode — Supabase not connected</div>
                  <div className="text-yellow-300/70">
                    Changes here are temporary (in-memory only). To persist data, add your Supabase credentials to{" "}
                    <code className="font-mono bg-white/10 px-1 rounded">.env.local</code> and restart the server.
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold mb-0.5">Database error</div>
                  <div className="text-yellow-300/70 text-xs font-mono">{dbError}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#f5a623] font-bold text-sm mb-3">
              <Plus size={15} /> New Question
            </div>
            <QuestionForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={15} className="text-white/30 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, subjects, answers…"
              className="bg-transparent text-sm text-white placeholder-white/20 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/30 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          {[
            {
              value: filterRound, set: setFilterRound,
              options: [["", "All Rounds"], ["rapid_fire", "Rapid Fire"], ["buzzer", "Buzzer"], ["puzzle", "Puzzle"]],
            },
            {
              value: filterCat, set: setFilterCat,
              options: [["", "All Categories"], ["science", "Science"], ["arts", "Arts"], ["commercial", "Commercial"], ["general", "General"]],
            },
            {
              value: filterDiff, set: setFilterDiff,
              options: [["", "All Difficulties"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]],
            },
          ].map((f, i) => (
            <select
              key={i}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              {f.options.map(([val, label]) => (
                <option key={val} value={val} className="bg-[#0a1628]">{label}</option>
              ))}
            </select>
          ))}
          {(filterRound || filterCat || filterDiff || search) && (
            <button
              onClick={() => { setFilterRound(""); setFilterCat(""); setFilterDiff(""); setSearch(""); }}
              className="text-white/40 hover:text-white text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Stats row */}
        {!loading && !dbError && (
          <div className="flex gap-4 mb-5 text-xs text-white/40">
            <span>Showing <strong className="text-white">{filtered.length}</strong> of {questions.length}</span>
            {filtered.length !== questions.length && (
              <span className="text-[#f5a623]">· filtered</span>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded-full w-3/4" />
                  <div className="h-2 bg-white/5 rounded-full w-1/3" />
                </div>
                <div className="h-5 w-20 bg-white/10 rounded-full" />
                <div className="h-5 w-16 bg-white/10 rounded-full" />
                <div className="h-5 w-14 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Questions table */}
        {!loading && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-white/20 text-4xl mb-3">🔍</div>
                <div className="text-white/30 font-medium">
                  {questions.length === 0 ? "No questions yet. Add one above!" : "No questions match your filters."}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/3">
                  <tr className="text-white/30 text-xs uppercase tracking-wider">
                    <th className="py-3 px-5 text-left font-medium">Question</th>
                    <th className="py-3 px-5 text-left font-medium hidden sm:table-cell">Round</th>
                    <th className="py-3 px-5 text-left font-medium hidden md:table-cell">Category</th>
                    <th className="py-3 px-5 text-left font-medium hidden lg:table-cell">Answer</th>
                    <th className="py-3 px-5 text-left font-medium">Diff.</th>
                    <th className="py-3 px-5 text-right font-medium">Pts</th>
                    <th className="py-3 px-5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((q) => (
                    <React.Fragment key={q.id}>
                      <tr
                        className={clsx(
                          "hover:bg-white/5 transition-colors",
                          editingId === q.id && "bg-white/5"
                        )}
                      >
                        <td className="py-3.5 px-5">
                          <div className="text-sm font-medium text-white max-w-xs">{q.question_text}</div>
                          <div className="text-xs text-white/30 mt-0.5">{q.subject}</div>
                        </td>
                        <td className="py-3.5 px-5 hidden sm:table-cell">
                          <span className={clsx("text-xs px-2 py-1 rounded-full font-medium capitalize", ROUND_COLORS[q.round_type])}>
                            {q.round_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-white/50 text-sm capitalize hidden md:table-cell">{q.category}</td>
                        <td className="py-3.5 px-5 text-white/50 text-sm hidden lg:table-cell max-w-[140px] truncate">{q.answer_key}</td>
                        <td className="py-3.5 px-5">
                          <span className={clsx("text-xs px-2 py-1 rounded-full font-bold capitalize", DIFFICULTY_COLORS[q.difficulty])}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right text-[#f5a623] font-black text-sm">{q.points}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingId(editingId === q.id ? null : q.id);
                                setShowAddForm(false);
                              }}
                              className={clsx(
                                "p-1.5 rounded-lg transition-colors",
                                editingId === q.id
                                  ? "bg-[#f5a623]/20 text-[#f5a623]"
                                  : "hover:bg-white/10 text-white/30 hover:text-white"
                              )}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingQuestion(q)}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-white/30 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline edit form */}
                      {editingId === q.id && (
                        <tr>
                          <td colSpan={7} className="px-5 pb-4 pt-0">
                            <div className="mt-1">
                              <QuestionForm
                                initial={{
                                  round_type:    q.round_type,
                                  category:      q.category,
                                  subject:       q.subject,
                                  question_text: q.question_text,
                                  answer_key:    q.answer_key,
                                  difficulty:    q.difficulty,
                                  points:        q.points,
                                }}
                                onSave={handleEdit}
                                onCancel={() => setEditingId(null)}
                                saving={saving}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Bottom count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-white/20 text-xs mt-4">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""} shown
          </p>
        )}
      </div>
    </>
  );
}
