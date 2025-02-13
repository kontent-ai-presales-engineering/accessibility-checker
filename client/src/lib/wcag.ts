import { saveAs } from 'file-saver';

export interface AccessibilityIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  wcagCriteria: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion: string;
  helpUrl?: string;
  category?: string;
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

export function exportToCSV(issues: AccessibilityIssue[], url: string) {
  const headers = [
    'Impact',
    'Message',
    'WCAG Criteria',
    'Element',
    'How to Fix',
    'Category'
  ].join(',');

  const rows = issues.map(issue => {
    return [
      issue.impact,
      `"${issue.message.replace(/"/g, '""')}"`,
      `"${issue.wcagCriteria}"`,
      `"${issue.selector}"`,
      `"${issue.suggestion.replace(/"/g, '""')}"`,
      `"${issue.category || ''}"`,
    ].join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `accessibility-report-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportToJSON(issues: AccessibilityIssue[], url: string) {
  const report = {
    url,
    scanDate: new Date().toISOString(),
    totalIssues: issues.length,
    issuesBySeverity: {
      critical: issues.filter(i => i.impact === 'critical').length,
      serious: issues.filter(i => i.impact === 'serious').length,
      moderate: issues.filter(i => i.impact === 'moderate').length,
      minor: issues.filter(i => i.impact === 'minor').length,
    },
    issues,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  saveAs(blob, `accessibility-report-${new Date().toISOString().split('T')[0]}.json`);
}