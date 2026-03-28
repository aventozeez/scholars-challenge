"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    category: "Eligibility",
    items: [
      { q: "Who can participate?", a: "Any student currently in SS1, SS2, or SS3 in a recognized secondary school in Nigeria." },
      { q: "Is there an age limit?", a: "No specific age limit — as long as you are in SS1, SS2, or SS3, you are eligible." },
      { q: "Can private school students participate?", a: "Yes. Both public and private secondary school students are welcome." },
    ],
  },
  {
    category: "Registration",
    items: [
      { q: "How much does registration cost?", a: "Registration is completely FREE. There are no hidden charges whatsoever." },
      { q: "How do I register?", a: "Click 'Register Free' at the top of the page and fill in your details. You will receive a confirmation email." },
      { q: "Can I register after the deadline?", a: "Late registrations are not accepted. The qualifying exam date is fixed. Register early." },
      { q: "Can I change my category after registering?", a: "Contact us at scholars@aventolinks.com within 48 hours of registration." },
    ],
  },
  {
    category: "Competition Format",
    items: [
      { q: "What are the competition stages?", a: "Stage 1: Online qualifying exam. Stage 2: Top 100 selection. Stage 3: Team formation. Stage 4: Grand Finale." },
      { q: "What categories are available?", a: "Science, Arts, and Commercial. Questions are tailored to each track." },
      { q: "What happens in the Rapid Fire round?", a: "10 questions per team, one at a time with a countdown timer. Wrong or passed questions recycle back until answered correctly or time runs out." },
      { q: "What is the Buzzer round?", a: "All teams compete simultaneously. First team to buzz gets 10 seconds to answer. Correct = +10 pts, Wrong = -5 pts." },
      { q: "What is the Puzzle round?", a: "Visual and logic-based challenges: rearrange letters, identify diagrams, solve real-world problems. Teams get 30–60 seconds per puzzle." },
      { q: "How are teams formed?", a: "The top 100 students from the qualifying exam form school teams of 4 members. Schools with fewer than 4 qualifiers may merge with partner schools." },
    ],
  },
  {
    category: "Prizes",
    items: [
      { q: "What is the total prize pool?", a: "Over ₦5,000,000 across main prizes and special category awards." },
      { q: "When are prizes paid?", a: "Cash prizes are disbursed within 30 days after the Grand Finale." },
      { q: "Are there prizes beyond the top 4?", a: "Yes — Best Science/Arts/Commercial School, Best Individual Performer, Most Improved Team, and Best Buzzer Reflexes." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-[#0a1628] text-sm pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#f5a623] flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#0a1628] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Help</div>
          <h1 className="text-5xl font-black text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/60 text-xl">Everything you need to know about the Scholars Challenge</p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-black text-[#f5a623] uppercase tracking-widest mb-4">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-[#0a1628] px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-3">Still have questions?</h2>
          <p className="text-white/60 mb-6">Our team is happy to help. Reach out directly.</p>
          <a
            href="mailto:scholars@aventolinks.com"
            className="inline-block bg-[#f5a623] text-[#0a1628] font-black px-8 py-3 rounded-full hover:bg-[#fbbf24] transition-colors"
          >
            Email Us
          </a>
          <div className="mt-8">
            <Link href="/register" className="text-[#f5a623] hover:underline font-bold">
              Ready to register? It&apos;s free →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
