"use client";
import { useState } from "react";
import { CheckCircle, Copy, ExternalLink, Database, Key, Settings, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import clsx from "clsx";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Copy">
      {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

function CodeBlock({ lines }: { lines: { key: string; value: string; placeholder?: boolean }[] }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="bg-[#051020] border border-white/10 rounded-xl p-4 font-mono text-sm space-y-1.5">
      {lines.map((l) => (
        <div key={l.key} className="flex items-center gap-2">
          <span className="text-blue-400">{l.key}</span>
          <span className="text-white/40">=</span>
          <span className={clsx("flex-1 truncate", l.placeholder ? "text-white/30 italic" : "text-green-400")}>
            {l.placeholder ? l.value : showKey ? l.value : "•".repeat(Math.min(l.value.length, 20))}
          </span>
          {!l.placeholder && (
            <>
              <button onClick={() => setShowKey(!showKey)} className="text-white/20 hover:text-white p-1">
                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <CopyBtn text={`${l.key}=${l.value}`} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    num: 1,
    icon: ExternalLink,
    title: "Create a Supabase project",
    desc: "Go to supabase.com and create a free account, then create a new project.",
    action: { label: "Open Supabase Dashboard", href: "https://supabase.com/dashboard" },
    detail: "Choose a project name (e.g. \"scholars-challenge\"), set a strong database password, and pick the closest region to Nigeria (Europe West is usually fastest).",
  },
  {
    num: 2,
    icon: Key,
    title: "Get your API keys",
    desc: "Inside your project, go to Project Settings → API to find your keys.",
    detail: "You need two values:\n• Project URL — looks like https://abcdefgh.supabase.co\n• Anon / Public key — a long JWT string starting with eyJ…",
  },
  {
    num: 3,
    icon: Settings,
    title: "Add keys to .env.local",
    desc: "Open the file C:\\Users\\azeez\\Downloads\\Scholars Challenge\\.env.local and replace the placeholder values.",
    detail: "The file should look exactly like this after editing:",
    code: true,
  },
  {
    num: 4,
    icon: Database,
    title: "Run the database schema",
    desc: "In Supabase, go to SQL Editor and paste the contents of supabase_schema.sql.",
    action: { label: "Open Supabase SQL Editor", href: "https://supabase.com/dashboard/project/_/sql/new" },
    detail: "This creates all the required tables: sc_questions, sc_match_teams, sc_question_pools, and more. Run the entire file at once.",
  },
  {
    num: 5,
    icon: CheckCircle,
    title: "Restart the dev server",
    desc: "Stop and restart with: npx next dev -p 3001",
    detail: "After saving .env.local, the server must restart to pick up the new environment variables. The yellow demo banners will disappear once Supabase is connected.",
  },
];

const ENV_TEMPLATE = `NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

export default function SetupPage() {
  const connected = isSupabaseConfigured;
  const [copied, setCopied] = useState(false);

  const copyEnvTemplate = () => {
    navigator.clipboard.writeText(ENV_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 text-white max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Database className="text-[#f5a623]" size={28} />
          Supabase Setup
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Connect a real database so questions, teams, and pools persist permanently.
        </p>
      </div>

      {/* Connection status */}
      <div className={clsx(
        "rounded-2xl px-5 py-4 mb-8 border flex items-center gap-3",
        connected
          ? "bg-green-500/10 border-green-500/30"
          : "bg-yellow-500/10 border-yellow-500/30"
      )}>
        {connected ? (
          <>
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <div>
              <div className="text-green-400 font-bold">Supabase is connected ✓</div>
              <div className="text-green-400/60 text-sm">All data is being saved to your database.</div>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <div className="text-yellow-400 font-bold">Not yet configured</div>
              <div className="text-yellow-400/60 text-sm">Running in demo mode. Follow the steps below to connect Supabase.</div>
            </div>
          </>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = connected && step.num < 5;
          return (
            <div key={step.num} className={clsx(
              "rounded-2xl border p-6 transition-all",
              isDone ? "bg-green-500/5 border-green-500/20" : "bg-white/5 border-white/10"
            )}>
              <div className="flex items-start gap-4">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  isDone ? "bg-green-500/20" : "bg-[#f5a623]/20"
                )}>
                  {isDone
                    ? <CheckCircle size={20} className="text-green-400" />
                    : <Icon size={20} className="text-[#f5a623]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white/20 text-xs font-bold uppercase tracking-wider">Step {step.num}</span>
                    {isDone && <span className="text-green-400 text-xs font-bold">Done</span>}
                  </div>
                  <h3 className="font-black text-white text-lg">{step.title}</h3>
                  <p className="text-white/50 text-sm mt-1">{step.desc}</p>

                  {step.detail && (
                    <div className="mt-3 text-white/40 text-sm whitespace-pre-line leading-relaxed">
                      {step.detail}
                    </div>
                  )}

                  {step.code && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/30 text-xs font-mono">.env.local</span>
                        <button
                          onClick={copyEnvTemplate}
                          className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors"
                        >
                          {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          {copied ? "Copied!" : "Copy template"}
                        </button>
                      </div>
                      <div className="bg-[#051020] border border-white/10 rounded-xl p-4 font-mono text-sm">
                        <div className="text-white/20 mb-1 text-xs"># Replace with your actual values from the Supabase dashboard</div>
                        <div><span className="text-blue-400">NEXT_PUBLIC_SUPABASE_URL</span><span className="text-white/40">=</span><span className="text-yellow-300">https://your-project-ref.supabase.co</span></div>
                        <div><span className="text-blue-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span><span className="text-white/40">=</span><span className="text-yellow-300">eyJhbGci...your_anon_key</span></div>
                        <div><span className="text-blue-400">SUPABASE_SERVICE_ROLE_KEY</span><span className="text-white/40">=</span><span className="text-yellow-300">eyJhbGci...your_service_key</span></div>
                      </div>
                      <div className="mt-2 text-white/25 text-xs">
                        ⚠ Never share your service role key or commit .env.local to GitHub. It&apos;s already in .gitignore.
                      </div>
                    </div>
                  )}

                  {step.action && (
                    <a
                      href={step.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 bg-[#f5a623]/20 hover:bg-[#f5a623]/30 border border-[#f5a623]/30 text-[#f5a623] font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
                    >
                      <ExternalLink size={14} /> {step.action.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schema reminder */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-black mb-2 flex items-center gap-2">
          <Database size={16} className="text-[#f5a623]" /> Schema file location
        </h3>
        <p className="text-white/40 text-sm mb-3">
          The full SQL schema is at:
        </p>
        <div className="bg-[#051020] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-green-400 flex items-center justify-between">
          <span>C:\Users\azeez\Downloads\Scholars Challenge\supabase_schema.sql</span>
          <CopyBtn text="C:\Users\azeez\Downloads\Scholars Challenge\supabase_schema.sql" />
        </div>
        <p className="text-white/30 text-xs mt-3">
          Paste the full contents into the Supabase SQL Editor and click Run. This creates all tables needed for questions, teams, pools, buzzer rounds, and scores.
        </p>
      </div>
    </div>
  );
}
