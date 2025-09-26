import { useState, useEffect } from 'react';
import { AuthDialog } from "@/components/AuthDialog";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import { Navbar } from "@/components/Navbar";

const queryClient = new QueryClient();

const App = () => {
  const [authOpen, setAuthOpen] = useState(false);

  // Listen for Login button click in Navbar
  // Use event delegation for simplicity
  // This works because the Login button has id="open-auth-dialog"
  // You can replace with context or a better state management if needed
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.id === "open-auth-dialog") {
        setAuthOpen(true);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
