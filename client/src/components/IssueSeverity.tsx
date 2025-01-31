import { AccessibilityIssue, severityColors } from "@/lib/wcag";
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from "lucide-react";

interface IssueSeverityProps {
  impact: AccessibilityIssue['impact'];
}

export default function IssueSeverity({ impact }: IssueSeverityProps) {
  const getIcon = () => {
    switch (impact) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4" />;
      case 'serious':
        return <AlertTriangle className="h-4 w-4" />;
      case 'moderate':
        return <AlertCircle className="h-4 w-4" />;
      case 'minor':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 ${severityColors[impact]}`}>
      {getIcon()}
      <span className="font-medium capitalize">{impact}</span>
    </div>
  );
}