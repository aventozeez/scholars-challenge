"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play, Pause, RotateCcw, CheckCircle, XCircle, SkipForward,
  ChevronRight, Trophy, Plus, Trash2, Users, ArrowRight, Medal,
} from "lucide-react";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  id: string;
  question_text: string;
  answer_key: string;
  subject: string;
  category: string;
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
  timeUsed: number; // seconds used out of 60
};

type GameState = "session-setup" | "round-setup" | "playing" | "paused" | "round-done" | "session-done";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUND_TIME = 60; // 60 seconds for all 10 questions

const SAMPLE_QUESTIONS: Question[] = [
  { id: "1",  question_text: "What is the chemical symbol for Gold?",          answer_key: "Au",                    subject: "Chemistry",   category: "Science"    },
  { id: "2",  question_text: "What is the capital of Ghana?",                   answer_key: "Accra",                 subject: "Geography",   category: "General"    },
  { id: "3",  question_text: "Who wrote 'Things Fall Apart'?",                  answer_key: "Chinua Achebe",         subject: "Literature",  category: "Arts"       },
  { id: "4",  question_text: "What is the powerhouse of the cell?",             answer_key: "Mitochondria",          subject: "Biology",     category: "Science"    },
  { id: "5",  question_text: "What does GDP stand for?",                        answer_key: "Gross Domestic Product",subject: "Economics",   category: "Commercial" },
  { id: "6",  question_text: "What is the square root of 144?",                 answer_key: "12",                    subject: "Mathematics", category: "Science"    },
  { id: "7",  question_text: "Name the longest river in Africa.",               answer_key: "Nile",                  subject: "Geography",   category: "General"    },
  { id: "8",  question_text: "What element has the symbol 'Fe'?",               answer_key: "Iron",                  subject: "Chemistry",   category: "Science"    },
  { id: "9",  question_text: "In what year did Nigeria gain independence?",     answer_key: "1960",                  subject: "History",     category: "General"    },
  { id: "10", question_text: "What is the approximate speed of light?",         answer_key: "300,000 km/s",          subject: "Physics",     category: "Science"    },
  { id: "11", question_text: "What gas do plants absorb during photosynthesis?",answer_key: "Carbon Dioxide (CO₂)", subject: "Biology",     category: "Science"    },
  { id: "12", question_text: "Who was the first President of Nigeria?",         answer_key: "Nnamdi Azikiwe",        subject: "History",     category: "General"    },
  { id: "13", question_text: "What is the chemical formula for water?",         answer_key: "H₂O",                  subject: "Chemistry",   category: "Science"    },
  { id: "14", question_text: "How many sides does a hexagon have?",             answer_key: "6",                     subject: "Mathematics", category: "Science"    },
  { id: "15", question_text: "What is the hardest natural substance on Earth?", answer_key: "Diamond",               subject: "Science",     category: "Science"    },
];

