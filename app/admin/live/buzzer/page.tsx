"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Radio, Play, RotateCcw, CheckCircle, XCircle, Trophy, Plus,
  Trash2, ArrowRight, Medal, Users, AlertTriangle, Loader2,
  Eye, EyeOff, SkipForward, BookOpen, ChevronLeft, Save,
} from "lucide-react";
import clsx from "clsx";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type BuzzerQuestion = {
  id: string;
  question_text: string;
  answer_key: string;
  subject: string;
};

type GameState = "setup" | "question-setup" | "playing" | "match-done";

type HistoryEntry = {
  questionText: string;
  answerKey: string;
  buzzedTeam: 0 | 1 | null;
  result: "correct" | "wrong" | "skip";
  pointsDelta: [number, number];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_Q = 10;
const CORRECT_PTS = 10;
const WRONG_PTS = -5;

const DEMO_QUESTIONS: BuzzerQuestion[] = [
  { id: "bz1",  question_text: "What is the chemical symbol for Sodium?",                     answer_key: "Na",                     subject: "Chemistry"   },
  { id: "bz2",  question_text: "Who painted the Mona Lisa?",                                  answer_key: "Leonardo da Vinci",      subject: "Art"         },
  { id: "bz3",  question_text: "What is 12 × 12?",                                            answer_key: "144",                    subject: "Mathematics" },
  { id: "bz4",  question_text: "In what continent is Nigeria located?",                        answer_key: "Africa",                 subject: "Geography"   },
  { id: "bz5",  question_text: "What force keeps planets in orbit around the sun?",            answer_key: "Gravity",                subject: "Physics"     },
  { id: "bz6",  question_text: "What is the largest organ in the human body?",                 answer_key: "Skin",                   subject: "Biology"     },
  { id: "bz7",  question_text: "How many chambers does the human heart have?",                 answer_key: "4",                      subject: "Biology"     },
  { id: "bz8",  question_text: "What is the currency of Japan?",                               answer_key: "Yen",                    subject: "Economics"   },
  { id: "bz9",  question_text: "What is the atomic number of Carbon?",                        answer_key: "6",                      subject: "Chemistry"   },
  { id: "bz10", question_text: "Which planet is farthest from the sun in our solar system?",  answer_key: "Neptune",                subject: "Physics"     },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BuzzerPage() {
  // ── Setup ─────────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>("setup");
  const [teamNames, setTeamNames] = useState(["Team A", "Team B"]);

  // ── Questions ─────────────────────────────────────────────────────────────
  const [matchQuestions, setMatchQuestions] = useState<BuzzerQuestion[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [addText, setAddText] = useState("");
  const [addAnswer, setAddAnswer] = useState("");
  const [addSubject, setAddSubject] = useState("");
  const [addingQ, setAddingQ] = useState(false);
  const [qError, setQError] = useState("");

  // ── Match ─────────────────────────────────────────────────────────────────
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [buzzedTeam, setBuzzedTeam] = useState<0 | 1 | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flashResult, setFlashResult] = useState<"correct" | "wrong" | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const flashTimer = useRef<NodeJS.Timeout | null>(null);
  const currentQ = matchQuestions[currentQIdx] ?? null;

  const clearFlash = useCallback(() => {
    if (flashTimer.current) { clearTimeout(flashTimer.current); flashTimer.current = null; }
  }, []);

  useEffect(() => () => clearFlash(), [clearFlash]);

  // ── Fetch buzzer questions from DB ─────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    setQError("");
    if (!isSupabaseConfigured) {
      setMatchQuestions(DEMO_QUESTIONS);
      setIsDemo(true);
      setLoadingQ(false);
      return;
    }
    const { data, error } = await supabase
      .from("sc_questions")
      .select("id, question_text, answer_key, subject")
      .eq("round_type", "buzzer")
      .order("created_at", { ascending: false });

    if (error) {
      setQError(error.message);
      setMatchQuestions(DEMO_QUESTIONS);
      setIsDemo(true);
    } else if (!data || data.length === 0) {
      setMatchQuestions([]);
      setIsDemo(false);
    } else {
      setMatchQuestions(data as BuzzerQuestion[]);
      setIsDemo(false);
    }
    setLoadingQ(false);
  }, []);

  // ── Add a question ─────────────────────────────────────────────────────
  const addQuestion = async () => {
    if (!addText.trim() || !addAnswer.trim()) return;
    setAddingQ(true);
    const newQ: BuzzerQuestion = {
      id: `local-${Date.now()}`,
      question_text: addText.trim(),
      answer_key: addAnswer.trim(),
      subject: addSubject.trim() || "General",
    };

    if (isSupabaseConfigured) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sc_questions")
        .insert({
          round_type: "buzzer",
          category: "general",
          subject: addSubject.trim() || "General",
          question_text: addText.trim(),
          answer_key: addAnswer.trim(),
          difficulty: "medium",
          points: CORRECT_PTS,
        })
        .select("id, question_text, answer_key, subject")
        .single();
      if (!error && data) newQ.id = data.id;
    }

    setMatchQuestions((prev) => (prev.length < MAX_Q ? [...prev, newQ] : prev));
    setAddText("");
    setAddAnswer("");
    setAddSubject("");
    setAddingQ(false);
  };

  // ── Remove question from match list (and optionally DB) ────────────────
  const removeQuestion = async (id: string, fromDb = false) => {
    setMatchQuestions((prev) => prev.filter((q) => q.id !== id));
    if (fromDb && isSupabaseConfigured && !id.startsWith("local-") && !id.startsWith("bz")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("sc_questions").delete().eq("id", id);
    }
  };

  // ── Buzzer handlers ────────────────────────────────────────────────────
  const buzz = (team: 0 | 1) => {
    if (buzzedTeam !== null || flashResult !== null) return;
    setBuzzedTeam(team);
    setShowAnswer(false);
  };

  const advanceQuestion = useCallback((newScores: [number, number]) => {
    clearFlash();
    const nextIdx = currentQIdx + 1;
    if (nextIdx >= matchQuestions.length) {
      setScores(newScores);
      setGameState("match-done");
    } else {
      setScores(newScores);
      setCurrentQIdx(nextIdx);
      setBuzzedTeam(null);
      setShowAnswer(false);
      setFlashResult(null);
    }
  }, [currentQIdx, matchQuestions.length, clearFlash]);

  const markResult = (result: "correct" | "wrong") => {
    if (buzzedTeam === null || !currentQ) return;
    const newScores: [number, number] = [...scores] as [number, number];
    const delta: [number, number] = [0, 0];
    if (result === "correct") {
      newScores[buzzedTeam] += CORRECT_PTS;
      delta[buzzedTeam] = CORRECT_PTS;
    } else {
      newScores[buzzedTeam] += WRONG_PTS;
      delta[buzzedTeam] = WRONG_PTS;
    }
    setFlashResult(result);
    setHistory((prev) => [...prev, {
      questionText: currentQ.question_text,
      answerKey: currentQ.answer_key,
      buzzedTeam,
      result,
      pointsDelta: delta,
    }]);
    flashTimer.current = setTimeout(() => advanceQuestion(newScores), 1600);
  };

  const skipQuestion = () => {
    if (!currentQ) return;
    setHistory((prev) => [...prev, {
      questionText: currentQ.question_text,
      answerKey: currentQ.answer_key,
      buzzedTeam: null,
      result: "skip",
      pointsDelta: [0, 0],
    }]);
    advanceQuestion([...scores] as [number, number]);
  };

  const resetMatch = () => {
    clearFlash();
    setGameState("setup");
    setTeamNames(["Team A", "Team B"]);
    setMatchQuestions([]);
    setScores([0, 0]);
    setCurrentQIdx(0);
    setBuzzedTeam(null);
    setShowAnswer(false);
    setFlashResult(null);
    setHistory([]);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "setup") {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#f5a623]/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Radio size={32} className="text-[#f5a623]" />
            </div>
            <h1 className="text-3xl font-black mb-1">Buzzer Round</h1>
            <p className="text-white/50 text-sm">Two teams race to buzz in first. Up to {MAX_Q} questions.</p>
          </div>

          {/* Rules */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏆", label: "First to buzz", sub: "gets to answer" },
              { icon: "✅", label: "Correct answer", sub: `+${CORRECT_PTS} points` },
              { icon: "❌", label: "Wrong / no answer", sub: `${WRONG_PTS} points` },
              { icon: "❓", label: "Up to", sub: `${MAX_Q} questions` },
            ].map((r) => (
              <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{r.label}</div>
                  <div className="text-white/40 text-xs">{r.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Team names */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
              <Users size={14} /> Enter Team Names
            </div>
            {([0, 1] as const).map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={clsx(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0",
                  i === 0 ? "bg-blue-500/20 text-blue-400" : "bg-[#f5a623]/20 text-[#f5a623]"
                )}>
                  {i + 1}
                </div>
                <input
                  value={teamNames[i]}
                  onChange={(e) => setTeamNames((prev) => {
                    const next = [...prev]; next[i] = e.target.value; return next;
                  })}
                  placeholder={`Team ${i + 1} name…`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40 font-medium"
                />
              </div>
            ))}
          </div>

          <button
            disabled={!teamNames[0].trim() || !teamNames[1].trim()}
            onClick={() => { fetchQuestions(); setGameState("question-setup"); }}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0a1628] font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all"
          >
            Next: Set Up Questions <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: QUESTION SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "question-setup") {
    const canStart = matchQuestions.length > 0;
    return (
      <div className="p-6 text-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGameState("setup")}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm px-3 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <div>
              <h1 className="text-xl font-black">Buzzer Questions</h1>
              <p className="text-white/40 text-xs mt-0.5">
                {teamNames[0]} <span className="text-white/20">vs</span> {teamNames[1]} ·{" "}
                {matchQuestions.length}/{MAX_Q} questions
              </p>
            </div>
          </div>
          <button
            disabled={!canStart}
            onClick={() => { setScores([0, 0]); setCurrentQIdx(0); setBuzzedTeam(null); setShowAnswer(false); setFlashResult(null); setHistory([]); setGameState("playing"); }}
            className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a1628] font-black px-6 py-2.5 rounded-xl transition-all"
          >
            <Play size={16} /> Start Match
          </button>
        </div>

        {/* Demo/error banner */}
        {isDemo && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Demo mode — questions won&apos;t persist. Configure Supabase to save questions.
          </div>
        )}
        {qError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={15} /> {qError}
          </div>
        )}

        {/* Add question form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-4">
            <Plus size={13} /> Add New Question
          </div>
          <div className="space-y-3">
            <textarea
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              placeholder="Question text…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40 text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={addAnswer}
                onChange={(e) => setAddAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && addText.trim() && addAnswer.trim()) addQuestion(); }}
                placeholder="Correct answer…"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40 text-sm"
              />
              <input
                value={addSubject}
                onChange={(e) => setAddSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40 text-sm"
              />
            </div>
            <button
              onClick={addQuestion}
              disabled={!addText.trim() || !addAnswer.trim() || addingQ || matchQuestions.length >= MAX_Q}
              className="flex items-center gap-2 bg-[#f5a623]/20 hover:bg-[#f5a623]/30 disabled:opacity-30 disabled:cursor-not-allowed border border-[#f5a623]/30 text-[#f5a623] font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              {addingQ ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {matchQuestions.length >= MAX_Q ? `Max ${MAX_Q} questions reached` : "Add Question"}
            </button>
          </div>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-auto">
          {loadingQ ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
              <Loader2 size={32} className="animate-spin" />
              <span>Loading questions…</span>
            </div>
          ) : matchQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <BookOpen size={40} className="text-white/10" />
              <div className="text-white/30 font-medium">No questions yet</div>
              <div className="text-white/20 text-sm">Add questions above to get started</div>
            </div>
          ) : (
            <div className="space-y-2">
              {matchQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#f5a623]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#f5a623] font-black text-xs">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm leading-relaxed">{q.question_text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-white/30 text-xs">{q.subject}</span>
                      <span className="text-white/10">·</span>
                      <span className="text-green-400/70 text-xs font-medium">Answer: {q.answer_key}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id, true)}
                    className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    title="Remove question"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {matchQuestions.length > 0 && (
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => { setScores([0, 0]); setCurrentQIdx(0); setBuzzedTeam(null); setShowAnswer(false); setFlashResult(null); setHistory([]); setGameState("playing"); }}
              className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Play size={20} />
              Start Match — {matchQuestions.length} question{matchQuestions.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: MATCH DONE
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "match-done") {
    const winner = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : null;
    return (
      <div className="p-8 text-white">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <Medal size={48} className="text-[#f5a623] mx-auto mb-3" />
            <h1 className="text-3xl font-black">Match Complete!</h1>
            {winner !== null ? (
              <p className="text-white/60 mt-1">
                <span className="text-[#f5a623] font-black">{teamNames[winner]}</span> wins!
              </p>
            ) : (
              <p className="text-white/60 mt-1">It&apos;s a tie!</p>
            )}
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-4">
            {([0, 1] as const).map((i) => (
              <div key={i} className={clsx(
                "rounded-2xl p-6 text-center border transition-all",
                winner === i
                  ? "bg-[#f5a623]/15 border-[#f5a623]/40"
                  : "bg-white/5 border-white/10"
              )}>
                {winner === i && <div className="text-2xl mb-1">🏆</div>}
                <div className={clsx("text-4xl font-black mb-1", winner === i ? "text-[#f5a623]" : "text-white")}>
                  {scores[i]}
                </div>
                <div className="text-white/40 text-xs mb-2">points</div>
                <div className="font-bold text-white text-sm">{teamNames[i]}</div>
              </div>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Question History</div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-white/20 font-black text-xs w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/70 truncate">{h.questionText}</div>
                      <div className="text-white/30 text-xs">Ans: {h.answerKey}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {h.result === "skip" ? (
                        <span className="text-white/30 text-xs">Skipped</span>
                      ) : (
                        <div>
                          <span className={clsx(
                            "text-xs font-bold",
                            h.result === "correct" ? "text-green-400" : "text-red-400"
                          )}>
                            {h.buzzedTeam !== null ? teamNames[h.buzzedTeam] : "—"}
                          </span>
                          <div className={clsx(
                            "text-xs",
                            h.result === "correct" ? "text-green-400" : "text-red-400"
                          )}>
                            {h.result === "correct" ? `+${CORRECT_PTS}` : `${WRONG_PTS}`} pts
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetMatch}
              className="flex-1 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> New Match
            </button>
            <button
              onClick={() => { setScores([0, 0]); setCurrentQIdx(0); setBuzzedTeam(null); setShowAnswer(false); setFlashResult(null); setHistory([]); setGameState("playing"); }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl text-sm"
            >
              Same Questions Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: PLAYING
  // ──────────────────────────────────────────────────────────────────────────
  const totalQ = matchQuestions.length;

  return (
    <div className="p-4 text-white min-h-screen flex flex-col select-none">

      {/* ── Scoreboard ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Team 1 */}
        <div className={clsx(
          "rounded-2xl p-4 border transition-all duration-300",
          flashResult && buzzedTeam === 0 && flashResult === "correct" ? "bg-green-500/20 border-green-500/50" :
          flashResult && buzzedTeam === 0 && flashResult === "wrong"   ? "bg-red-500/20 border-red-500/50" :
          buzzedTeam === 0 ? "bg-blue-500/20 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]" :
          buzzedTeam === 1 ? "bg-white/3 border-white/5 opacity-50" :
          "bg-white/5 border-white/10"
        )}>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wide truncate">{teamNames[0]}</div>
          <div className={clsx(
            "text-4xl font-black mt-1 transition-colors",
            buzzedTeam === 0 ? "text-blue-400" : "text-white"
          )}>
            {scores[0]}
          </div>
          <div className="text-white/30 text-xs">points</div>
          {buzzedTeam === 0 && !flashResult && (
            <div className="mt-2 text-blue-400 text-xs font-bold animate-pulse">● BUZZED IN</div>
          )}
          {flashResult && buzzedTeam === 0 && (
            <div className={clsx("mt-2 text-xs font-black", flashResult === "correct" ? "text-green-400" : "text-red-400")}>
              {flashResult === "correct" ? `+${CORRECT_PTS} pts ✓` : `${WRONG_PTS} pts ✗`}
            </div>
          )}
        </div>

        {/* Center: question tracker */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Question</div>
          <div className="text-3xl font-black text-[#f5a623]">{currentQIdx + 1}</div>
          <div className="text-white/30 text-xs">of {totalQ}</div>
          <div className="flex gap-1 mt-2">
            {matchQuestions.map((_, i) => (
              <div key={i} className={clsx(
                "h-1.5 flex-1 rounded-full transition-all",
                i < currentQIdx ? "bg-[#f5a623]" : i === currentQIdx ? "bg-white/60" : "bg-white/10"
              )} />
            ))}
          </div>
        </div>

        {/* Team 2 */}
        <div className={clsx(
          "rounded-2xl p-4 border transition-all duration-300",
          flashResult && buzzedTeam === 1 && flashResult === "correct" ? "bg-green-500/20 border-green-500/50" :
          flashResult && buzzedTeam === 1 && flashResult === "wrong"   ? "bg-red-500/20 border-red-500/50" :
          buzzedTeam === 1 ? "bg-[#f5a623]/15 border-[#f5a623]/50 shadow-[0_0_20px_rgba(245,166,35,0.25)]" :
          buzzedTeam === 0 ? "bg-white/3 border-white/5 opacity-50" :
          "bg-white/5 border-white/10"
        )}>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wide truncate">{teamNames[1]}</div>
          <div className={clsx(
            "text-4xl font-black mt-1 transition-colors",
            buzzedTeam === 1 ? "text-[#f5a623]" : "text-white"
          )}>
            {scores[1]}
          </div>
          <div className="text-white/30 text-xs">points</div>
          {buzzedTeam === 1 && !flashResult && (
            <div className="mt-2 text-[#f5a623] text-xs font-bold animate-pulse">● BUZZED IN</div>
          )}
          {flashResult && buzzedTeam === 1 && (
            <div className={clsx("mt-2 text-xs font-black", flashResult === "correct" ? "text-green-400" : "text-red-400")}>
              {flashResult === "correct" ? `+${CORRECT_PTS} pts ✓` : `${WRONG_PTS} pts ✗`}
            </div>
          )}
        </div>
      </div>

      {/* ── Question Card ─────────────────────────────────────────────────── */}
      <div className={clsx(
        "flex-1 flex flex-col items-center justify-center rounded-3xl border p-8 mb-4 transition-all duration-300",
        flashResult === "correct" ? "border-green-500/50 bg-green-500/10" :
        flashResult === "wrong"   ? "border-red-500/50 bg-red-500/10" :
        buzzedTeam !== null       ? "border-[#f5a623]/40 bg-[#f5a623]/5" :
        "border-white/10 bg-white/3"
      )}>
        {currentQ && (
          <>
            {/* Subject badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#f5a623]/20 text-[#f5a623] text-xs font-bold px-3 py-1 rounded-full">
                {currentQ.subject}
              </span>
              {buzzedTeam !== null && !flashResult && (
                <span className={clsx(
                  "text-xs font-bold px-3 py-1 rounded-full",
                  buzzedTeam === 0 ? "bg-blue-500/20 text-blue-400" : "bg-[#f5a623]/20 text-[#f5a623]"
                )}>
                  {teamNames[buzzedTeam]} buzzed in!
                </span>
              )}
            </div>

            {/* Question text */}
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center max-w-2xl">
              {currentQ.question_text}
            </p>

            {/* Answer reveal (only when buzzed in) */}
            {buzzedTeam !== null && (
              <div className="mt-6 w-full max-w-md">
                {showAnswer ? (
                  <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center">
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Correct Answer</div>
                    <div className="text-[#f5a623] font-black text-xl">{currentQ.answer_key}</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white font-medium py-3 rounded-2xl text-sm transition-all"
                  >
                    <Eye size={16} /> Reveal Answer (admin only)
                  </button>
                )}
              </div>
            )}

            {/* Result flash */}
            {flashResult && (
              <div className={clsx(
                "mt-6 text-2xl font-black",
                flashResult === "correct" ? "text-green-400" : "text-red-400"
              )}>
                {flashResult === "correct"
                  ? `✓ Correct! ${teamNames[buzzedTeam!]} +${CORRECT_PTS} pts`
                  : `✗ Wrong! ${teamNames[buzzedTeam!]} ${WRONG_PTS} pts`}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      {!flashResult && (
        <>
          {buzzedTeam === null ? (
            /* Buzz buttons — waiting state */
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => buzz(0)}
                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black py-8 rounded-3xl text-xl transition-all duration-150 shadow-lg shadow-blue-900/40"
              >
                <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 transition-colors" />
                <div className="flex flex-col items-center gap-1">
                  <Radio size={28} className="opacity-80" />
                  <span>{teamNames[0]}</span>
                  <span className="text-xs font-normal opacity-60">Tap to Buzz</span>
                </div>
              </button>
              <button
                onClick={() => buzz(1)}
                className="group relative overflow-hidden bg-[#f5a623] hover:bg-[#fbbf24] active:scale-95 text-[#0a1628] font-black py-8 rounded-3xl text-xl transition-all duration-150 shadow-lg shadow-yellow-900/30"
              >
                <div className="absolute inset-0 bg-black/0 group-active:bg-black/10 transition-colors" />
                <div className="flex flex-col items-center gap-1">
                  <Radio size={28} className="opacity-80" />
                  <span>{teamNames[1]}</span>
                  <span className="text-xs font-normal opacity-60">Tap to Buzz</span>
                </div>
              </button>

              {/* Skip */}
              <button
                onClick={skipQuestion}
                className="col-span-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 font-medium py-3 rounded-2xl text-sm transition-all"
              >
                <SkipForward size={15} /> Skip this question
              </button>
            </div>
          ) : (
            /* Correct / Wrong buttons — after buzz-in */
            <div className="space-y-3">
              <div className="text-center text-white/40 text-sm">
                Mark <span className="text-white font-bold">{teamNames[buzzedTeam]}</span>&apos;s answer:
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => markResult("correct")}
                  className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 active:scale-95 text-white font-black py-6 rounded-2xl text-lg transition-all"
                >
                  <CheckCircle size={24} /> Correct
                  <span className="text-green-200 text-sm font-normal">+{CORRECT_PTS}</span>
                </button>
                <button
                  onClick={() => markResult("wrong")}
                  className="flex items-center justify-center gap-3 bg-red-500 hover:bg-red-400 active:scale-95 text-white font-black py-6 rounded-2xl text-lg transition-all"
                >
                  <XCircle size={24} /> Wrong
                  <span className="text-red-200 text-sm font-normal">{WRONG_PTS}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
