"use client";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Upload } from "lucide-react";

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

const mockQuestions: Question[] = [
  { id: "1", round_type: "rapid_fire", category: "science", subject: "Chemistry", question_text: "What is the chemical symbol for Gold?", answer_key: "Au", difficulty: "easy", points: 10 },
  { id: "2", round_type: "buzzer", category: "general", subject: "Geography", question_text: "What is the capital of Ghana?", answer_key: "Accra", difficulty: "easy", points: 10 },
  { id: "3", round_type: "rapid_fire", category: "arts", subject: "Literature", question_text: "Who wrote 'Things Fall Apart'?", answer_key: "Chinua Achebe", difficulty: "medium", points: 10 },
  { id: "4", round_type: "puzzle", category: "science", subject: "Physics", question_text: "Rearrange: TGENERY (a form of energy)", answer_key: "ENTROPY", difficulty: "hard", points: 20 },
  { id: "5", round_type: "rapid_fire", category: "commercial", subject: "Economics", question_text: "What does GDP stand for?", answer_key: "Gross Domestic Product", difficulty: "easy", points: 10 },
];

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [search, setSearch] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Question, "id">>({
    round_type: "rapid_fire", category: "science", subject: "", question_text: "", answer_key: "", difficulty: "easy", points: 10,
  });

  const filtered = questions.filter((q) => {
    const matchSearch = q.question_text.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    const matchRound = !filterRound || q.round_type === filterRound;
    const matchCat = !filterCat || q.category === filterCat;
    return matchSearch && matchRound && matchCat;
  });

  const addQuestion = () => {
    if (!form.question_text || !form.answer_key || !form.subject) return;
    setQuestions((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    setForm({ round_type: "rapid_fire", category: "science", subject: "", question_text: "", answer_key: "", difficulty: "easy", points: 10 });
    setShowForm(false);
  };

  const deleteQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Question Bank</h1>
          <p className="text-white/50 mt-1">{questions.length} questions total</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] px-4 py-2 rounded-xl text-sm font-black transition-colors"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-bold text-lg">New Question</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Round Type</label>
              <select
                value={form.round_type}
                onChange={(e) => setForm((f) => ({ ...f, round_type: e.target.value as Question["round_type"] }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="rapid_fire">Rapid Fire</option>
                <option value="buzzer">Buzzer</option>
                <option value="puzzle">Puzzle</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Question["category"] }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="science">Science</option>
                <option value="arts">Arts</option>
                <option value="commercial">Commercial</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Question["difficulty"] }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Chemistry"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Question Text</label>
            <textarea
              value={form.question_text}
              onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
              placeholder="Enter the question..."
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Answer Key</label>
            <input
              value={form.answer_key}
              onChange={(e) => setForm((f) => ({ ...f, answer_key: e.target.value }))}
              placeholder="Correct answer"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={addQuestion} className="bg-[#f5a623] text-[#0a1628] font-black px-6 py-2 rounded-xl text-sm">
              Save Question
            </button>
            <button onClick={() => setShowForm(false)} className="bg-white/10 text-white px-6 py-2 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 min-w-48">
          <Search size={16} className="text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <select
          value={filterRound}
          onChange={(e) => setFilterRound(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
        >
          <option value="">All Rounds</option>
          <option value="rapid_fire">Rapid Fire</option>
          <option value="buzzer">Buzzer</option>
          <option value="puzzle">Puzzle</option>
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
        >
          <option value="">All Categories</option>
          <option value="science">Science</option>
          <option value="arts">Arts</option>
          <option value="commercial">Commercial</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-white/40 text-xs uppercase">
              <th className="py-3 px-5 text-left">Question</th>
              <th className="py-3 px-5 text-left hidden sm:table-cell">Round</th>
              <th className="py-3 px-5 text-left hidden md:table-cell">Category</th>
              <th className="py-3 px-5 text-left hidden md:table-cell">Answer</th>
              <th className="py-3 px-5 text-left">Difficulty</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((q) => (
              <tr key={q.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-5">
                  <div className="text-sm font-medium text-white max-w-xs truncate">{q.question_text}</div>
                  <div className="text-xs text-white/40 mt-0.5">{q.subject}</div>
                </td>
                <td className="py-4 px-5 hidden sm:table-cell">
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">
                    {q.round_type.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 px-5 text-white/60 text-sm capitalize hidden md:table-cell">{q.category}</td>
                <td className="py-4 px-5 text-white/60 text-sm hidden md:table-cell max-w-[120px] truncate">{q.answer_key}</td>
                <td className="py-4 px-5">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold capitalize ${difficultyColors[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-white/40 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/30">No questions found.</div>
        )}
      </div>
    </div>
  );
}
