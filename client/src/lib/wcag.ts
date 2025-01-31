export interface AccessibilityIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  wcagCriteria: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion: string;
}

export interface AccessibilityResponse {
  issues: AccessibilityIssue[];
  url: string;
}

export const severityColors = {
  critical: "text-red-600 dark:text-red-400",
  serious: "text-orange-600 dark:text-orange-400", 
  moderate: "text-yellow-600 dark:text-yellow-400",
  minor: "text-blue-600 dark:text-blue-400"
};

export const severityIcons = {
  critical: "alert-octagon",
  serious: "alert-triangle",
  moderate: "alert-circle",
  minor: "info"
};
