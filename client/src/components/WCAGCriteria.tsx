import { ExternalLink } from "lucide-react";
import { parseWCAGTag, type WCAGCriterion, type WCAGConformance } from "@/lib/wcagMapping";
import { Badge } from "@/components/ui/badge";

interface WCAGCriteriaProps {
  wcagTags: string;
  helpUrl?: string;
}

/**
 * Displays WCAG criteria in a user-friendly format with links to documentation
 */
export default function WCAGCriteria({ wcagTags, helpUrl }: WCAGCriteriaProps) {
  if (!wcagTags || wcagTags === 'Not specified') {
    return <span className="text-muted-foreground text-sm">Not specified</span>;
  }

  // Parse comma-separated WCAG tags
  const tags = wcagTags.split(',').filter(Boolean);
  const parsedTags = tags.map(tag => parseWCAGTag(tag.trim())).filter(Boolean);

  // Separate criteria from conformance levels
  const criteria = parsedTags.filter((tag): tag is WCAGCriterion =>
    tag !== null && 'number' in tag
  );
  const conformance = parsedTags.filter((tag): tag is WCAGConformance =>
    tag !== null && 'version' in tag
  );

  // Get the highest conformance level for display
  const highestConformance = conformance.reduce<WCAGConformance | null>((highest, current) => {
    if (!highest) return current;
    const levelPriority = { 'A': 1, 'AA': 2, 'AAA': 3 };
    return levelPriority[current.level] > levelPriority[highest.level] ? current : highest;
  }, null);

  return (
    <div className="space-y-2">
      {/* Success Criteria */}
      {criteria.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {criteria.map((criterion, idx) => (
            <a
              key={idx}
              href={criterion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded border border-blue-200 transition-colors text-sm group"
              title={`View WCAG ${criterion.number} documentation`}
            >
              <span className="font-medium">{criterion.number}</span>
              <span className="text-blue-700">{criterion.name}</span>
              <Badge
                variant="outline"
                className="ml-1 text-xs bg-white border-blue-300 text-blue-800"
              >
                Level {criterion.level}
              </Badge>
              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      )}

      {/* Conformance Level (if no specific criteria found) */}
      {criteria.length === 0 && highestConformance && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gray-50">
            {highestConformance.label}
          </Badge>
        </div>
      )}

      {/* Additional Axe-core Help Link */}
      {helpUrl && (
        <a
          href={helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>More details from Deque University</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
