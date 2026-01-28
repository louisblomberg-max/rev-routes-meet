import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import Forums from "./pages/Forums";
import CreateForumPost from "./pages/CreateForumPost";
import ForumThread from "./pages/ForumThread";
import Clubs from "./pages/Clubs";
import ClubProfile from "./pages/ClubProfile";
import Marketplace from "./pages/Marketplace";
import AddEvent from "./pages/AddEvent";
import AddRoute from "./pages/AddRoute";
import AddService from "./pages/AddService";
import AddClub from "./pages/AddClub";
import EventDetail from "./pages/EventDetail";
import RouteDetail from "./pages/RouteDetail";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/community" element={<Community />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/forums/create" element={<CreateForumPost />} />
          <Route path="/forums/thread/:id" element={<ForumThread />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/club/:id" element={<ClubProfile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/add/event" element={<AddEvent />} />
          <Route path="/add/route" element={<AddRoute />} />
          <Route path="/add/service" element={<AddService />} />
          <Route path="/add/club" element={<AddClub />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/route/:id" element={<RouteDetail />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
