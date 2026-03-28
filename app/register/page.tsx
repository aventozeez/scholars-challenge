"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type FormData = {
  full_name: string;
  school_name: string;
  class_level: string;
  state: string;
  lga: string;
  email: string;
  phone: string;
  category: "science" | "arts" | "commercial" | "";
};

const nigeriaStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const classes = ["SS1", "SS2", "SS3"];

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    full_name: "", school_name: "", class_level: "", state: "",
    lga: "", email: "", phone: "", category: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { setErrorMsg("Please select a category."); return; }
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("sc_registrations").insert({
      full_name: form.full_name,
      school_name: form.school_name,
      class_level: form.class_level,
      state: form.state,
      lga: form.lga,
      email: form.email,
      phone: form.phone,
      category: form.category as "science" | "arts" | "commercial",
      status: "pending",
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#0a1628] mb-3">You&apos;re Registered!</h2>
          <p className="text-slate-500 mb-6">
            We&apos;ve received your registration. Check your email for confirmation details and next steps.
          </p>
          <a href="/" className="inline-block bg-[#f5a623] text-[#0a1628] font-bold px-8 py-3 rounded-full">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#112244] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#f5a623]/20 border border-[#f5a623]/30 rounded-full px-4 py-1.5 text-[#f5a623] text-sm font-medium mb-4">
            Registration is FREE
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Register for the Challenge</h1>
          <p className="text-white/60">
            Fill in your details below to secure your spot in Nigeria&apos;s most exciting academic competition.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 space-y-5 shadow-2xl"
        >
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-1">Full Name *</label>
            <input
              required
              value={form.full_name}
              onChange={update("full_name")}
              placeholder="e.g. Amina Yusuf"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
            />
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-1">School Name *</label>
            <input
              required
              value={form.school_name}
              onChange={update("school_name")}
              placeholder="e.g. Government College, Lagos"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
            />
          </div>

          {/* Class + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1">Class *</label>
              <select
                required
                value={form.class_level}
                onChange={update("class_level")}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623] bg-white"
              >
                <option value="">Select class</option>
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={update("category")}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623] bg-white"
              >
                <option value="">Select</option>
                <option value="science">Science</option>
                <option value="arts">Arts</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          {/* State + LGA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1">State *</label>
              <select
                required
                value={form.state}
                onChange={update("state")}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623] bg-white"
              >
                <option value="">Select state</option>
                {nigeriaStates.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1">LGA *</label>
              <input
                required
                value={form.lga}
                onChange={update("lga")}
                placeholder="Local Govt Area"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-1">Email Address *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-1">Phone Number *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+234 800 000 0000"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-50 text-[#0a1628] font-black py-4 rounded-full text-base flex items-center justify-center gap-2 transition-all"
          >
            {status === "loading" ? "Submitting…" : <>Submit Registration <ArrowRight size={18} /></>}
          </button>

          <p className="text-center text-slate-400 text-xs">
            By registering you agree to our terms. Registration is completely free.
          </p>
        </form>
      </div>
    </div>
  );
}
