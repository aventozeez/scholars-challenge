import Link from "next/link";
import {
  Trophy,
  Users,
  Zap,
  BookOpen,
  ChevronRight,
  Star,
  Award,
  Target,
  Globe,
  ArrowRight,
} from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Online Qualifying Exam",
    desc: "Students from SS1–SS3 sit a computer-based test covering Science, Arts, Commercial & General Aptitude.",
    icon: BookOpen,
    color: "from-blue-500 to-blue-700",
  },
  {
    number: "02",
    title: "Top 100 Selection",
    desc: "The top 100 highest-scoring students are selected and notified to proceed to the team formation stage.",
    icon: Target,
    color: "from-purple-500 to-purple-700",
  },
  {
    number: "03",
    title: "Team Formation",
    desc: "Qualified students form school teams of 4. Teams get access to the competition platform and practice portal.",
    icon: Users,
    color: "from-orange-500 to-orange-700",
  },
  {
    number: "04",
    title: "Grand Finale",
    desc: "Live competition with Rapid Fire, Buzzer & Puzzle rounds. Broadcast to a live audience. Prize give-away.",
    icon: Trophy,
    color: "from-yellow-500 to-yellow-600",
  },
];

const prizes = [
  {
    place: "1st",
    amount: "₦1,500,000",
    label: "First Place",
    gradient: "from-yellow-400 to-yellow-600",
    size: "large",
    extras: ["Trophy", "Certificates", "Laptop × 4", "School Plaque"],
  },
  {
    place: "2nd",
    amount: "₦1,000,000",
    label: "Second Place",
    gradient: "from-slate-300 to-slate-500",
    size: "medium",
    extras: ["Trophy", "Certificates", "Tablets × 4"],
  },
  {
    place: "3rd",
    amount: "₦750,000",
    label: "Third Place",
    gradient: "from-amber-600 to-amber-800",
    size: "medium",
    extras: ["Trophy", "Certificates"],
  },
  {
    place: "4th",
    amount: "₦500,000",
    label: "Fourth Place",
    gradient: "from-blue-400 to-blue-600",
    size: "small",
    extras: ["Medals", "Certificates"],
  },
];

const features = [
  {
    icon: Zap,
    title: "Rapid Fire Round",
    desc: "10 questions, intelligent recycling. Wrong or passed questions come back until answered correctly.",
  },
  {
    icon: Users,
    title: "Team Buzzer Round",
    desc: "First team to buzz gets the chance. Correct = +10 pts. Wrong = -5 pts. Steal points from rivals.",
  },
  {
    icon: Star,
    title: "Puzzle Round",
    desc: "Visual and logic puzzles. Rearrange letters, identify diagrams, solve real-world challenges.",
  },
  {
    icon: Globe,
    title: "Multi-School Platform",
    desc: "Schools from every state compete. Live scoreboard visible to audience and parents worldwide.",
  },
  {
    icon: Award,
    title: "Multi-Category",
    desc: "Separate tracks for Science, Arts, and Commercial students. Everyone has a fair chance.",
  },
  {
    icon: Trophy,
    title: "₦5M+ Prize Pool",
    desc: "Total prize pool across all categories. Registration is completely free for all students.",
  },
];

