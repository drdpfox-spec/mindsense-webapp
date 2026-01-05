import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Trends from "./pages/Trends";
import Device from "./pages/Device";
import Alerts from "./pages/Alerts";
import Journal from "./pages/Journal";
import Medications from "./pages/Medications";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import CareTeam from "./pages/CareTeam";
import Demo from "./pages/Demo";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/trends"} component={Trends} />
      <Route path={"/device"} component={Device} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/journal"} component={Journal} />
      <Route path={"/medications"} component={Medications} />
      <Route path={"/insights"} component={Insights} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/care-team"} component={CareTeam} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
