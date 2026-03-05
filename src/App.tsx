import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlanProvider } from "@/contexts/PlanContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MapProvider } from "@/contexts/MapContext";
import { DataProvider } from "@/contexts/DataContext";
import { GarageProvider } from "@/contexts/GarageContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
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
import ClubProfile from "./pages/ClubProfile";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import AddEvent from "./pages/AddEvent";
import AddRoute from "./pages/AddRoute";
import AddService from "./pages/AddService";
import AddClub from "./pages/AddClub";
import EventDetail from "./pages/EventDetail";
import RouteDetail from "./pages/RouteDetail";
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
import AuthEntry from "./pages/AuthEntry";
import AuthSignup from "./pages/AuthSignup";
import AuthLogin from "./pages/AuthLogin";
import AuthForgot from "./pages/AuthForgot";
import AuthVerify from "./pages/AuthVerify";
import OnboardingFeatures from "./pages/OnboardingFeatures";
import OnboardingVehicle from "./pages/OnboardingVehicle";
import OnboardingNotifications from "./pages/OnboardingNotifications";
import ChoosePlan from "./pages/ChoosePlan";
import DevTools from "./pages/DevTools";

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
          <Route path="/" element={<Index />} />

          {/* Auth */}
          <Route path="/auth" element={<AuthEntry />} />
          <Route path="/auth/signup" element={<AuthSignup />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/forgot" element={<AuthForgot />} />
          <Route path="/auth/verify" element={<AuthVerify />} />
          <Route path="/choose-plan" element={<ChoosePlan />} />

          {/* Onboarding (4-step flow) */}
          <Route path="/onboarding/features" element={<OnboardingFeatures />} />
          <Route path="/onboarding/vehicle" element={<OnboardingVehicle />} />
          <Route path="/onboarding/notifications" element={<OnboardingNotifications />} />

          {/* Legacy auth routes */}
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthSignup />} />
          <Route path="/forgot-password" element={<AuthForgot />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/privacy" element={<PrivacySafetySettings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/preferences" element={<AppPreferencesSettings />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/billing" element={<PlanBillingSettings />} />
          <Route path="/settings/social" element={<SocialDiscoverySettings />} />
          <Route path="/settings/faq" element={<FAQSettings />} />
          <Route path="/settings/howto" element={<HowToUseSettings />} />
          <Route path="/settings/support" element={<SupportLegalSettings />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/my-garage" element={<MyGarage />} />
          <Route path="/my-friends" element={<MyFriends />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/my-routes" element={<MyRoutes />} />
          <Route path="/my-services" element={<MySavedServices />} />
          <Route path="/my-discussions" element={<MyDiscussions />} />
          <Route path="/community" element={<Community />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/forums/create" element={<CreateForumPost />} />
          <Route path="/forums/thread/:id" element={<ForumThread />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/my-clubs" element={<MyClubs />} />
          <Route path="/club/:id" element={<ClubProfile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Conversation />} />
          <Route path="/add/event" element={<AddEvent />} />
          <Route path="/add/route" element={<AddRoute />} />
          <Route path="/add/service" element={<AddService />} />
          <Route path="/add/club" element={<AddClub />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/route/:id" element={<RouteDetail />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/routes" element={<RoutesList />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/settings/devtools" element={<DevTools />} />
          <Route path="*" element={<NotFound />} />
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
