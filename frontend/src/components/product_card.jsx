"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2, Pencil, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

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
}) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTarget, setNewTarget] = useState(targetPrice || "");

  const priceColor =
    targetPrice && price > targetPrice ? "text-red-600" : "text-green-600";

  const handleViewProduct = () => {
    if (link && typeof window !== "undefined") {
      window.open(link, "_blank");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully ✅");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product ❌");
    }
  };

  const handleEdit = async () => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { targetPrice: Number(newTarget) });
      toast.success("Target price updated ✅");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update target price ❌");
    }
  };

  return (
    <Card className="group w-full sm:w-72 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl flex flex-col">
      {/* Product Image */}
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square overflow-hidden rounded-t-xl bg-gray-100 flex items-center justify-center">
          {loading ? (
            <Spinner className="w-10 h-10 text-gray-400" />
          ) : image ? (
            <Image
              src={image}
              alt={name || "Product image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-gray-400 font-medium text-sm sm:text-base">
              No Image
            </div>
          )}
        </div>
      </CardHeader>

      {/* Product Info */}
      <CardContent className="px-3 sm:px-4 py-2 sm:py-3">
        <CardTitle
          className="text-sm sm:text-base font-semibold text-slate-800 truncate"
          title={name}
        >
          {name || "Sample Product"}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap gap-2 items-center">
          {targetPrice && (
            <span className="line-through text-gray-400">
              ₹{targetPrice.toLocaleString()}
            </span>
          )}

          <span
            className={`font-semibold ${
              targetPrice
                ? price > targetPrice
                  ? "text-red-600"
                  : "text-green-600"
                : "text-slate-800"
            }`}
          >
            ₹{price?.toLocaleString() || "--"}
          </span>

          {targetPrice && price && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                price > targetPrice ? "text-red-500" : "text-green-500"
              }`}
            >
              {price > targetPrice ? (
                <ArrowUp size={10} className="text-red-500" />
              ) : (
                <ArrowDown size={10} className="text-green-500" />
              )}
              {Math.abs(((price - targetPrice) / targetPrice) * 100).toFixed(1)}%
            </span>
          )}
        </CardDescription>
      </CardContent>

      {/* Footer Buttons */}
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3">
        <Button
          variant="secondary"
          className="w-full sm:flex-1 flex items-center justify-center gap-2 text-sm sm:text-base"
          onClick={handleViewProduct}
        >
          <ExternalLink size={14} />
          View
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:flex-1 text-sm sm:text-base">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg w-full rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                {name}
              </DialogTitle>
              <CardDescription className="mt-1 sm:mt-2 text-sm">
                <span className="font-medium">Today’s Price:</span>{" "}
                <span className={priceColor}>
                  ₹{price?.toLocaleString() || "--"}
                </span>
              </CardDescription>
            </DialogHeader>

            {/* Chart */}
            {priceHistory.length > 0 ? (
              <div className="h-48 sm:h-64 w-full mt-3 sm:mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="price" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    {targetPrice && (
                      <ReferenceLine
                        y={targetPrice}
                        stroke="gray"
                        strokeDasharray="3 3"
                        label={{
                          position: "right",
                          value: `Target ₹${targetPrice}`,
                          fill: "gray",
                          fontSize: 10,
                        }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm mt-3 text-center">
                No price history available.
              </p>
            )}

            {/* Edit/Delete (optional future use) */}
            {/* <div className="flex justify-between items-center mt-4 sm:mt-6">
              {editMode ? (
                <div className="flex gap-2 items-center w-full">
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm w-2/3"
                    placeholder="Enter new target"
                  />
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white text-xs sm:text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                    className="text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 text-xs sm:text-sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-1 text-xs sm:text-sm"
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </>
              )}
            </div> */}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
