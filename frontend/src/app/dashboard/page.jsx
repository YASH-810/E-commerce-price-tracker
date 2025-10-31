"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
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

  // ➤ Add a new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.link || !newProduct.price) {
      toast.error("Please fill all fields ⚠️");
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

      await toast.promise(
        fetch("https://e-commerce-price-tracker.onrender.com/update-products", {
          method: "POST",
        }),
        {
          loading: "Scraping product data...",
          success: "Product added and backend scraping started ✅",
          error: "Failed to trigger scraper ❌",
        }
      );
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product ❌");
    }
  };

  // ➤ Trigger scraper for all products
  const handleUpdateAllProducts = async () => {
    setLoading(true);
    try {
      await toast.promise(
        fetch("http://127.0.0.1:5000/update-products", { method: "POST" }),
        {
          loading: "Updating all products...",
          success: "Scraper triggered — prices will update soon ✅",
          error: "Failed to trigger scraper ❌",
        }
      );
    } catch (err) {
      console.error("Error updating products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {/* Title Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            E-Commerce Price Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and compare prices across platforms in real-time.
          </p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="gap-2 w-full sm:w-auto text-sm sm:text-base"
            onClick={handleUpdateAllProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Updating..." : "Fetch & Update Prices"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto text-sm sm:text-base">
                <Plus size={16} /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                  Add New Product
                </DialogTitle>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Product Name
                    </p>
                    <Input
                      placeholder="Enter product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Product URL
                    </p>
                    <Input
                      placeholder="https://example.com/product"
                      value={newProduct.link}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, link: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Target Price (₹)
                    </p>
                    <Input
                      placeholder="9999"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                    />
                  </div>
                  <Button className="w-full mt-3" onClick={handleAddProduct}>
                    Add Product
                  </Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-center sm:text-left">
          No products yet. Add one to start tracking!
        </p>
      ) : (
        <div
          className="
            grid gap-4 sm:gap-6
            grid-cols-1
            xs:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
          "
        >
          {products.map((product) => (
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
