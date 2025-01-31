import { AccessibilityIssue, severityColors, severityIcons } from "@/lib/wcag";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface IssueSeverityProps {
  impact: AccessibilityIssue['impact'];
}

export default function IssueSeverity({ impact }: IssueSeverityProps) {
  const IconComponent = Icons[severityIcons[impact] as keyof typeof Icons] as LucideIcon;
  
  return (
    <div className={`inline-flex items-center gap-1 ${severityColors[impact]}`}>
      <IconComponent className="h-4 w-4" />
      <span className="font-medium capitalize">{impact}</span>
    </div>
  );
}
