import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface CheckProgressProps {
  currentStep: number;
  currentUrl?: string;
  progress?: {
    current: number;
    total: number;
  };
}

const steps = [
  "Initializing browser",
  "Navigating to site",
  "Running accessibility analysis"
];

export default function CheckProgress({ currentStep, currentUrl, progress }: CheckProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6"
    >
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="flex items-center gap-3"
        >
          {index < currentStep ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : index === currentStep ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
          <span className={index <= currentStep ? "text-foreground" : "text-muted-foreground"}>
            {step}
            {index === currentStep && currentUrl && (
              <span className="ml-2 text-sm text-muted-foreground">
                Processing: {currentUrl}
                {progress && (
                  <span className="ml-2">
                    ({progress.current}/{progress.total})
                  </span>
                )}
              </span>
            )}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}