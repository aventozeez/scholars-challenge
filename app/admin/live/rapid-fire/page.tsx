"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle, XCircle, SkipForward, ChevronRight, Trophy } from "lucide-react";
import clsx from "clsx";

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

const SAMPLE_QUESTIONS: Question[] = [
  { id: "1", question_text: "What is the chemical symbol for Gold?", answer_key: "Au", subject: "Chemistry", category: "Science" },
  { id: "2", question_text: "What is the capital of Ghana?", answer_key: "Accra", subject: "Geography", category: "General" },
  { id: "3", question_text: "Who wrote 'Things Fall Apart'?", answer_key: "Chinua Achebe", subject: "Literature", category: "Arts" },
  { id: "4", question_text: "What is the powerhouse of the cell?", answer_key: "Mitochondria", subject: "Biology", category: "Science" },
  { id: "5", question_text: "What does GDP stand for?", answer_key: "Gross Domestic Product", subject: "Economics", category: "Commercial" },
  { id: "6", question_text: "What is the square root of 144?", answer_key: "12", subject: "Mathematics", category: "Science" },
  { id: "7", question_text: "Name the longest river in Africa.", answer_key: "Nile", subject: "Geography", category: "General" },
  { id: "8", question_text: "What element has the symbol 'Fe'?", answer_key: "Iron", subject: "Chemistry", category: "Science" },
  { id: "9", question_text: "In what year did Nigeria gain independence?", answer_key: "1960", subject: "History", category: "General" },
  { id: "10", question_text: "What is the speed of light (approx)?", answer_key: "300,000 km/s", subject: "Physics", category: "Science" },
];

const QUESTION_TIME = 10; // seconds per question
const RESULT_COLORS: Record<AttemptResult, string> = {
  correct: "bg-green-500",
  wrong: "bg-red-500",
  pass: "bg-yellow-500",
  timeout: "bg-slate-500",
};

type GameState = "setup" | "playing" | "paused" | "finished";