const RESULT_COLORS: Record<AttemptResult, string> = {
  correct: "bg-green-500",
  wrong:   "bg-red-500",
  pass:    "bg-yellow-500",
  timeout: "bg-slate-500",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard({ result, rank }: { result: TeamResult; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  return (
    <div className={clsx(
      "rounded-2xl p-5 border",
      rank === 1
        ? "bg-[#f5a623]/10 border-[#f5a623]/40"
        : "bg-white/5 border-white/10"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{medal}</span>
          <div>
            <div className="font-black text-white">{result.teamName}</div>
            <div className="text-white/40 text-xs">{result.timeUsed}s used of 60s</div>
          </div>
        </div>
        <div className="text-right">
          <div className={clsx("text-3xl font-black", rank === 1 ? "text-[#f5a623]" : "text-white")}>
            {result.score}
          </div>
          <div className="text-white/40 text-xs">points</div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 bg-green-500/20 rounded-xl p-2 text-center">
          <div className="text-green-400 font-black">{result.correct}</div>
          <div className="text-white/40 text-xs">Correct</div>
        </div>
        <div className="flex-1 bg-red-500/20 rounded-xl p-2 text-center">
          <div className="text-red-400 font-black">{result.wrong}</div>
          <div className="text-white/40 text-xs">Wrong</div>
        </div>
        <div className="flex-1 bg-yellow-500/20 rounded-xl p-2 text-center">
          <div className="text-yellow-400 font-black">{result.passed}</div>
          <div className="text-white/40 text-xs">Passed</div>
        </div>
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

  // ── Load next question ───────────────────────────────────────────────────────
  const loadNextQuestion = useCallback((primary: Question[], recycle: Question[]) => {
    setShowAnswer(false);
    setLastResult(null);

    let nextPrimary = [...primary];
    let nextRecycle = [...recycle];

    if (nextPrimary.length === 0) {
      if (nextRecycle.length === 0) {
        // All correct — end round early
        setGameState("round-done");
        return;
      }
      nextPrimary = shuffle(nextRecycle);
      nextRecycle = [];
    }

    const next = nextPrimary.shift()!;
    setPrimaryQueue(nextPrimary);
    setRecycleQueue(nextRecycle);
    setCurrentQuestion(next);
    setQuestionNum((n) => n + 1);
  }, []);

  // ── Handle answer ────────────────────────────────────────────────────────────
  const handleResult = useCallback((result: AttemptResult) => {
    if (!currentQuestion || gameState !== "playing") return;

    setLastResult(result);
    setShowAnswer(true);

    const attempt: Attempt = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question_text,
      result,
    };
    setAttempts((prev) => [...prev, attempt]);

    if (result === "correct") setScore((s) => s + 10);

    // Move to next question after 1.2s
    setTimeout(() => {
      const nextPrimary = [...primaryQueue];
      const nextRecycle = [...recycleQueue];

      if (result !== "correct") nextRecycle.push(currentQuestion);

      if (nextPrimary.length === 0 && nextRecycle.length === 0) {
        setGameState("round-done");
        return;
      }
      loadNextQuestion(nextPrimary, nextRecycle);
    }, 1200);
  }, [currentQuestion, gameState, primaryQueue, recycleQueue, loadNextQuestion]);

  // ── Global 60s timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === "playing" && !showAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            stopTimer();
            // Time is up — treat current question as timeout then end
            handleResult("timeout");
            setGameState("round-done");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameState, showAnswer, handleResult, stopTimer]);

  // ── Start a round ────────────────────────────────────────────────────────────
  const startRound = () => {
    const pool = shuffle(SAMPLE_QUESTIONS).slice(0, 10);
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

  // ── Finish round & save ──────────────────────────────────────────────────────
  const finishRound = useCallback(() => {
    const timeUsed = Math.round((Date.now() - roundStartTime) / 1000);
    const result: TeamResult = {
      teamName: teams[currentTeamIdx],
      score,
      correct: attempts.filter((a) => a.result === "correct").length,
      wrong:   attempts.filter((a) => a.result === "wrong").length,
      passed:  attempts.filter((a) => a.result === "pass" || a.result === "timeout").length,
      attempts,
      timeUsed: Math.min(timeUsed, ROUND_TIME),
    };
    setSessionResults((prev) => [...prev, result]);
  }, [teams, currentTeamIdx, score, attempts, roundStartTime]);

  useEffect(() => {
    if (gameState === "round-done") {
      stopTimer();
      finishRound();
    }
  }, [gameState, stopTimer, finishRound]);

  const nextTeam = () => {
    const nextIdx = currentTeamIdx + 1;
    if (nextIdx >= teams.length) {
      setGameState("session-done");
    } else {
      setCurrentTeamIdx(nextIdx);
      setGameState("round-setup");
    }
  };

  const resetSession = () => {
    setSessionResults([]);
    setCurrentTeamIdx(0);
    setGameState("session-setup");
  };

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN: SESSION SETUP — add/remove teams before starting
  // ────────────────────────────────────────────────────────────────────────────
  if (gameState === "session-setup") {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-1">Rapid Fire — Session Setup</h1>
            <p className="text-white/50">Add all teams that will compete in this session</p>
          </div>

          {/* Team list */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
              <Users size={14} /> Teams in this session
            </div>
            {teams.map((team, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-6 h-6 bg-[#f5a623]/20 rounded-full flex items-center justify-center text-[#f5a623] font-black text-xs">
                  {i + 1}
                </div>
                <span className="flex-1 font-medium">{team}</span>
                <button
                  onClick={() => setTeams((t) => t.filter((_, idx) => idx !== i))}
                  className="text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Add team input */}
            <div className="flex gap-2 pt-1">
              <input
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTeam.trim()) {
                    setTeams((t) => [...t, newTeam.trim()]);
                    setNewTeam("");
                  }
                }}
                placeholder="Add a team name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5a623]/40"
              />
              <button
                onClick={() => {
                  if (newTeam.trim()) {
                    setTeams((t) => [...t, newTeam.trim()]);
                    setNewTeam("");
                  }
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Round settings info */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Round Time", val: "60s" },
              { label: "Questions", val: "10" },
              { label: "Per Correct", val: "+10 pts" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[#f5a623] font-black text-lg">{s.val}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          <button
            disabled={teams.length === 0}
            onClick={() => { setCurrentTeamIdx(0); setSessionResults([]); setGameState("round-setup"); }}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0a1628] font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Play size={20} /> Start Session ({teams.length} team{teams.length !== 1 ? "s" : ""})
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN: ROUND SETUP — ready screen before each team's round
  // ────────────────────────────────────────────────────────────────────────────
  if (gameState === "round-setup") {
    const teamsPlayed = sessionResults.length;
    const teamsRemaining = teams.length - teamsPlayed;
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-2">
            {teams.map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "h-1.5 rounded-full flex-1 max-w-16 transition-all",
                  i < teamsPlayed ? "bg-[#f5a623]" : i === currentTeamIdx ? "bg-white/60" : "bg-white/10"
                )}
              />
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Now Up</div>
            <div className="text-4xl font-black text-[#f5a623] mb-1">{teams[currentTeamIdx]}</div>
            <div className="text-white/40 text-sm mb-6">
              Team {currentTeamIdx + 1} of {teams.length}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-white/60">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white font-bold text-lg">60s</div>
                <div>Total time</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white font-bold text-lg">10</div>
                <div>Questions</div>
              </div>
            </div>

            {/* Previously played teams */}
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

            <button
              onClick={startRound}
              className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Play size={20} /> Start Round
            </button>
          </div>

          {teamsRemaining > 1 && (
            <p className="text-white/30 text-sm">{teamsRemaining - 1} more team{teamsRemaining - 1 !== 1 ? "s" : ""} after this</p>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN: ROUND DONE — shows this team's result, move to next or finish
  // ────────────────────────────────────────────────────────────────────────────
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

          {/* Score */}
          <div className="bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-2xl p-6 text-center">
            <div className="text-6xl font-black text-[#f5a623]">{thisResult?.score ?? 0}</div>
            <div className="text-white/50 text-sm mt-1">points scored</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <div className="text-green-400 font-black text-xl">{thisResult?.correct ?? 0}</div>
              <div className="text-white/40 text-xs">Correct</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <div className="text-red-400 font-black text-xl">{thisResult?.wrong ?? 0}</div>
              <div className="text-white/40 text-xs">Wrong</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
              <div className="text-yellow-400 font-black text-xl">{thisResult?.passed ?? 0}</div>
              <div className="text-white/40 text-xs">Passed</div>
            </div>
          </div>

          {/* Attempt strip */}
          <div className="flex flex-wrap gap-2">
            {thisResult?.attempts.map((a, i) => (
              <div key={i} title={`${a.questionText} → ${a.result}`}
                className={clsx("w-7 h-7 rounded-full text-xs flex items-center justify-center text-white font-bold", RESULT_COLORS[a.result])}>
                {a.result === "correct" ? "✓" : a.result === "wrong" ? "✗" : "↺"}
              </div>
            ))}
          </div>

          {/* Previous scores */}
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
            <button
              onClick={() => setGameState("session-done")}
              className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Trophy size={20} /> See Final Results
            </button>
          ) : (
            <button
              onClick={nextTeam}
              className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              Next Team: {teams[currentTeamIdx + 1]} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN: SESSION DONE — final leaderboard for all teams
  // ────────────────────────────────────────────────────────────────────────────
  if (gameState === "session-done") {
    const sorted = [...sessionResults].sort((a, b) => b.score - a.score);

    return (
      <div className="p-8 text-white">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <Medal size={48} className="text-[#f5a623] mx-auto mb-3" />
            <h1 className="text-3xl font-black">Session Complete!</h1>
            <p className="text-white/50">Final standings for this Rapid Fire session</p>
          </div>

          {/* Podium */}
          <div className="space-y-3">
            {sorted.map((result, i) => (
              <ScoreCard key={result.teamName} result={result} rank={i + 1} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetSession}
              className="flex-1 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={18} /> New Session
            </button>
            <button
              onClick={() => {
                setSessionResults([]);
                setCurrentTeamIdx(0);
                setGameState("session-setup");
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl"
            >
              Edit Teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN: PLAYING — the live competition screen
  // ────────────────────────────────────────────────────────────────────────────
  const timerPercent = (timeLeft / ROUND_TIME) * 100;
  const timerColor =
    timeLeft > 30 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#ef4444";

  const correctCount = attempts.filter((a) => a.result === "correct").length;

  return (
    <div className="p-6 text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-widest">Team</div>
          <div className="font-black text-lg text-[#f5a623]">{teams[currentTeamIdx]}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest">Questions</div>
          <div className="font-black">Q{questionNum} · {correctCount} correct</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest">Recycle</div>
          <div className={clsx("font-black", recycleQueue.length > 0 ? "text-[#f5a623]" : "text-white/20")}>
            {recycleQueue.length > 0 ? `↺ ${recycleQueue.length}` : "—"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-widest">Score</div>
          <div className="font-black text-[#f5a623] text-xl">{score}</div>
        </div>
      </div>

      {/* Global 60s timer bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/40">Round Timer</span>
          <span
            className={clsx("font-black text-base transition-colors", timeLeft <= 10 ? "animate-flash" : "")}
            style={{ color: timerColor }}
          >
            {timeLeft}s remaining
          </span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {currentQuestion && (
          <div className={clsx(
            "w-full border rounded-3xl p-8 transition-all duration-300",
            showAnswer && lastResult === "correct" ? "border-green-500/50 bg-green-500/10" :
            showAnswer && lastResult === "wrong"   ? "border-red-500/50 bg-red-500/10" :
            showAnswer ? "border-yellow-500/50 bg-yellow-500/10" :
            "border-white/20 bg-white/5"
          )}>
            {/* Tags */}
            <div className="flex items-center justify-between mb-6">
              <span className="bg-[#f5a623]/20 text-[#f5a623] text-xs font-bold px-3 py-1 rounded-full">
                {currentQuestion.subject} · {currentQuestion.category}
              </span>
              {recycleQueue.some((q) => q.id === currentQuestion.id) && (
                <span className="bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">↺ Reattempt</span>
              )}
            </div>

            {/* Question text */}
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center mb-8">
              {currentQuestion.question_text}
            </p>

            {/* Answer reveal */}
            {showAnswer && (
              <div className={clsx(
                "text-center text-xl font-black rounded-2xl py-4 mb-2",
                lastResult === "correct" ? "text-green-400" :
                lastResult === "wrong"   ? "text-red-400" : "text-yellow-400"
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
            <button
              onClick={() => handleResult("correct")}
              className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black py-5 rounded-2xl transition-all active:scale-95 text-lg"
            >
              <CheckCircle size={22} /> Correct
            </button>
            <button
              onClick={() => handleResult("wrong")}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-black py-5 rounded-2xl transition-all active:scale-95"
            >
              <XCircle size={20} /> Wrong
            </button>
            <button
              onClick={() => handleResult("pass")}
              className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-black py-5 rounded-2xl transition-all active:scale-95"
            >
              <SkipForward size={20} /> Pass
            </button>
            <button
              onClick={() => { stopTimer(); setGameState("paused"); }}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-5 rounded-2xl transition-all"
            >
              <Pause size={18} /> Pause
            </button>
          </div>
        )}

        {/* Paused overlay */}
        {gameState === "paused" && (
          <div className="w-full mt-5 space-y-3">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-white/60 font-bold">
              ⏸ Round Paused — {timeLeft}s remaining
            </div>
            <button
              onClick={() => setGameState("playing")}
              className="w-full bg-[#f5a623] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <ChevronRight size={20} /> Resume
            </button>
          </div>
        )}
      </div>

      {/* Attempt history strip */}
      <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 flex-wrap">
        {attempts.map((a, i) => (
          <div
            key={i}
            title={a.questionText}
            className={clsx("w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold", RESULT_COLORS[a.result])}
          >
            {a.result === "correct" ? "✓" : a.result === "wrong" ? "✗" : "↺"}
          </div>
        ))}
      </div>
    </div>
  );
}
