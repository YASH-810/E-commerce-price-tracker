"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Package,
  Target,
  Search,
  LayoutGrid,
  List,
  ShoppingBag,
} from "lucide-react";
import ProductCard from "@/components/product_card";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", link: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Real-time Firestore updates
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    });
    return () => unsub();
  }, []);

  // Computed stats
  const stats = useMemo(() => {
    const total = products.length;
    const belowTarget = products.filter(
      (p) => p.targetPrice && p.price && p.price <= p.targetPrice
    ).length;
    const aboveTarget = products.filter(
      (p) => p.targetPrice && p.price && p.price > p.targetPrice
    ).length;
    const avgSavings =
      products.length > 0
        ? products.reduce((acc, p) => {
            if (p.targetPrice && p.price) {
              return acc + ((p.targetPrice - p.price) / p.targetPrice) * 100;
            }
            return acc;
          }, 0) / products.length
        : 0;

    return { total, belowTarget, aboveTarget, avgSavings };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // ➤ Add a new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.link || !newProduct.price) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: 0,
        targetPrice: Number(newProduct.price),
        link: newProduct.link,
        image: "/spinner.gif",
        createdAt: serverTimestamp(),
      });

      setNewProduct({ name: "", link: "", price: "" });
      setDialogOpen(false);

      await toast.promise(
        fetch("http://127.0.0.1:5000/update-products", {
          method: "POST",
        }),
        {
          loading: "Scraping product data...",
          success: "Product added successfully!",
          error: "Failed to trigger scraper",
        }
      );
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product");
    }
  };

  // ➤ Trigger scraper for all products
  const handleUpdateAllProducts = async () => {
    setLoading(true);
    try {
      await toast.promise(
        fetch("http://127.0.0.1:5000/update-products", { method: "POST" }),
        {
          loading: "Refreshing all prices...",
          success: "Prices will update shortly!",
          error: "Failed to trigger scraper",
        }
      );
    } catch (err) {
      console.error("Error updating products:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Products",
      value: stats.total,
      icon: Package,
      color: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-400",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "Below Target",
      value: stats.belowTarget,
      icon: TrendingDown,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Above Target",
      value: stats.aboveTarget,
      icon: TrendingUp,
      color: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-400",
      borderColor: "border-rose-500/20",
    },
    {
      label: "Avg. Savings",
      value: `${stats.avgSavings.toFixed(1)}%`,
      icon: Target,
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ─── Ambient Background Blobs ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <header className="animate-fade-in-up mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Brand / Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
                  <ShoppingBag className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Dashboard
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Price Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                Monitor prices across platforms. Get notified when they hit your
                target.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 h-10 px-4 border-border/60 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                onClick={handleUpdateAllProducts}
                disabled={loading}
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">
                  {loading ? "Refreshing..." : "Refresh Prices"}
                </span>
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 h-10 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Product</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-md glass-card rounded-2xl border-border/40">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/15">
                        <Plus size={16} className="text-indigo-400" />
                      </div>
                      Add New Product
                    </DialogTitle>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Product Name
                        </label>
                        <Input
                          placeholder="e.g. iPhone 15 Pro Max"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                            })
                          }
                          className="h-10 bg-background/50 border-border/40 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Product URL
                        </label>
                        <Input
                          placeholder="https://amazon.in/dp/..."
                          value={newProduct.link}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              link: e.target.value,
                            })
                          }
                          className="h-10 bg-background/50 border-border/40 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Target Price (₹)
                        </label>
                        <Input
                          placeholder="49,999"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              price: e.target.value,
                            })
                          }
                          className="h-10 bg-background/50 border-border/40 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      <Button
                        className="w-full mt-2 h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                        onClick={handleAddProduct}
                      >
                        <Plus size={15} className="mr-1.5" />
                        Add Product
                      </Button>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {statCards.map((stat, i) => (
            <div
              key={stat.label}
              className={`glass-card rounded-xl p-4 sm:p-5 border ${stat.borderColor} stagger-${i + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground animate-count-up">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Search Bar ─── */}
        <div className="animate-fade-in-up mb-6" style={{ animationDelay: "0.2s" }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-card/50 border-border/40 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20 rounded-xl"
            />
          </div>
        </div>

        {/* ─── Product Grid ─── */}
        {filteredProducts.length === 0 ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/10 mb-5 animate-float">
              <Package className="w-10 h-10 text-indigo-400/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery
                ? "No products match your search"
                : "No products yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different term.`
                : "Start tracking prices by adding your first product. We'll monitor it for you 24/7."}
            </p>
            {!searchQuery && (
              <Button
                className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                onClick={() => setDialogOpen(true)}
              >
                <Plus size={16} />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name || "Unnamed Product"}
                price={product.price || "Loading..."}
                lastPrice={product.lastPrice || product.price || 0}
                targetPrice={product.targetPrice}
                image={product.image}
                link={product.link || "#"}
                priceHistory={product.priceHistory || []}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