export default function RapidFirePage() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [teamName, setTeamName] = useState("Team Alpha");
  const [score, setScore] = useState(0);
  const [primaryQueue, setPrimaryQueue] = useState<Question[]>([]);
  const [recycleQueue, setRecycleQueue] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questionNum, setQuestionNum] = useState(0);
  const [totalQuestions] = useState(10);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const loadNextQuestion = useCallback((primary: Question[], recycle: Question[]) => {
    stopTimer();
    setShowAnswer(false);
    setLastResult(null);

    let nextPrimary = [...primary];
    let nextRecycle = [...recycle];

    // If primary is empty, swap recycle into primary
    if (nextPrimary.length === 0) {
      if (nextRecycle.length === 0) {
        setGameState("finished");
        return;
      }
      nextPrimary = [...nextRecycle];
      nextRecycle = [];
    }

    const next = nextPrimary.shift()!;
    setPrimaryQueue(nextPrimary);
    setRecycleQueue(nextRecycle);
    setCurrentQuestion(next);
    setTimeLeft(QUESTION_TIME);
    setQuestionNum((n) => n + 1);
  }, [stopTimer]);

  const handleResult = useCallback((result: AttemptResult) => {
    if (!currentQuestion || gameState !== "playing") return;
    stopTimer();
    setLastResult(result);
    setShowAnswer(true);

    const attempt: Attempt = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question_text,
      result,
    };
    setAttempts((prev) => [...prev, attempt]);

    if (result === "correct") {
      setScore((s) => s + 10);
    }

    // Schedule next question after 1.5s
    setTimeout(() => {
      const nextPrimary = [...primaryQueue];
      const nextRecycle = [...recycleQueue];

      if (result !== "correct") {
        nextRecycle.push(currentQuestion);
      }

      // Check if done
      const allDone = nextPrimary.length === 0 && nextRecycle.length === 0;
      if (allDone) {
        setGameState("finished");
        return;
      }

      loadNextQuestion(nextPrimary, nextRecycle);
    }, 1500);
  }, [currentQuestion, gameState, primaryQueue, recycleQueue, loadNextQuestion, stopTimer]);

  // Timer tick
  useEffect(() => {
    if (gameState === "playing" && currentQuestion && !showAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleResult("timeout");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => stopTimer();
  }, [gameState, currentQuestion, showAnswer, handleResult, stopTimer]);

  const startGame = () => {
    const shuffled = [...SAMPLE_QUESTIONS].sort(() => Math.random() - 0.5);
    const initial = shuffled.slice(0, 10);
    setScore(0);
    setQuestionNum(0);
    setAttempts([]);
    setPrimaryQueue(initial.slice(1));
    setRecycleQueue([]);
    setCurrentQuestion(initial[0]);
    setTimeLeft(QUESTION_TIME);
    setShowAnswer(false);
    setLastResult(null);
    setGameState("playing");
  };

  const timerPercent = (timeLeft / QUESTION_TIME) * 100;
  const timerColor =
    timeLeft > 6 ? "#22c55e" : timeLeft > 3 ? "#f59e0b" : "#ef4444";

  const correctCount = attempts.filter((a) => a.result === "correct").length;
  const wrongCount = attempts.filter((a) => a.result === "wrong").length;
  const passCount = attempts.filter((a) => a.result === "pass").length;

  // ── SETUP SCREEN ──
  if (gameState === "setup") {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-black mb-2 text-center">Rapid Fire Round</h1>
          <p className="text-white/50 text-center mb-8">10 questions · 10 seconds each · Recycle logic enabled</p>

          <div className="bg-white/5 border border-white/20 rounded-2xl p-6 space-y-4 mb-6">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Team Name</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="font-bold text-white">10</div>
                <div>Questions per round</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="font-bold text-white">10s</div>
                <div>Per question</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="font-bold text-white">+10</div>
                <div>Points per correct</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="font-bold text-[#f5a623]">Recycle</div>
                <div>Wrong/pass reappear</div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Play size={20} /> Start Round
          </button>
        </div>
      </div>
    );
  }

  // ── FINISHED SCREEN ──
  if (gameState === "finished") {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full text-center">
          <Trophy size={64} className="text-[#f5a623] mx-auto mb-4" />
          <h1 className="text-4xl font-black mb-2">Round Complete!</h1>
          <p className="text-white/50 mb-6">{teamName}</p>
          <div className="text-6xl font-black text-[#f5a623] mb-8">{score} pts</div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-500/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-green-400">{correctCount}</div>
              <div className="text-white/50 text-xs mt-1">Correct</div>
            </div>
            <div className="bg-red-500/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-red-400">{wrongCount}</div>
              <div className="text-white/50 text-xs mt-1">Wrong</div>
            </div>
            <div className="bg-yellow-500/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-400">{passCount}</div>
              <div className="text-white/50 text-xs mt-1">Passed</div>
            </div>
          </div>

          {/* Attempt history */}
          <div className="bg-white/5 rounded-2xl p-4 text-left mb-6 space-y-2 max-h-48 overflow-y-auto">
            {attempts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${RESULT_COLORS[a.result]}`} />
                <span className="text-white/60 truncate flex-1">{a.questionText}</span>
                <span className={`text-xs font-bold capitalize ${
                  a.result === "correct" ? "text-green-400" : a.result === "wrong" ? "text-red-400" : "text-yellow-400"
                }`}>{a.result}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-black py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Play Again
            </button>
            <button
              onClick={() => setGameState("setup")}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl"
            >
              New Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING SCREEN ──
  return (
    <div className="p-6 text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-widest">Team</div>
          <div className="font-black text-lg">{teamName}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest">Round</div>
          <div className="font-black text-[#f5a623]">Rapid Fire</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest">Question</div>
          <div className="font-black">{questionNum} / {totalQuestions}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-widest">Score</div>
          <div className="font-black text-[#f5a623] text-xl">{score}</div>
        </div>
      </div>

      {/* Queue indicators */}
      <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
        <span>Queue: <strong className="text-white">{primaryQueue.length}</strong></span>
        <span>Recycle: <strong className="text-[#f5a623]">{recycleQueue.length}</strong></span>
        {recycleQueue.length > 0 && (
          <span className="bg-[#f5a623]/20 text-[#f5a623] px-2 py-0.5 rounded-full font-bold">
            ↺ {recycleQueue.length} questions recycled
          </span>
        )}
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {currentQuestion && (
          <div className={clsx(
            "w-full bg-white/5 border rounded-3xl p-8 transition-all",
            showAnswer && lastResult === "correct" ? "border-green-500/50 bg-green-500/10" :
            showAnswer && lastResult === "wrong" ? "border-red-500/50 bg-red-500/10" :
            showAnswer && (lastResult === "pass" || lastResult === "timeout") ? "border-yellow-500/50 bg-yellow-500/10" :
            "border-white/20"
          )}>
            {/* Subject tag */}
            <div className="flex items-center justify-between mb-6">
              <span className="bg-[#f5a623]/20 text-[#f5a623] text-xs font-bold px-3 py-1 rounded-full">
                {currentQuestion.subject} · {currentQuestion.category}
              </span>
              {recycleQueue.some((q) => q.id === currentQuestion.id) && (
                <span className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                  ↺ Reattempt
                </span>
              )}
            </div>

            {/* Question text */}
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center mb-8">
              {currentQuestion.question_text}
            </p>

            {/* Answer reveal */}
            {showAnswer && (
              <div className={clsx(
                "text-center text-xl font-black rounded-2xl py-4 mb-6",
                lastResult === "correct" ? "text-green-400" :
                lastResult === "wrong" ? "text-red-400" : "text-yellow-400"
              )}>
                {lastResult === "correct" && "✓ Correct! +10 pts"}
                {lastResult === "wrong" && `✗ Wrong — Answer: ${currentQuestion.answer_key}`}
                {lastResult === "pass" && `⟳ Passed — Answer: ${currentQuestion.answer_key}`}
                {lastResult === "timeout" && `⏱ Time Out — Answer: ${currentQuestion.answer_key}`}
              </div>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="w-full mt-4 mb-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Time Remaining</span>
            <span
              className={clsx(
                "font-black text-base",
                timeLeft <= 3 && !showAnswer ? "animate-flash" : ""
              )}
              style={{ color: timerColor }}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
            />
          </div>
        </div>

        {/* Control buttons */}
        {!showAnswer && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <button
              onClick={() => handleResult("correct")}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl transition-all active:scale-95 col-span-2 md:col-span-1"
            >
              <CheckCircle size={20} /> Correct
            </button>
            <button
              onClick={() => handleResult("wrong")}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-2xl transition-all active:scale-95"
            >
              <XCircle size={20} /> Wrong
            </button>
            <button
              onClick={() => handleResult("pass")}
              className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-black py-4 rounded-2xl transition-all active:scale-95"
            >
              <SkipForward size={20} /> Pass
            </button>
            <button
              onClick={() => {
                stopTimer();
                setGameState("paused");
              }}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all"
            >
              <Pause size={18} /> Pause
            </button>
          </div>
        )}

        {gameState === "paused" && (
          <div className="w-full">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center mb-4 text-white/60">
              Round Paused
            </div>
            <button
              onClick={() => setGameState("playing")}
              className="w-full bg-[#f5a623] text-[#0a1628] font-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <ChevronRight size={20} /> Resume Round
            </button>
          </div>
        )}
      </div>

      {/* Attempt history strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {attempts.map((a, i) => (
          <div
            key={i}
            title={a.questionText}
            className={clsx("w-6 h-6 rounded-full flex-shrink-0", RESULT_COLORS[a.result])}
          />
        ))}
      </div>
    </div>
  );
}
