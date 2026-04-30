"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  Pencil,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border/40 shadow-xl">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          ₹{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function ProductCard({
  id,
  name,
  price,
  lastPrice,
  targetPrice,
  image,
  link,
  loading,
  priceHistory = [],
  index = 0,
}) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTarget, setNewTarget] = useState(targetPrice || "");

  const isAboveTarget = targetPrice && price > targetPrice;
  const isBelowTarget = targetPrice && price && price <= targetPrice;
  const priceChange = lastPrice && price ? price - lastPrice : 0;
  const priceChangePercent =
    lastPrice && price ? ((price - lastPrice) / lastPrice) * 100 : 0;

  const handleViewProduct = () => {
    if (link && typeof window !== "undefined") {
      window.open(link, "_blank");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = async () => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { targetPrice: Number(newTarget) });
      toast.success("Target price updated");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update target price");
    }
  };

  return (
    <div
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      <Card className="group glass-card rounded-2xl border-border/30 shadow-none hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col overflow-hidden">
        {/* ─── Product Image ─── */}
        <CardHeader className="p-0">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-card to-background flex items-center justify-center">
            {/* Status Badge */}
            {targetPrice && price > 0 && (
              <div
                className={`absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                  isBelowTarget
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/20"
                }`}
              >
                {isBelowTarget ? (
                  <TrendingDown size={10} />
                ) : (
                  <TrendingUp size={10} />
                )}
                {isBelowTarget ? "Below Target" : "Above Target"}
              </div>
            )}

            {loading ? (
              <Spinner className="w-10 h-10 text-muted-foreground" />
            ) : image ? (
              <Image
                src={image}
                alt={name || "Product image"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="text-muted-foreground font-medium text-sm flex flex-col items-center gap-2">
                <Package className="w-8 h-8 opacity-40" />
                <span className="text-xs">No Image</span>
              </div>
            )}

            {/* Image Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </CardHeader>

        {/* ─── Product Info ─── */}
        <CardContent className="px-4 py-3 flex-1">
          <CardTitle
            className="text-sm font-semibold text-foreground truncate leading-snug"
            title={name}
          >
            {name || "Sample Product"}
          </CardTitle>

          <div className="flex items-baseline gap-2.5 mt-2">
            {/* Current Price */}
            <span
              className={`text-xl font-bold ${
                isBelowTarget
                  ? "text-emerald-400"
                  : isAboveTarget
                  ? "text-rose-400"
                  : "text-foreground"
              }`}
            >
              ₹{price?.toLocaleString() || "--"}
            </span>

            {/* Target Price */}
            {targetPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{targetPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Price Change Indicator */}
          {priceChange !== 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                  priceChange < 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {priceChange < 0 ? (
                  <ArrowDown size={10} />
                ) : (
                  <ArrowUp size={10} />
                )}
                {Math.abs(priceChangePercent).toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                vs last
              </span>
            </div>
          )}

          {/* Mini Sparkline */}
          {priceHistory.length > 1 && (
            <div className="h-10 mt-3 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isBelowTarget ? "#34d399" : "#818cf8"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={isBelowTarget ? "#34d399" : "#818cf8"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isBelowTarget ? "#34d399" : "#818cf8"}
                    strokeWidth={1.5}
                    fill={`url(#spark-${id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>

        {/* ─── Footer Actions ─── */}
        <CardFooter className="flex gap-2 p-3 pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-indigo-500/10 rounded-lg transition-colors"
            onClick={handleViewProduct}
          >
            <ExternalLink size={12} />
            Visit
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border-0 rounded-lg transition-colors"
              >
                <Eye size={12} />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg w-full glass-card rounded-2xl border-border/40">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {name}
                </DialogTitle>

                {/* Price Summary */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="glass rounded-xl px-4 py-3 flex-1 min-w-[120px]">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Current Price
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        isBelowTarget
                          ? "text-emerald-400"
                          : isAboveTarget
                          ? "text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      ₹{price?.toLocaleString() || "--"}
                    </p>
                  </div>
                  <div className="glass rounded-xl px-4 py-3 flex-1 min-w-[120px]">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Target Price
                    </p>
                    {editMode ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={newTarget}
                          onChange={(e) => setNewTarget(e.target.value)}
                          className="h-7 text-sm w-24 bg-background/50 border-border/40"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={handleEdit}
                        >
                          <Check size={13} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:bg-rose-500/10"
                          onClick={() => setEditMode(false)}
                        >
                          <X size={13} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-foreground">
                          ₹{targetPrice?.toLocaleString() || "--"}
                        </p>
                        <button
                          onClick={() => setEditMode(true)}
                          className="text-muted-foreground hover:text-indigo-400 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* ─── Chart ─── */}
              {priceHistory.length > 0 ? (
                <div className="h-56 sm:h-64 w-full mt-4 glass rounded-xl p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Price History
                  </p>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient
                          id={`area-${id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#818cf8"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#818cf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.015 265)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9, fill: "oklch(0.60 0.02 265)", angle: -35, textAnchor: "end", dy: 5 }}
                        axisLine={{ stroke: "oklch(0.28 0.015 265)" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                        height={45}
                        tickMargin={4}
                      />
                      <YAxis
                        dataKey="price"
                        tick={{ fontSize: 10, fill: "oklch(0.60 0.02 265)" }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#818cf8"
                        strokeWidth={2}
                        fill={`url(#area-${id})`}
                      />
                      {targetPrice && (
                        <ReferenceLine
                          y={targetPrice}
                          stroke="#f87171"
                          strokeDasharray="6 4"
                          strokeWidth={1}
                          label={{
                            position: "right",
                            value: `₹${targetPrice.toLocaleString()}`,
                            fill: "#f87171",
                            fontSize: 10,
                          }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="glass rounded-xl py-10 text-center mt-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No price history available yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Check back after the next price refresh
                  </p>
                </div>
              )}

              {/* ─── Dialog Actions ─── */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 gap-1.5 border-border/40 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-sm"
                  onClick={handleViewProduct}
                >
                  <ExternalLink size={13} />
                  Visit Store
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-border/40 hover:border-rose-500/30 hover:bg-rose-500/5 text-rose-400 text-sm"
                  onClick={handleDelete}
                >
                  <Trash2 size={13} />
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
