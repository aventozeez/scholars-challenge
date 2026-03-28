import { Trophy, Medal, Award, Gift } from "lucide-react";
import Link from "next/link";

const mainPrizes = [
  {
    rank: "1st Place",
    cash: "₦1,500,000",
    icon: Trophy,
    color: "from-yellow-400 to-yellow-600",
    items: ["Grand Trophy", "Certificates for all 4 members", "4× Laptops", "School Plaque", "Media Feature"],
  },
  {
    rank: "2nd Place",
    cash: "₦1,000,000",
    icon: Medal,
    color: "from-slate-300 to-slate-500",
    items: ["Silver Trophy", "Certificates for all 4 members", "4× Tablets", "School Certificate"],
  },
  {
    rank: "3rd Place",
    cash: "₦750,000",
    icon: Medal,
    color: "from-amber-600 to-amber-800",
    items: ["Bronze Trophy", "Certificates for all 4 members", "School Certificate"],
  },
  {
    rank: "4th Place",
    cash: "₦500,000",
    icon: Award,
    color: "from-blue-500 to-blue-700",
    items: ["Medals for all 4 members", "Certificates", "School Recognition"],
  },
];

const categoryPrizes = [
  { category: "Best Science School", prize: "₦200,000 + Plaque" },
  { category: "Best Arts School", prize: "₦200,000 + Plaque" },
  { category: "Best Commercial School", prize: "₦200,000 + Plaque" },
  { category: "Best Individual Performer", prize: "₦150,000 + Trophy" },
  { category: "Most Improved Team", prize: "₦100,000 + Certificate" },
  { category: "Best Buzzer Reflexes", prize: "₦50,000 + Medal" },
];

export default function PrizesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#0a1628] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Rewards</div>
          <h1 className="text-5xl font-black text-white mb-4">Prizes & Awards</h1>
          <p className="text-white/60 text-xl">
            A total prize pool of over ₦5,000,000. Registration is completely free.
          </p>
        </div>
      </section>

      {/* Main prizes */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-[#0a1628] text-center mb-12">Main Competition Prizes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainPrizes.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.rank} className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-b ${p.color} p-6 text-white text-center`}>
                    <Icon size={36} className="mx-auto mb-2" />
                    <div className="font-black text-xl">{p.rank}</div>
                    <div className="text-3xl font-black mt-2">{p.cash}</div>
                  </div>
                  <div className="bg-white p-6">
                    <ul className="space-y-2">
                      {p.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-slate-600 text-sm">
                          <span className="text-[#f5a623] font-bold">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category prizes */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-[#0a1628] text-center mb-12">Special Category Awards</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {categoryPrizes.map((cp) => (
              <div key={cp.category} className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f5a623]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift size={20} className="text-[#f5a623]" />
                </div>
                <div>
                  <div className="font-bold text-[#0a1628] text-sm">{cp.category}</div>
                  <div className="text-[#f5a623] font-black">{cp.prize}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#f5a623] px-4 text-center">
        <h2 className="text-4xl font-black text-[#0a1628] mb-4">These prizes could be yours</h2>
        <p className="text-[#0a1628]/70 text-lg mb-8">Registration is free. Start your journey today.</p>
        <Link
          href="/register"
          className="inline-block bg-[#0a1628] text-white font-black px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
        >
          Register Now — Free
        </Link>
      </section>
    </div>
  );
}
