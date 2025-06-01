import { CheckCircle2, CircleDot, Circle } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function StepIndicator({ currentStep, totalSteps, className = "" }: StepIndicatorProps) {
  const definedSteps = [
    { name: "Review Details", description: "Confirm property information" },
    { name: "Update and Analyze", description: "Adjust details & run AI analysis"},
    { name: "Extra Features", description: "Review and dispute property features"},
    { name: "Additional Deductions", description: "Add deductions to your property"},
    { name: "Market Adjustment", description: "Apply housing market decline"},
    { name: "Generate Report", description: "Generate a report"}
  ]

  // Ensure we only use the number of steps indicated by totalSteps
  const stepsToDisplay = definedSteps.slice(0, totalSteps);

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-200">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {stepsToDisplay.map((step, index) => {
            const stepNumber = index + 1
            const isActive = currentStep >= stepNumber
            const isCurrentStep = currentStep === stepNumber

            return (
              <div key={step.name} className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`
                    flex items-center justify-center w-10 h-10 rounded-full 
                    ${isActive ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-500"}
                    transition-all duration-300 ease-in-out z-10
                  `}
                  >
                    {isActive && stepNumber < currentStep ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : isCurrentStep ? (
                      <CircleDot className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>
                </div>
                <div className={`text-sm font-medium ${isActive ? "text-primary" : "text-slate-500"}`}>{step.name}</div>
                <div className="text-xs text-muted-foreground mt-1 text-center max-w-[120px]">{step.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

