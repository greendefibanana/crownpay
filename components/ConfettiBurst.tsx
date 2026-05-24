"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 34 }, (_, index) => {
  const angle = (index / 34) * Math.PI * 2;
  const distance = 120 + (index % 6) * 16;
  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotate: index * 21,
    color: ["bg-primary", "bg-secondary", "bg-accent", "bg-emerald-300", "bg-white"][index % 5],
  };
});

export function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center overflow-hidden" aria-hidden="true">
      <motion.div initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="relative h-4 w-4">
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.8 }}
              animate={{
                x: particle.x,
                y: particle.y,
                rotate: particle.rotate,
                opacity: 0,
                scale: [0.9, 1.2, 0.35],
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`absolute left-0 top-0 h-2.5 w-2.5 rounded-[2px] ${particle.color}`}
            />
          ))}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.65 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute -left-2 -top-2 h-8 w-8 rounded-full border border-primary"
          />
        </div>
      </motion.div>
    </div>
  );
}
