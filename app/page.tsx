"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BarChart3, Bell, Gift, HomeIcon, Settings, Target } from "lucide-react";
import { AgentPanel } from "@/components/AgentPanel";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { Hero } from "@/components/Hero";
import { IntegrationSection } from "@/components/IntegrationSection";
import { Leaderboard } from "@/components/Leaderboard";
import { MatchCard } from "@/components/MatchCard";
import { ReceiptCard } from "@/components/ReceiptCard";
import { RewardPolicyCard } from "@/components/RewardPolicyCard";
import { createOpeningMatch, generateMockMatch } from "@/lib/mockMatch";
import type { MatchResult, Receipt, RewardResponse } from "@/lib/types";

export default function Home() {
  const [match, setMatch] = useState<MatchResult>(() => createOpeningMatch());
  const [reward, setReward] = useState<RewardResponse>();
  const [history, setHistory] = useState<Receipt[]>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [rewarding, setRewarding] = useState(false);
  const [error, setError] = useState<string>();
  const [defaultRewardHbar, setDefaultRewardHbar] = useState(0.5);
  const [maxRewardHbar, setMaxRewardHbar] = useState(2);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem("crownpay.receipts");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    });

    fetch("/api/health")
      .then((response) => response.json())
      .then((health: { maxRewardHbar?: number; defaultRewardHbar?: number }) => {
        if (typeof health.maxRewardHbar === "number") {
          setMaxRewardHbar(health.maxRewardHbar);
        }
        if (typeof health.defaultRewardHbar === "number") {
          setDefaultRewardHbar(health.defaultRewardHbar);
        }
      })
      .catch(() => {
        setMaxRewardHbar(2);
        setDefaultRewardHbar(0.5);
      });
  }, []);

  const statusMatch = useMemo(
    () => ({
      ...match,
      status: reward?.success ? "Rewarded" : "Awaiting Agent",
    }) as MatchResult,
    [match, reward?.success],
  );

  function generateMatch() {
    setMatch(generateMockMatch());
    setReward(undefined);
    setError(undefined);
    setActiveStage(0);
    setCelebrating(false);
  }

  async function rewardWinner() {
    setRewarding(true);
    setError(undefined);
    setReward(undefined);

    const ticker = window.setInterval(() => {
      setActiveStage((stage) => Math.min(stage + 1, 4));
    }, 650);

    try {
      const response = await fetch("/api/agent/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.matchId,
          gameMode: match.gameMode,
          arena: match.arena,
          players: match.players,
          winner: match.winner,
          requestedRewardHbar: defaultRewardHbar,
          rewardMode: "podium",
        }),
      });

      const data = (await response.json()) as RewardResponse;
      setReward(data);
      setActiveStage(5);

      if (!response.ok || !data.success) {
        setError(data.error || "Reward agent blocked this payout.");
        return;
      }

      const receipts = data.receipts?.length ? data.receipts : data.receipt ? [data.receipt] : [];
      if (receipts.length) {
        const nextHistory = [...receipts, ...history].slice(0, 6);
        setHistory(nextHistory);
        window.localStorage.setItem("crownpay.receipts", JSON.stringify(nextHistory));
        setCelebrating(true);
        window.setTimeout(() => setCelebrating(false), 1300);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The agent could not be reached.");
    } finally {
      window.clearInterval(ticker);
      setRewarding(false);
    }
  }

  return (
    <main className="neo-stage relative min-h-screen overflow-hidden">
      <ConfettiBurst show={celebrating} />

      <TopNav />

      <section className="relative mx-auto grid max-w-[1440px] content-start gap-6 px-5 py-10 pb-10 md:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
          <Hero onGenerate={generateMatch} onReward={rewardWinner} rewarding={rewarding} />
          </div>
          <div className="lg:col-span-4">
          <MatchCard match={statusMatch} />
          </div>
          <div className="lg:col-span-4">
          <AgentPanel activeStage={activeStage} reasoning={reward?.agentReasoning} running={rewarding} />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[1.5rem] bg-[#93000a]/55 p-4 text-sm text-[#ffdad6] ring-1 ring-[#ffb4ab]/35"
            >
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                <div>
                  <div className="font-black">Reward agent needs attention</div>
                  <div className="mt-1 text-red-50/80">{error}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-3">
          <RewardPolicyCard maxRewardHbar={maxRewardHbar} defaultRewardHbar={defaultRewardHbar} />
          <ReceiptCard reward={reward} match={statusMatch} />
          <Leaderboard receipts={history} />
        </div>
      </section>
      <IntegrationSection />
      <MobileNav />
    </main>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-30 h-20 bg-[#151120]/94 shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Image src="/crownpay-logo.png" alt="CrownPay logo" width={48} height={48} className="h-12 w-12 rounded-xl object-cover shadow-md" priority />
          <span className="truncate text-3xl font-bold text-[#ffdee3] sm:text-4xl">CrownPay Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <IconButton label="Notifications" icon={Bell} />
          <IconButton label="Settings" icon={Settings} />
        </div>
      </div>
    </header>
  );
}

function IconButton({ label, icon: Icon }: { label: string; icon: ElementType }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-[#2c2837] text-[#ffdee3] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.06),inset_-2px_-3px_6px_rgba(0,0,0,0.42)] transition-transform hover:scale-105 active:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#151120]"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

function MobileNav() {
  const items = [
    { label: "Home", icon: HomeIcon, active: true },
    { label: "Missions", icon: Target },
    { label: "Rewards", icon: Gift },
    { label: "Stats", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-20 w-full items-center justify-around rounded-t-[2rem] bg-[#2c2837] px-4 pb-2 shadow-[0_-14px_30px_rgba(0,0,0,0.44)] md:hidden" aria-label="Mobile">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            className={`flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-[1.5rem] px-4 py-2 font-ticket text-xs transition-transform active:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdee3] ${
              item.active ? "-translate-y-2 bg-[#6fffcd] text-[#003828] shadow-[0_5px_0_#00513c]" : "text-[#d6c2c4]/72"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
