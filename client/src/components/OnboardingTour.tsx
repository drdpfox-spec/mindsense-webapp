import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { OnboardingTooltip, TooltipPosition } from "./OnboardingTooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  route: string;
  position: TooltipPosition;
  elementId?: string; // Optional: ID of element to highlight
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to FibroSense! 👋",
    description:
      "Let's take a quick tour of the app. You'll learn how to monitor your biomarkers, track symptoms, manage medications, and communicate with your care team.",
    route: "/",
    position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  },
  {
    id: "biomarker-cards",
    title: "Biomarker Monitoring",
    description:
      "These cards show your latest biomarker readings. Tap any card to see detailed trends and historical data.",
    route: "/",
    position: { top: "200px", left: "20px", right: "20px" },
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description:
      "Use these buttons to quickly log symptoms, view AI-powered insights, or simulate a new measurement for testing.",
    route: "/",
    position: { bottom: "120px", left: "20px", right: "20px" },
  },
  {
    id: "trends-page",
    title: "Biomarker Trends",
    description:
      "View your biomarker history over time with interactive charts. You can compare multiple biomarkers, select date ranges, and export data to Apple Health or Google Fit.",
    route: "/trends",
    position: { top: "120px", left: "20px", right: "20px" },
  },
  {
    id: "device-management",
    title: "Device Management",
    description:
      "Connect your FibroSense patch here. Monitor battery levels, check connection status, and get alerts when it's time to replace your patch.",
    route: "/device",
    position: { top: "120px", left: "20px", right: "20px" },
  },
  {
    id: "medications",
    title: "Medication Reminders",
    description:
      "Add your medications with custom reminder times. Log doses as taken, missed, or skipped. Track your adherence statistics to stay on top of your treatment plan.",
    route: "/medications",
    position: { top: "120px", left: "20px", right: "20px" },
  },
  {
    id: "journal",
    title: "Health Journal",
    description:
      "Log symptoms, medications, and lifestyle notes. Your journal entries are automatically included in reports shared with your healthcare providers.",
    route: "/journal",
    position: { top: "120px", left: "20px", right: "20px" },
  },
  {
    id: "insights",
    title: "AI-Powered Insights",
    description:
      "Get personalized health recommendations based on your biomarker trends, symptoms, and medication adherence. Our AI analyzes your data to provide actionable insights.",
    route: "/insights",
    position: { top: "120px", left: "20px", right: "20px" },
  },
  {
    id: "bottom-nav",
    title: "Navigation Bar",
    description:
      "Use this navigation bar to quickly switch between different sections of the app. All your key features are just one tap away!",
    route: "/",
    position: { bottom: "80px", left: "20px", right: "20px" },
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description:
      "You've completed the tour! You can restart this tutorial anytime from Settings. Now let's get started with monitoring your health.",
    route: "/",
    position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  },
];

export function OnboardingTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useLocation();
  const { data: onboardingStatus } = trpc.profile.getOnboardingStatus.useQuery();
  const completeOnboarding = trpc.profile.completeOnboarding.useMutation();

  // Auto-start onboarding for new users
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboardingCompleted) {
      setIsActive(true);
    }
  }, [onboardingStatus]);

  // Navigate to the correct route when step changes
  useEffect(() => {
    if (isActive && currentStepIndex < ONBOARDING_STEPS.length) {
      const currentStep = ONBOARDING_STEPS[currentStepIndex];
      if (location !== currentStep.route) {
        setLocation(currentStep.route);
      }
    }
  }, [currentStepIndex, isActive, location, setLocation]);

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = async () => {
    setIsActive(false);
    await completeOnboarding.mutateAsync();
    toast.info("Tutorial Skipped", {
      description: "You can restart the tutorial anytime from Settings.",
    });
  };

  const handleComplete = async () => {
    setIsActive(false);
    await completeOnboarding.mutateAsync();
    toast.success("Welcome to FibroSense!", {
      description: "You're ready to start monitoring your health. 🎉",
    });
  };

  if (!isActive || currentStepIndex >= ONBOARDING_STEPS.length) {
    return null;
  }

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />

      {/* Tooltip */}
      <OnboardingTooltip
        title={currentStep.title}
        description={currentStep.description}
        position={currentStep.position}
        currentStep={currentStepIndex + 1}
        totalSteps={ONBOARDING_STEPS.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onComplete={handleComplete}
        showPrevious={currentStepIndex > 0}
        isLastStep={isLastStep}
      />
    </>
  );
}
