"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Bell,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div
        className={`relative z-10 max-w-2xl mx-auto px-6 text-center transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Icon */}
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 mb-8 animate-pulse-glow">
          <ShoppingBag className="w-10 h-10 text-indigo-400" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            Price Tracker
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
          Monitor e-commerce prices in real-time. Set targets, track trends, and
          never miss a deal again.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: TrendingDown, label: "Price Monitoring" },
            { icon: Bell, label: "Target Alerts" },
            { icon: BarChart3, label: "Trend Charts" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="glass flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground"
            >
              <feature.icon className="w-3.5 h-3.5 text-indigo-400" />
              {feature.label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <Button className="h-12 px-8 text-base gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all rounded-xl group">
            Go to Dashboard
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Button>
        </Link>
      </div>
    </div>
  );
}
