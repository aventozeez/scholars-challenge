import { Trophy, Users, Target, Globe } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Trophy, title: "Excellence", desc: "We celebrate academic achievement and push students to reach their highest potential." },
  { icon: Users, title: "Teamwork", desc: "Competition in teams teaches collaboration, communication, and shared purpose." },
  { icon: Target, title: "Innovation", desc: "Beyond rote learning — we test critical thinking, problem solving, and adaptability." },
  { icon: Globe, title: "National Reach", desc: "Connecting brilliant students from every state, building a network of future leaders." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#0a1628] py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-4">About the Challenge</div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            More Than a Competition
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            The AventoLinks Scholars Challenge was created to celebrate Nigeria&apos;s brightest secondary school students
            and give them a platform to compete, grow, and win life-changing prizes.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Our Mission</div>
            <h2 className="text-4xl font-black text-[#0a1628] mb-6">
              Building Nigeria&apos;s Next Generation of Scholars
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-4">
              AventoLinks Scholars Challenge is a national academic competition open to all secondary school students
              in Nigeria. We believe every brilliant mind deserves a stage — regardless of where they come from.
            </p>
            <p className="text-slate-500 text-lg leading-relaxed">
              Through live competition rounds, real-time technology, and a TV-show level experience, we create
              a platform where intellect meets entertainment and academic excellence gets the recognition it deserves.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Students Registered", val: "10,000+" },
              { label: "Schools Represented", val: "500+" },
              { label: "States Participating", val: "36" },
              { label: "Total Prize Pool", val: "₦5M+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0a1628] rounded-3xl p-6 text-center"
              >
                <div className="text-[#f5a623] text-3xl font-black mb-2">{stat.val}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">What We Stand For</div>
            <h2 className="text-4xl font-black text-[#0a1628]">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#f5a623]/20 rounded-2xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-[#f5a623]" />
                  </div>
                  <h3 className="font-black text-[#0a1628] text-lg mb-3">{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#f5a623] px-4 text-center">
        <h2 className="text-4xl font-black text-[#0a1628] mb-4">Be Part of the Story</h2>
        <p className="text-[#0a1628]/70 text-lg mb-8">Join thousands of students already registered. Free entry.</p>
        <Link
          href="/register"
          className="inline-block bg-[#0a1628] text-white font-black px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
        >
          Register Now
        </Link>
      </section>
    </div>
  );
}
