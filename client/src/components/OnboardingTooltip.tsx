import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export interface TooltipPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

export interface OnboardingTooltipProps {
  title: string;
  description: string;
  position: TooltipPosition;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  showPrevious?: boolean;
  isLastStep?: boolean;
}

export function OnboardingTooltip({
  title,
  description,
  position,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  showPrevious = true,
  isLastStep = false,
}: OnboardingTooltipProps) {
  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-teal-500 p-4 max-w-sm animate-in fade-in slide-in-from-bottom-2"
      style={position}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Skip tutorial"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
        <div
          className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {showPrevious && currentStep > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-600 dark:text-gray-400"
          >
            Skip Tour
          </Button>
          {isLastStep ? (
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Complete
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onNext}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
