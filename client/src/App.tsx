import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AudioProvider } from "./contexts/AudioContext";
import SiteHeader from "./components/SiteHeader";
import StickyPlayer from "./components/StickyPlayer";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";

const Elections = lazy(() => import("./pages/Elections"));
const Podcast = lazy(() => import("./pages/Podcast"));
const ArchivePage = lazy(() => import("./pages/Archive"));
const AdminPage = lazy(() => import("./pages/Admin"));
const SearchPage = lazy(() => import("./pages/Search"));
const WorldPage = lazy(() => import("./pages/World"));
const AtlasPage = lazy(() => import("./pages/Atlas"));
const NewsConceptPreview = lazy(() => import("./pages/NewsConceptPreview"));
const HomepageExample = lazy(() => import("./pages/HomepageExample"));

function Router() {
  return (
    <Switch>
      <Route path={"/"}><Home /></Route>
      <Route path={"/elections"}>
        <Suspense fallback={<PageLoader />}><Elections /></Suspense>
      </Route>
      <Route path={"/podcast"}>
        <Suspense fallback={<PageLoader />}><Podcast /></Suspense>
      </Route>
      <Route path={"/archive"}>
        <Suspense fallback={<PageLoader />}><ArchivePage /></Suspense>
      </Route>
      <Route path={"/admin"}>
        <Suspense fallback={<PageLoader />}><AdminPage /></Suspense>
      </Route>
      <Route path={"/search"}>
        <Suspense fallback={<PageLoader />}><SearchPage /></Suspense>
      </Route>
      <Route path={"/world"}>
        <Suspense fallback={<PageLoader />}><WorldPage /></Suspense>
      </Route>
      <Route path={"/atlas"}>
        <Suspense fallback={<PageLoader />}><AtlasPage /></Suspense>
      </Route>
      <Route path={"/news-mockup"}>
        <Suspense fallback={<PageLoader />}><NewsConceptPreview /></Suspense>
      </Route>
      <Route path={"/news-concept"}>
        <Suspense fallback={<PageLoader />}><NewsConceptPreview /></Suspense>
      </Route>
      <Route path={"/homepage-example"}>
        <Suspense fallback={<PageLoader />}><HomepageExample /></Suspense>
      </Route>
      <Route path={"/colors"}>
        <Suspense fallback={<PageLoader />}><ColorPreview /></Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <SiteHeader />
            <main className="pb-20">
              <Router />
            </main>
            <StickyPlayer />
          </TooltipProvider>
        </AudioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
const ColorPreview = lazy(() => import("./pages/ColorPreview"));
