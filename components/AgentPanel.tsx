"use client";

import { Bot, CheckCircle2, Coins, FileCheck2, FileText, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const stages = [
  { label: "Reading match result", detail: "Processing...", icon: FileText },
  { label: "Checking reward policy", detail: "Winner-only rules", icon: ShieldCheck },
  { label: "Sending HBAR", detail: "Testnet payout", icon: Coins },
  { label: "Publishing HCS receipt", detail: "Public receipt rail", icon: FileCheck2 },
];

export function AgentPanel({
  activeStage,
  reasoning,
  running,
}: {
  activeStage: number;
  reasoning?: string;
  running: boolean;
}) {
  return (
    <section className="clay-card relative flex min-h-[24rem] flex-col rounded-[2rem] border-l-4 border-l-[#6fffcd] p-6 lg:min-h-[28rem]">
      <div className="mb-7 flex items-center gap-4 border-b border-[#373243] pb-5">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#006148] text-[#6fffcd] shadow-[inset_0_-5px_0_rgba(0,0,0,0.22)]">
          <Bot className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#e7dff5]">AI Reward Agent</h2>
          <p className="font-ticket text-xs uppercase tracking-[0.16em] text-[#6fffcd]">
            {running ? "Agent thinking" : reasoning ? "Receipt complete" : "Standing by"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const complete = activeStage > index || (!running && activeStage >= stages.length);
          const active = running && Math.min(activeStage, stages.length - 1) === index;

          return (
            <motion.div
              key={stage.label}
              animate={{ opacity: complete || active ? 1 : 0.52, x: active ? 3 : 0 }}
              className="relative flex items-start gap-4"
            >
              {index < stages.length - 1 && <div className="absolute left-4 top-9 h-[calc(100%+1.5rem)] w-0.5 bg-[#373243]" aria-hidden="true" />}
              <div
                className={`relative z-10 grid h-9 w-9 flex-none place-items-center rounded-full border-2 ${
                  complete
                    ? "border-[#6fffcd] bg-[#6fffcd] text-[#003828] shadow-[0_0_18px_rgba(111,255,205,0.4)]"
                    : active
                      ? "border-[#6fffcd] bg-[#373243] text-[#6fffcd]"
                      : "border-[#151120] bg-[#373243] text-[#d6c2c4]"
                }`}
              >
                {complete ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : active ? <Icon className="h-5 w-5" aria-hidden="true" /> : <span className="font-ticket text-sm">{index + 1}</span>}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-[#e7dff5]">{stage.label}</div>
                {(active || complete) && (
                  <div className={`mt-1 font-ticket text-sm tracking-[0.12em] ${active ? "animate-pulse text-[#6fffcd]" : "text-[#d6c2c4]"}`}>
                    {complete ? "Complete" : stage.detail}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {reasoning && (
        <div className="mt-7 rounded-[1.5rem] bg-[#1d1928] p-4 text-sm font-semibold leading-6 text-[#e7dff5] shadow-inner ring-1 ring-[#373243]">
          <div className="mb-2 font-ticket text-xs uppercase tracking-[0.16em] text-[#6fffcd]">Agent reasoning</div>
          {reasoning}
        </div>
      )}
    </section>
  );
}
