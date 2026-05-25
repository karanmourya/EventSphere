"use client";

import { motion } from "framer-motion";

interface EventDescriptionProps {
  description: string;
}

export function EventDescription({ description }: EventDescriptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border bg-card p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">About</h2>
      <div className="prose max-w-none text-foreground/80">
        {description.split("\n").map((paragraph, i) => (
          <p key={i} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