const faqs = [
  { q: "Who can participate?", a: "Any student in SS1, SS2, or SS3 in any secondary school in Nigeria." },
  { q: "How much does registration cost?", a: "Registration is 100% FREE. There are no hidden charges." },
  { q: "When is the competition?", a: "The qualifying exam runs online. The Grand Finale date will be announced." },
  { q: "What categories are available?", a: "Science, Arts, and Commercial. Questions are tailored to each track." },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0a1628] overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#f5a623]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-[#f5a623]/20 border border-[#f5a623]/30 rounded-full px-4 py-1.5 text-[#f5a623] text-sm font-medium mb-6">
              <Star size={14} />
              Nigeria&apos;s Premier Academic Competition
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
              Compete.{" "}
              <span className="text-[#f5a623]">Innovate.</span>
              <br />
              Win up to{" "}
              <span className="text-[#f5a623]">₦5 Million.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              The AventoLinks Scholars Challenge is Nigeria&apos;s most exciting
              secondary school competition. Test your knowledge, outthink your
              rivals, and take home life-changing prizes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a1628] font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105"
              >
                Register Free Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-8 py-4 rounded-full text-base transition-all"
              >
                How It Works <ChevronRight size={18} />
              </Link>
            </div>
            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { num: "36", label: "States Eligible" },
                { num: "₦5M+", label: "Prize Pool" },
                { num: "FREE", label: "Registration" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[#f5a623] text-2xl font-black">{s.num}</div>
                  <div className="text-white/50 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-96">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Live Round</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">● ACTIVE</span>
                </div>
                <div className="text-center">
                  <div className="text-white/50 text-xs mb-2">RAPID FIRE ROUND — Q 4/10</div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white font-bold text-lg leading-relaxed">
                      What is the chemical formula for water?
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Timer</span>
                    <span className="text-[#f5a623]">07s</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#f5a623] rounded-full w-[70%]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["✓ Correct", "✗ Wrong", "⟳ Pass"].map((btn, i) => (
                    <button
                      key={btn}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                        i === 0
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : i === 1
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-white/10 text-white/60 border border-white/20"
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white/50 text-xs">Team Ibadan Royals</span>
                  <span className="text-[#f5a623] font-bold">Score: 30</span>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#f5a623] text-[#0a1628] rounded-2xl px-4 py-3 font-black text-lg shadow-xl">
                1st ₦1.5M
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">The Journey</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1628]">How It Works</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto text-lg">
              Four stages separate you from a life-changing prize. Here&apos;s your path to victory.
            </p>
          </div>

          <div id="stages" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.number}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center mb-4`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="text-[#f5a623] font-black text-3xl mb-2">{stage.number}</div>
                  <h3 className="font-bold text-[#0a1628] text-lg mb-3">{stage.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── COMPETITION FEATURES ───────── */}
      <section className="py-24 bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">The Experience</div>
            <h2 className="text-4xl md:text-5xl font-black text-white">Built for Champions</h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
              Real-time competition technology that feels like a TV show.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 bg-[#f5a623]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#f5a623]/30 transition-colors">
                    <Icon size={20} className="text-[#f5a623]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── PRIZES ───────── */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Rewards</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1628]">₦5 Million+ Prize Pool</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto text-lg">
              Registration is FREE. The prizes are real.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {prizes.map((prize, i) => (
              <div
                key={prize.place}
                className={`relative rounded-3xl overflow-hidden ${i === 0 ? "lg:-mt-4 lg:scale-105" : ""}`}
              >
                <div className={`bg-gradient-to-b ${prize.gradient} p-6 text-white text-center`}>
                  <div className="text-4xl font-black mb-1">{prize.place}</div>
                  <div className="text-sm font-medium opacity-80">{prize.label}</div>
                </div>
                <div className="bg-white border border-slate-100 p-6">
                  <div className="text-[#0a1628] text-2xl font-black text-center mb-4">{prize.amount}</div>
                  <ul className="space-y-1">
                    {prize.extras.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="text-[#f5a623]">✓</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/prizes"
              className="inline-flex items-center gap-2 text-[#0a1628] font-bold hover:text-[#f5a623] transition-colors"
            >
              View full prize breakdown <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── FAQ PREVIEW ───────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">FAQ</div>
            <h2 className="text-4xl font-black text-[#0a1628]">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-[#0a1628] mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-[#f5a623] font-bold hover:underline">
              See all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── CTA BANNER ───────── */}
      <section className="py-24 bg-[#f5a623]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#0a1628] mb-4">
            Ready to Be a Scholar?
          </h2>
          <p className="text-[#0a1628]/70 text-xl mb-8">
            Free registration. Real prizes. National recognition.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#0a1628] hover:bg-[#112244] text-white font-bold px-10 py-5 rounded-full text-lg transition-all hover:scale-105"
          >
            Register Now — It&apos;s Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
