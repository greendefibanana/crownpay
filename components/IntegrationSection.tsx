"use client";

import Image from "next/image";
import { Code2, Hand, Server, WalletCards } from "lucide-react";
import type { ElementType } from "react";

const modes = [
  { title: "REST API", tone: "text-[#ffdee3]" },
  { title: "JavaScript SDK", tone: "text-[#6fffcd]" },
  { title: "Manual Demo Mode", tone: "text-[#ffe16d]" },
];

export function IntegrationSection() {
  return (
    <section id="integrations" className="mx-auto w-full max-w-[1440px] px-5 pb-28 md:px-10 md:pb-16">
      <div className="clay-card-raised relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_0%,rgba(255,222,227,0.08),transparent_26rem)]" aria-hidden="true" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="font-ticket text-sm uppercase tracking-[0.18em] text-[#6fffcd]">Seamless integrations</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-[#e7dff5] soft-text-shadow">
              Plug CrownPay into any game loop.
            </h2>
            <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-[#d6c2c4]">
              Connect your game server to CrownPay Agent in minutes. We handle policy checks, HBAR rewards, and the public HCS receipt trail.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {modes.map((mode) => (
                <span key={mode.title} className={`rounded-full border border-[#373243] bg-[#1d1928] px-4 py-2 font-ticket text-xs uppercase tracking-[0.12em] ${mode.tone}`}>
                  {mode.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <FlowNode icon={Server} label="Game Server" />
            <Rail />
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ffb7c5] shadow-[0_0_22px_rgba(255,183,197,0.35)] ring-1 ring-[#ffdee3]">
                <Image src="/crownpay-logo.png" alt="CrownPay logo" width={38} height={38} className="rounded-md" />
              </div>
              <span className="font-ticket text-xs font-bold uppercase tracking-[0.16em] text-[#ffdee3]">Agent</span>
            </div>
            <Rail accent />
            <FlowNode icon={WalletCards} label="Hedera Rewards" accent />
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            icon={Code2}
            title="POST /api/crownpay/reward"
            code={'await fetch("/api/crownpay/reward", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(matchResult),\n});'}
          />
          <CodeBlock
            icon={Hand}
            title="CrownPayMatchResult"
            code={"type CrownPayMatchResult = {\n  matchId: string;\n  gameMode: string;\n  arena: string;\n  players: CrownPayMatchPlayer[];\n  rewardRecipients?: Array<{\n    playerId: string;\n    amountHbar: number;\n    hederaAccountId?: string;\n  }>;\n};"}
          />
        </div>
      </div>
    </section>
  );
}

function FlowNode({ icon: Icon, label, accent = false }: { icon: ElementType; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-[1rem] bg-[#1d1928] shadow-inner ring-1 ring-[#373243]">
        <Icon className={`h-7 w-7 ${accent ? "text-[#6fffcd]" : "text-[#d6c2c4]"}`} aria-hidden="true" />
      </div>
      <span className={`font-ticket text-[0.65rem] uppercase tracking-[0.16em] sm:text-xs ${accent ? "text-[#6fffcd]" : "text-[#d6c2c4]"}`}>{label}</span>
    </div>
  );
}

function Rail({ accent = false }: { accent?: boolean }) {
  return (
    <div className={`relative h-0.5 w-9 rounded-full ${accent ? "bg-[#6fffcd]/30" : "bg-[#ffdee3]/30"} sm:w-16`}>
      <span className={`progress-dot ${accent ? "delay bg-[#6fffcd]" : "bg-[#ffdee3]"} absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full`} />
    </div>
  );
}

function CodeBlock({ icon: Icon, title, code }: { icon: ElementType; title: string; code: string }) {
  return (
    <div className="rounded-[1.5rem] bg-[#100c1a] p-5 ring-1 ring-[#373243]">
      <div className="mb-3 flex items-center gap-2 font-ticket text-xs uppercase tracking-[0.14em] text-[#ffe16d]">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </div>
      <pre className="overflow-x-auto text-xs leading-6 text-[#e7dff5]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
