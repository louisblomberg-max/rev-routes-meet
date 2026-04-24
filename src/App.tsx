import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

// Lazy-loaded pages
const Index = React.lazy(() => import("./pages/Index"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Settings = React.lazy(() => import("./pages/Settings"));
const PrivacySafetySettings = React.lazy(() => import("./pages/PrivacySafetySettings"));
const NotificationSettings = React.lazy(() => import("./pages/NotificationSettings"));
const AppPreferencesSettings = React.lazy(() => import("./pages/AppPreferencesSettings"));
const AccountSettings = React.lazy(() => import("./pages/AccountSettings"));
const SocialDiscoverySettings = React.lazy(() => import("./pages/SocialDiscoverySettings"));
const FAQSettings = React.lazy(() => import("./pages/FAQSettings"));
const HowToUseSettings = React.lazy(() => import("./pages/HowToUseSettings"));
const SupportLegalSettings = React.lazy(() => import("./pages/SupportLegalSettings"));
const MyGarage = React.lazy(() => import("./pages/MyGarage"));
const MyFriends = React.lazy(() => import("./pages/MyFriends"));
const MyEvents = React.lazy(() => import("./pages/MyEvents"));
const MyRoutes = React.lazy(() => import("./pages/MyRoutes"));
const MyDiscussions = React.lazy(() => import("./pages/MyDiscussions"));
const Community = React.lazy(() => import("./pages/Community"));
const Forums = React.lazy(() => import("./pages/Forums"));
const CreateForumPost = React.lazy(() => import("./pages/CreateForumPost"));
const ForumThread = React.lazy(() => import("./pages/ForumThread"));
const Clubs = React.lazy(() => import("./pages/Clubs"));
const MyClubs = React.lazy(() => import("./pages/MyClubs"));
const ClubSettings = React.lazy(() => import("./pages/ClubSettings"));
const ClubJoinRequest = React.lazy(() => import("./pages/ClubJoinRequest"));
const ClubProfile = React.lazy(() => import("./pages/ClubProfile"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const Messages = React.lazy(() => import("./pages/Messages"));
const Conversation = React.lazy(() => import("./pages/Conversation"));
const AddEvent = React.lazy(() => import("./pages/AddEvent"));
const AddRoute = React.lazy(() => import("./pages/AddRoute"));
const AddService = React.lazy(() => import("./pages/AddService"));
const AddClub = React.lazy(() => import("./pages/AddClub"));
const AddVehicle = React.lazy(() => import("./pages/AddVehicle"));
const RouteDetail = React.lazy(() => import("./pages/RouteDetail"));
const EventDetail = React.lazy(() => import("./pages/EventDetail"));
const ServiceDetail = React.lazy(() => import("./pages/ServiceDetail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Permissions = React.lazy(() => import("./pages/Permissions"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const EventsList = React.lazy(() => import("./pages/EventsList"));
const RoutesList = React.lazy(() => import("./pages/RoutesList"));
const ServicesList = React.lazy(() => import("./pages/ServicesList"));
const MySavedServices = React.lazy(() => import("./pages/MySavedServices"));
const ManageServices = React.lazy(() => import("./pages/MyServices"));
const SOSRequest = React.lazy(() => import("./pages/SOSRequest"));
const SosFeed = React.lazy(() => import("./pages/SosFeed"));
const RouteMapView = React.lazy(() => import("./pages/RouteMapView"));
const Auth = React.lazy(() => import("./pages/Auth"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const DevTools = React.lazy(() => import("./pages/DevTools"));
const StolenVehicles = React.lazy(() => import("./pages/StolenVehicles"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const ListingDetail = React.lazy(() => import("./pages/ListingDetail"));
const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const TicketSuccess = React.lazy(() => import("./pages/TicketSuccess"));
const OrganizerDashboard = React.lazy(() => import("./pages/OrganizerDashboard"));
const NavigationPage = React.lazy(() => import("./pages/Navigation"));
const You = React.lazy(() => import("./pages/You"));
const SearchPage = React.lazy(() => import("./pages/Search"));

const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="w-full h-dvh flex items-center justify-center bg-black">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ErrorBoundary>
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
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public legal pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth (not protected) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

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
          <Route path="/settings/social" element={<ProtectedRoute><SocialDiscoverySettings /></ProtectedRoute>} />
          <Route path="/settings/faq" element={<ProtectedRoute><FAQSettings /></ProtectedRoute>} />
          <Route path="/settings/howto" element={<ProtectedRoute><HowToUseSettings /></ProtectedRoute>} />
          <Route path="/settings/support" element={<ProtectedRoute><SupportLegalSettings /></ProtectedRoute>} />
          <Route path="/my-garage" element={<ProtectedRoute><MyGarage /></ProtectedRoute>} />
          <Route path="/my-friends" element={<ProtectedRoute><MyFriends /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/my-routes" element={<ProtectedRoute><MyRoutes /></ProtectedRoute>} />
          <Route path="/my-services" element={<ProtectedRoute><MySavedServices /></ProtectedRoute>} />
          <Route path="/manage-services" element={<ProtectedRoute><ManageServices /></ProtectedRoute>} />
          <Route path="/sos-request/:requestId" element={<ProtectedRoute><SOSRequest /></ProtectedRoute>} />
          <Route path="/sos-feed" element={<ProtectedRoute><SosFeed /></ProtectedRoute>} />
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
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/add/listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/friends" element={<Navigate to="/my-friends" replace />} />
          <Route path="/navigation" element={<ProtectedRoute><NavigationPage /></ProtectedRoute>} />
          <Route path="/route-map" element={<ProtectedRoute><RouteMapView /></ProtectedRoute>} />
          <Route path="/subscription" element={<Navigate to="/" replace />} />
          <Route path="/ticket-success" element={<ProtectedRoute><TicketSuccess /></ProtectedRoute>} />
          <Route path="/event/:id/manage" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </NavigationProvider>
    </MapProvider>
    </DataProvider>
    </PlanProvider>
    </GarageProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
