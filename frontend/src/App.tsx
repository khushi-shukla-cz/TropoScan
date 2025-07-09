import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import TrendingPatterns from "./pages/TrendingPatterns";
import NotFound from "./pages/NotFound";

const CycloneSimulator = lazy(() => import("./pages/CycloneSimulator"));
const Notifications = lazy(() => import("./pages/Notifications"));
const EmergencyOverview = lazy(() => import("./pages/EmergencyOverview"));
const EmergencyContacts = lazy(() => import("./pages/EmergencyContacts"));
const EvacuationCenters = lazy(() => import("./pages/EvacuationCenters"));
const DisasterPreparedness = lazy(() => import("./pages/DisasterPreparedness"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/trending" element={<TrendingPatterns />} />
            <Route path="/cyclone-simulator" element={
              <Suspense fallback={<div>Loading...</div>}>
                <CycloneSimulator />
              </Suspense>
            } />
            <Route path="/notifications" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Notifications />
              </Suspense>
            } />
            <Route path="/emergency" element={
              <Suspense fallback={<div>Loading...</div>}>
                <EmergencyOverview />
              </Suspense>
            } />
            <Route path="/emergency/contacts" element={
              <Suspense fallback={<div>Loading...</div>}>
                <EmergencyContacts />
              </Suspense>
            } />
            <Route path="/emergency/evacuation" element={
              <Suspense fallback={<div>Loading...</div>}>
                <EvacuationCenters />
              </Suspense>
            } />
            <Route path="/emergency/preparedness" element={
              <Suspense fallback={<div>Loading...</div>}>
                <DisasterPreparedness />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
