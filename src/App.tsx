import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlanProvider } from "@/contexts/PlanContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MapProvider } from "@/contexts/MapContext";
import { DataProvider } from "@/contexts/DataContext";
import { GarageProvider } from "@/contexts/GarageContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivacySafetySettings from "./pages/PrivacySafetySettings";
import NotificationSettings from "./pages/NotificationSettings";
import AppPreferencesSettings from "./pages/AppPreferencesSettings";
import AccountSettings from "./pages/AccountSettings";
import SocialDiscoverySettings from "./pages/SocialDiscoverySettings";
import PlanBillingSettings from "./pages/PlanBillingSettings";
import FAQSettings from "./pages/FAQSettings";
import HowToUseSettings from "./pages/HowToUseSettings";
import SupportLegalSettings from "./pages/SupportLegalSettings";
import Upgrade from "./pages/Upgrade";
import MyGarage from "./pages/MyGarage";
import MyFriends from "./pages/MyFriends";
import MyEvents from "./pages/MyEvents";
import MyRoutes from "./pages/MyRoutes";
import MyDiscussions from "./pages/MyDiscussions";
import Community from "./pages/Community";
import Forums from "./pages/Forums";
import CreateForumPost from "./pages/CreateForumPost";
import ForumThread from "./pages/ForumThread";
import Clubs from "./pages/Clubs";
import MyClubs from "./pages/MyClubs";
import ClubSettings from "./pages/ClubSettings";
import ClubJoinRequest from "./pages/ClubJoinRequest";
import ClubProfile from "./pages/ClubProfile";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import AddEvent from "./pages/AddEvent";
import AddRoute from "./pages/AddRoute";
import AddService from "./pages/AddService";
import AddClub from "./pages/AddClub";
import AddVehicle from "./pages/AddVehicle";

import RouteDetail from "./pages/RouteDetail";
import EventDetail from "./pages/EventDetail";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Permissions from "./pages/Permissions";
import Notifications from "./pages/Notifications";
import EventsList from "./pages/EventsList";
import RoutesList from "./pages/RoutesList";
import ServicesList from "./pages/ServicesList";
import MySavedServices from "./pages/MySavedServices";

// Auth + Onboarding screens
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import ChoosePlan from "./pages/ChoosePlan";
import DevTools from "./pages/DevTools";
import StolenVehicles from "./pages/StolenVehicles";
import UserProfile from "./pages/UserProfile";
import PaymentSuccess from "./pages/PaymentSuccess";
import NavigationPage from "./pages/Navigation";
import You from "./pages/You";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <GarageProvider>
    <PlanProvider>
    <DataProvider>
    <MapProvider>
    <NavigationProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth (not protected) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/choose-plan" element={<ChoosePlan />} />

          {/* Onboarding (not protected) */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Legacy auth routes redirect to /auth */}
          <Route path="/auth/signup" element={<Auth />} />
          <Route path="/auth/login" element={<Auth />} />
          <Route path="/auth/forgot" element={<Auth />} />
          <Route path="/auth/verify" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/you" element={<ProtectedRoute><You /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySafetySettings /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
          <Route path="/settings/preferences" element={<ProtectedRoute><AppPreferencesSettings /></ProtectedRoute>} />
          <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/settings/billing" element={<ProtectedRoute><PlanBillingSettings /></ProtectedRoute>} />
          <Route path="/settings/social" element={<ProtectedRoute><SocialDiscoverySettings /></ProtectedRoute>} />
          <Route path="/settings/faq" element={<ProtectedRoute><FAQSettings /></ProtectedRoute>} />
          <Route path="/settings/howto" element={<ProtectedRoute><HowToUseSettings /></ProtectedRoute>} />
          <Route path="/settings/support" element={<ProtectedRoute><SupportLegalSettings /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path="/my-garage" element={<ProtectedRoute><MyGarage /></ProtectedRoute>} />
          <Route path="/my-friends" element={<ProtectedRoute><MyFriends /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/my-routes" element={<ProtectedRoute><MyRoutes /></ProtectedRoute>} />
          <Route path="/my-services" element={<ProtectedRoute><MySavedServices /></ProtectedRoute>} />
          <Route path="/my-discussions" element={<ProtectedRoute><MyDiscussions /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
          <Route path="/forums/create" element={<ProtectedRoute><CreateForumPost /></ProtectedRoute>} />
          <Route path="/forums/thread/:id" element={<ProtectedRoute><ForumThread /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
          <Route path="/my-clubs" element={<ProtectedRoute><MyClubs /></ProtectedRoute>} />
          <Route path="/club/:clubId" element={<ProtectedRoute><ClubProfile /></ProtectedRoute>} />
          <Route path="/club/:clubId/settings" element={<ProtectedRoute><ClubSettings /></ProtectedRoute>} />
          <Route path="/club/:clubId/join" element={<ProtectedRoute><ClubJoinRequest /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
          <Route path="/add/event" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
          <Route path="/add/route" element={<ProtectedRoute><AddRoute /></ProtectedRoute>} />
          <Route path="/add/service" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
          <Route path="/add/club" element={<ProtectedRoute><AddClub /></ProtectedRoute>} />
          <Route path="/add/vehicle" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
          <Route path="/route/:id" element={<ProtectedRoute><RouteDetail /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
          <Route path="/service/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute><RoutesList /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServicesList /></ProtectedRoute>} />
          <Route path="/settings/devtools" element={<ProtectedRoute><DevTools /></ProtectedRoute>} />
          <Route path="/stolen-vehicles" element={<ProtectedRoute><StolenVehicles /></ProtectedRoute>} />
          <Route path="/user/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/navigation" element={<ProtectedRoute><NavigationPage /></ProtectedRoute>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </NavigationProvider>
    </MapProvider>
    </DataProvider>
    </PlanProvider>
    </GarageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
