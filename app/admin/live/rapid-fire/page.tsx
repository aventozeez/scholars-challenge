"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import {
  Play, Pause, RotateCcw, CheckCircle, XCircle, SkipForward,
  ChevronRight, Trophy, Plus, Trash2, Users, ArrowRight, Medal,
  Search, Filter, X, AlertTriangle, Loader2, BookOpen,
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
  round_type?: string;
};

type AttemptResult = "correct" | "wrong" | "pass" | "timeout";

type Attempt = {
  questionId: string;
  questionText: string;
  result: AttemptResult;
};

type TeamResult = {
  teamName: string;
  score: number;
  correct: number;
  wrong: number;
  passed: number;
  attempts: Attempt[];
  timeUsed: number;
};

type GameState =
  | "session-setup"
  | "question-select"
  | "round-setup"
  | "playing"
  | "paused"
  | "round-done"
  | "session-done";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUND_TIME = 60;
const REQUIRED_QUESTIONS = 10;

const FALLBACK_QUESTIONS: Question[] = [
  { id: "f1",  question_text: "What is the chemical symbol for Gold?",          answer_key: "Au",                     subject: "Chemistry",   category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f2",  question_text: "What is the capital of Ghana?",                   answer_key: "Accra",                  subject: "Geography",   category: "general",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f3",  question_text: "Who wrote 'Things Fall Apart'?",                  answer_key: "Chinua Achebe",          subject: "Literature",  category: "arts",       difficulty: "medium", round_type: "rapid_fire" },
  { id: "f4",  question_text: "What is the powerhouse of the cell?",             answer_key: "Mitochondria",           subject: "Biology",     category: "science",    difficulty: "medium", round_type: "rapid_fire" },
  { id: "f5",  question_text: "What does GDP stand for?",                        answer_key: "Gross Domestic Product", subject: "Economics",   category: "commercial", difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f6",  question_text: "What is the square root of 144?",                 answer_key: "12",                     subject: "Mathematics", category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f7",  question_text: "Name the longest river in Africa.",               answer_key: "Nile",                   subject: "Geography",   category: "general",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f8",  question_text: "What element has the symbol 'Fe'?",               answer_key: "Iron",                   subject: "Chemistry",   category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f9",  question_text: "In what year did Nigeria gain independence?",     answer_key: "1960",                   subject: "History",     category: "general",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f10", question_text: "What is the approximate speed of light?",         answer_key: "300,000 km/s",           subject: "Physics",     category: "science",    difficulty: "medium", round_type: "rapid_fire" },
  { id: "f11", question_text: "What gas do plants absorb during photosynthesis?",answer_key: "Carbon Dioxide (CO₂)",  subject: "Biology",     category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f12", question_text: "Who was the first President of Nigeria?",         answer_key: "Nnamdi Azikiwe",         subject: "History",     category: "general",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f13", question_text: "What is the chemical formula for water?",         answer_key: "H₂O",                   subject: "Chemistry",   category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f14", question_text: "How many sides does a hexagon have?",             answer_key: "6",                      subject: "Mathematics", category: "science",    difficulty: "easy",   round_type: "rapid_fire" },
  { id: "f15", question_text: "What is the hardest natural substance on Earth?", answer_key: "Diamond",                subject: "Science",     category: "science",    difficulty: "medium", round_type: "rapid_fire" },
];

const RESULT_COLORS: Record<AttemptResult, string> = {
  correct: "bg-green-500",
  wrong:   "bg-red-500",
  pass:    "bg-yellow-500",
  timeout: "bg-slate-500",
};

const DIFF_COLORS: Record<string, string> = {
  easy:   "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard:   "bg-red-500/20 text-red-400",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard({ result, rank }: { result: TeamResult; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  return (
    <div className={clsx("rounded-2xl p-5 border", rank === 1 ? "bg-[#f5a623]/10 border-[#f5a623]/40" : "bg-white/5 border-white/10")}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{medal}</span>
          <div>
            <div className="font-black text-white">{result.teamName}</div>
            <div className="text-white/40 text-xs">{result.timeUsed}s of 60s used</div>
          </div>
        </div>
        <div className="text-right">
          <div className={clsx("text-3xl font-black", rank === 1 ? "text-[#f5a623]" : "text-white")}>{result.score}</div>
          <div className="text-white/40 text-xs">points</div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 bg-green-500/20 rounded-xl p-2 text-center"><div className="text-green-400 font-black">{result.correct}</div><div className="text-white/40 text-xs">Correct</div></div>
        <div className="flex-1 bg-red-500/20 rounded-xl p-2 text-center"><div className="text-red-400 font-black">{result.wrong}</div><div className="text-white/40 text-xs">Wrong</div></div>
        <div className="flex-1 bg-yellow-500/20 rounded-xl p-2 text-center"><div className="text-yellow-400 font-black">{result.passed}</div><div className="text-white/40 text-xs">Passed</div></div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RapidFirePage() {
  // Session state
  const [teams, setTeams] = useState<string[]>(["Team Alpha", "Team Beta"]);
  const [newTeam, setNewTeam] = useState("");
  const [sessionResults, setSessionResults] = useState<TeamResult[]>([]);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);

  // Question bank + selection
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);  // the 10 chosen
  const [qSearch, setQSearch] = useState("");
  const [qFilterCat, setQFilterCat] = useState("");
  const [qFilterDiff, setQFilterDiff] = useState("");

  // Round state
  const [gameState, setGameState] = useState<GameState>("session-setup");
  const [primaryQueue, setPrimaryQueue] = useState<Question[]>([]);
  const [recycleQueue, setRecycleQueue] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Fetch question bank ────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    if (!isSupabaseConfigured) {
      setAllQuestions(FALLBACK_QUESTIONS);
      setLoadingQ(false);
      return;
    }
    const { data, error } = await supabase
      .from("sc_questions")
      .select("id, question_text, answer_key, subject, category, difficulty, round_type")
      .order("subject");
    if (error || !data?.length) {
      setAllQuestions(FALLBACK_QUESTIONS);
    } else {
      setAllQuestions(data);
    }
    setLoadingQ(false);
  }, []);

  // ── Toggle question selection ──────────────────────────────────────────────
  const toggleQuestion = (q: Question) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else if (next.size < REQUIRED_QUESTIONS) {
        next.add(q.id);
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const canStart = selectedCount === REQUIRED_QUESTIONS;

  // Filtered list for the picker
  const filteredQ = allQuestions.filter((q) => {
    const term = qSearch.toLowerCase();
    return (
      (!term || q.question_text.toLowerCase().includes(term) || q.subject.toLowerCase().includes(term)) &&
      (!qFilterCat  || q.category  === qFilterCat)  &&
      (!qFilterDiff || q.difficulty === qFilterDiff)
    );
  });

  // ── Round logic ────────────────────────────────────────────────────────────
  const loadNextQuestion = useCallback((primary: Question[], recycle: Question[]) => {
    setShowAnswer(false);
    setLastResult(null);
    let nextPrimary = [...primary];
    let nextRecycle = [...recycle];
    if (nextPrimary.length === 0) {
      if (nextRecycle.length === 0) { setGameState("round-done"); return; }
      nextPrimary = shuffle(nextRecycle);
      nextRecycle = [];
    }
    const next = nextPrimary.shift()!;
    setPrimaryQueue(nextPrimary);
    setRecycleQueue(nextRecycle);
    setCurrentQuestion(next);
    setQuestionNum((n) => n + 1);
  }, []);

  const handleResult = useCallback((result: AttemptResult) => {
    if (!currentQuestion || gameState !== "playing") return;
    setLastResult(result);
    setShowAnswer(true);
    const attempt: Attempt = { questionId: currentQuestion.id, questionText: currentQuestion.question_text, result };
    setAttempts((prev) => [...prev, attempt]);
    if (result === "correct") setScore((s) => s + 10);

    setTimeout(() => {
      const nextPrimary = [...primaryQueue];
      const nextRecycle = [...recycleQueue];
      if (result !== "correct") nextRecycle.push(currentQuestion);
      if (nextPrimary.length === 0 && nextRecycle.length === 0) { setGameState("round-done"); return; }
      loadNextQuestion(nextPrimary, nextRecycle);
    }, 1200);
  }, [currentQuestion, gameState, primaryQueue, recycleQueue, loadNextQuestion]);

  // 60-second round timer
  useEffect(() => {
    if (gameState === "playing" && !showAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { stopTimer(); handleResult("timeout"); setGameState("round-done"); return 0; }
          return t - 1;
        });
      }, 1000);
    } else { stopTimer(); }
    return () => stopTimer();
  }, [gameState, showAnswer, handleResult, stopTimer]);

  const startRound = () => {
    const pool = [...roundQuestions]; // already chosen 10, keep order
    setScore(0);
    setQuestionNum(0);
    setAttempts([]);
    setPrimaryQueue(pool.slice(1));
    setRecycleQueue([]);
    setCurrentQuestion(pool[0]);
    setTimeLeft(ROUND_TIME);
    setShowAnswer(false);
    setLastResult(null);
    setRoundStartTime(Date.now());
    setGameState("playing");
  };

  const finishRound = useCallback(() => {
    const timeUsed = Math.min(Math.round((Date.now() - roundStartTime) / 1000), ROUND_TIME);
    setSessionResults((prev) => [...prev, {
      teamName: teams[currentTeamIdx],
      score, correct: attempts.filter((a) => a.result === "correct").length,
      wrong: attempts.filter((a) => a.result === "wrong").length,
      passed: attempts.filter((a) => a.result === "pass" || a.result === "timeout").length,
      attempts, timeUsed,
    }]);
  }, [teams, currentTeamIdx, score, attempts, roundStartTime]);

  useEffect(() => { if (gameState === "round-done") { stopTimer(); finishRound(); } }, [gameState, stopTimer, finishRound]);

  const nextTeam = () => {
    const nextIdx = currentTeamIdx + 1;
    if (nextIdx >= teams.length) { setGameState("session-done"); }
    else { setCurrentTeamIdx(nextIdx); setGameState("round-setup"); }
  };

  const resetSession = () => {
    setSessionResults([]); setCurrentTeamIdx(0);
    setSelectedIds(new Set()); setRoundQuestions([]);
    setGameState("session-setup");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: SESSION SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "session-setup") {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-1">Rapid Fire — Session Setup</h1>
            <p className="text-white/50">Step 1 of 2 · Add all competing teams</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-2">
              <Users size={14} /> Teams in this session
            </div>
            {teams.map((team, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-6 h-6 bg-[#f5a623]/20 rounded-full flex items-center justify-center text-[#f5a623] font-black text-xs">{i + 1}</div>
                <span className="flex-1 font-medium">{team}</span>
                <button onClick={() => setTeams((t) => t.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <input
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newTeam.trim()) { setTeams((t) => [...t, newTeam.trim()]); setNewTeam(""); } }}
                placeholder="Add a team name…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40"
              />
              <button onClick={() => { if (newTeam.trim()) { setTeams((t) => [...t, newTeam.trim()]); setNewTeam(""); } }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white transition-colors">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[{ label: "Round Time", val: "60s" }, { label: "Questions", val: "10" }, { label: "Per Correct", val: "+10 pts" }].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[#f5a623] font-black text-lg">{s.val}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          <button
            disabled={teams.length === 0}
            onClick={() => { fetchQuestions(); setGameState("question-select"); }}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0a1628] font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all"
          >
            Next: Select Questions <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: QUESTION SELECTION
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "question-select") {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black">Select Round Questions</h1>
            <p className="text-white/50 text-sm mt-0.5">Step 2 of 2 · Choose exactly {REQUIRED_QUESTIONS} questions for this session</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setGameState("session-setup")} className="text-white/40 hover:text-white text-sm px-3 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors">
              ← Back
            </button>
            <button
              disabled={!canStart}
              onClick={() => {
                const chosen = allQuestions.filter((q) => selectedIds.has(q.id));
                setRoundQuestions(chosen);
                setCurrentTeamIdx(0);
                setSessionResults([]);
                setGameState("round-setup");
              }}
              className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a1628] font-black px-5 py-2.5 rounded-xl transition-all"
            >
              <Play size={16} /> Start Session
            </button>
          </div>
        </div>

        {/* Selection counter */}
        <div className={clsx(
          "flex items-center justify-between rounded-2xl px-5 py-3 mb-5 border transition-colors",
          canStart
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-white/5 border-white/10 text-white/60"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx("text-3xl font-black", canStart ? "text-green-400" : "text-[#f5a623]")}>
              {selectedCount}
            </div>
            <div className="text-sm">
              of {REQUIRED_QUESTIONS} questions selected
              {!canStart && <span className="text-white/30 ml-2">· Need {REQUIRED_QUESTIONS - selectedCount} more</span>}
              {canStart && <span className="ml-2 font-bold">✓ Ready to start!</span>}
            </div>
          </div>
          {selectedCount > 0 && (
            <button onClick={() => setSelectedIds(new Set())} className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Clear all
            </button>
          )}
        </div>

        {/* Selected questions pills */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/3 border border-white/5 rounded-xl">
            {allQuestions.filter((q) => selectedIds.has(q.id)).map((q, i) => (
              <div key={q.id} className="flex items-center gap-1.5 bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] rounded-full px-3 py-1 text-xs font-medium">
                <span className="text-[#f5a623]/60 font-black">{i + 1}.</span>
                <span className="max-w-[200px] truncate">{q.question_text}</span>
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
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
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
              {filteredQ.map((q, i) => {
                const isSelected = selectedIds.has(q.id);
                const isDisabled = !isSelected && selectedCount >= REQUIRED_QUESTIONS;
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
                    {/* Checkbox */}
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={clsx("font-medium text-sm leading-relaxed", isSelected ? "text-white" : "text-white/80")}>
                          {q.question_text}
                        </p>
                        {isSelected && (
                          <span className="text-[#f5a623] text-xs font-black flex-shrink-0">
                            #{Array.from(selectedIds).indexOf(q.id) + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
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

        {/* Sticky bottom CTA */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <button
            disabled={!canStart}
            onClick={() => {
              const chosen = allQuestions.filter((q) => selectedIds.has(q.id));
              setRoundQuestions(chosen);
              setCurrentTeamIdx(0);
              setSessionResults([]);
              setGameState("round-setup");
            }}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Play size={20} />
            {canStart ? `Start Session with ${teams.length} team${teams.length !== 1 ? "s" : ""}` : `Select ${REQUIRED_QUESTIONS - selectedCount} more question${REQUIRED_QUESTIONS - selectedCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: ROUND SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "round-setup") {
    const teamsPlayed = sessionResults.length;
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center gap-2 mb-2">
            {teams.map((_, i) => (
              <div key={i} className={clsx("h-1.5 rounded-full flex-1 max-w-16 transition-all",
                i < teamsPlayed ? "bg-[#f5a623]" : i === currentTeamIdx ? "bg-white/60" : "bg-white/10")} />
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Now Up</div>
            <div className="text-4xl font-black text-[#f5a623] mb-1">{teams[currentTeamIdx]}</div>
            <div className="text-white/40 text-sm mb-4">Team {currentTeamIdx + 1} of {teams.length}</div>

            {/* Show the selected questions as a preview */}
            <div className="bg-white/5 rounded-xl p-3 mb-5 text-left space-y-1 max-h-36 overflow-y-auto">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={11} /> {roundQuestions.length} questions for this round
              </div>
              {roundQuestions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="text-[#f5a623]/60 font-black flex-shrink-0">{i + 1}.</span>
                  <span className="truncate">{q.question_text}</span>
                </div>
              ))}
            </div>

            {sessionResults.length > 0 && (
              <div className="mb-4 text-left space-y-2">
                <div className="text-white/30 text-xs uppercase tracking-wider">Previous scores</div>
                {sessionResults.map((r) => (
                  <div key={r.teamName} className="flex justify-between text-sm text-white/60">
                    <span>{r.teamName}</span>
                    <span className="text-[#f5a623] font-bold">{r.score} pts</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-white/50">
              <div className="bg-white/5 rounded-xl p-3"><div className="text-white font-bold text-lg">60s</div><div>Total time</div></div>
              <div className="bg-white/5 rounded-xl p-3"><div className="text-white font-bold text-lg">{roundQuestions.length}</div><div>Questions</div></div>
            </div>

            <button onClick={startRound} className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
              <Play size={20} /> Start Round
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: ROUND DONE
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "round-done") {
    const thisResult = sessionResults[sessionResults.length - 1];
    const isLastTeam = currentTeamIdx >= teams.length - 1;
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full space-y-5">
          <div className="text-center">
            <Trophy size={48} className="text-[#f5a623] mx-auto mb-3" />
            <h2 className="text-3xl font-black">Round Complete!</h2>
            <p className="text-white/50">{thisResult?.teamName}</p>
          </div>
          <div className="bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-2xl p-6 text-center">
            <div className="text-6xl font-black text-[#f5a623]">{thisResult?.score ?? 0}</div>
            <div className="text-white/50 text-sm mt-1">points scored</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"><div className="text-green-400 font-black text-xl">{thisResult?.correct ?? 0}</div><div className="text-white/40 text-xs">Correct</div></div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"><div className="text-red-400 font-black text-xl">{thisResult?.wrong ?? 0}</div><div className="text-white/40 text-xs">Wrong</div></div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center"><div className="text-yellow-400 font-black text-xl">{thisResult?.passed ?? 0}</div><div className="text-white/40 text-xs">Passed</div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {thisResult?.attempts.map((a, i) => (
              <div key={i} title={a.questionText} className={clsx("w-7 h-7 rounded-full text-xs flex items-center justify-center text-white font-bold", RESULT_COLORS[a.result])}>
                {a.result === "correct" ? "✓" : a.result === "wrong" ? "✗" : "↺"}
              </div>
            ))}
          </div>
          {sessionResults.length > 1 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Session So Far</div>
              {sessionResults.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/70">{r.teamName}</span>
                  <span className="text-[#f5a623] font-bold">{r.score} pts</span>
                </div>
              ))}
            </div>
          )}
          {isLastTeam ? (
            <button onClick={() => setGameState("session-done")} className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
              <Trophy size={20} /> See Final Results
            </button>
          ) : (
            <button onClick={nextTeam} className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
              Next Team: {teams[currentTeamIdx + 1]} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: SESSION DONE
  // ──────────────────────────────────────────────────────────────────────────
  if (gameState === "session-done") {
    const sorted = [...sessionResults].sort((a, b) => b.score - a.score);
    return (
      <div className="p-8 text-white">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <Medal size={48} className="text-[#f5a623] mx-auto mb-3" />
            <h1 className="text-3xl font-black">Session Complete!</h1>
            <p className="text-white/50">Final standings · {roundQuestions.length} questions used</p>
          </div>
          <div className="space-y-3">
            {sorted.map((result, i) => <ScoreCard key={result.teamName} result={result} rank={i + 1} />)}
          </div>
          <div className="flex gap-3">
            <button onClick={resetSession} className="flex-1 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2">
              <RotateCcw size={18} /> New Session
            </button>
            <button
              onClick={() => { setSessionResults([]); setCurrentTeamIdx(0); setGameState("round-setup"); }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl"
            >
              Same Questions, New Teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN: PLAYING
  // ──────────────────────────────────────────────────────────────────────────
  const timerPercent = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft > 30 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#ef4444";

  return (
    <div className="p-6 text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div><div className="text-xs text-white/40 uppercase tracking-widest">Team</div><div className="font-black text-lg text-[#f5a623]">{teams[currentTeamIdx]}</div></div>
        <div className="text-center"><div className="text-xs text-white/40 uppercase tracking-widest">Questions</div><div className="font-black">Q{questionNum} · {attempts.filter((a) => a.result === "correct").length} correct</div></div>
        <div className="text-center"><div className="text-xs text-white/40 uppercase tracking-widest">Recycle</div><div className={clsx("font-black", recycleQueue.length > 0 ? "text-[#f5a623]" : "text-white/20")}>{recycleQueue.length > 0 ? `↺ ${recycleQueue.length}` : "—"}</div></div>
        <div className="text-right"><div className="text-xs text-white/40 uppercase tracking-widest">Score</div><div className="font-black text-[#f5a623] text-xl">{score}</div></div>
      </div>

      {/* 60s timer bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/40">Round Timer</span>
          <span className={clsx("font-black text-base transition-colors", timeLeft <= 10 ? "animate-flash" : "")} style={{ color: timerColor }}>
            {timeLeft}s remaining
          </span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {currentQuestion && (
          <div className={clsx("w-full border rounded-3xl p-8 transition-all duration-300",
            showAnswer && lastResult === "correct" ? "border-green-500/50 bg-green-500/10" :
            showAnswer && lastResult === "wrong"   ? "border-red-500/50 bg-red-500/10" :
            showAnswer ? "border-yellow-500/50 bg-yellow-500/10" : "border-white/20 bg-white/5"
          )}>
            <div className="flex items-center justify-between mb-6">
              <span className="bg-[#f5a623]/20 text-[#f5a623] text-xs font-bold px-3 py-1 rounded-full">
                {currentQuestion.subject} · {currentQuestion.category}
              </span>
              {recycleQueue.some((q) => q.id === currentQuestion.id) && (
                <span className="bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">↺ Reattempt</span>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center mb-8">
              {currentQuestion.question_text}
            </p>
            {showAnswer && (
              <div className={clsx("text-center text-xl font-black rounded-2xl py-4 mb-2",
                lastResult === "correct" ? "text-green-400" : lastResult === "wrong" ? "text-red-400" : "text-yellow-400"
              )}>
                {lastResult === "correct" && "✓ Correct! +10 pts"}
                {lastResult === "wrong"   && `✗ Wrong — Answer: ${currentQuestion.answer_key}`}
                {lastResult === "pass"    && `⟳ Passed — Answer: ${currentQuestion.answer_key}`}
                {lastResult === "timeout" && `⏱ Time Out — Answer: ${currentQuestion.answer_key}`}
              </div>
            )}
          </div>
        )}

        {/* Control buttons */}
        {!showAnswer && gameState === "playing" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-5">
            <button onClick={() => handleResult("correct")} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black py-5 rounded-2xl transition-all active:scale-95 text-lg">
              <CheckCircle size={22} /> Correct
            </button>
            <button onClick={() => handleResult("wrong")} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-black py-5 rounded-2xl transition-all active:scale-95">
              <XCircle size={20} /> Wrong
            </button>
            <button onClick={() => handleResult("pass")} className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-black py-5 rounded-2xl transition-all active:scale-95">
              <SkipForward size={20} /> Pass
            </button>
            <button onClick={() => { stopTimer(); setGameState("paused"); }} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-5 rounded-2xl transition-all">
              <Pause size={18} /> Pause
            </button>
          </div>
        )}

        {gameState === "paused" && (
          <div className="w-full mt-5 space-y-3">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-white/60 font-bold">⏸ Round Paused — {timeLeft}s remaining</div>
            <button onClick={() => setGameState("playing")} className="w-full bg-[#f5a623] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2">
              <ChevronRight size={20} /> Resume
            </button>
          </div>
        )}
      </div>

      {/* Attempt history */}
      <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 flex-wrap">
        {attempts.map((a, i) => (
          <div key={i} title={a.questionText} className={clsx("w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold", RESULT_COLORS[a.result])}>
            {a.result === "correct" ? "✓" : a.result === "wrong" ? "✗" : "↺"}
          </div>
        ))}
      </div>
    </div>
  );
}
