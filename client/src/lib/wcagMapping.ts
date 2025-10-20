/**
 * WCAG Success Criteria Mapping
 * Maps WCAG criterion codes to human-readable names and documentation URLs
 * Based on WCAG 2.2 (includes all 2.0, 2.1, and 2.2 criteria)
 */

export interface WCAGCriterion {
  number: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  url: string;
}

export interface WCAGConformance {
  version: string;
  level: 'A' | 'AA' | 'AAA';
  label: string;
}

/**
 * Maps WCAG success criteria codes (e.g., "111") to full details
 */
export const WCAG_CRITERIA: Record<string, WCAGCriterion> = {
  // Principle 1: Perceivable
  '111': {
    number: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html'
  },
  '121': {
    number: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html'
  },
  '122': {
    number: '1.2.2',
    name: 'Captions (Prerecorded)',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html'
  },
  '123': {
    number: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html'
  },
  '124': {
    number: '1.2.4',
    name: 'Captions (Live)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html'
  },
  '125': {
    number: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html'
  },
  '126': {
    number: '1.2.6',
    name: 'Sign Language (Prerecorded)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html'
  },
  '127': {
    number: '1.2.7',
    name: 'Extended Audio Description (Prerecorded)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html'
  },
  '128': {
    number: '1.2.8',
    name: 'Media Alternative (Prerecorded)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html'
  },
  '129': {
    number: '1.2.9',
    name: 'Audio-only (Live)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html'
  },
  '131': {
    number: '1.3.1',
    name: 'Info and Relationships',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html'
  },
  '132': {
    number: '1.3.2',
    name: 'Meaningful Sequence',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html'
  },
  '133': {
    number: '1.3.3',
    name: 'Sensory Characteristics',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html'
  },
  '134': {
    number: '1.3.4',
    name: 'Orientation',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/orientation.html'
  },
  '135': {
    number: '1.3.5',
    name: 'Identify Input Purpose',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html'
  },
  '136': {
    number: '1.3.6',
    name: 'Identify Purpose',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html'
  },
  '141': {
    number: '1.4.1',
    name: 'Use of Color',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html'
  },
  '142': {
    number: '1.4.2',
    name: 'Audio Control',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html'
  },
  '143': {
    number: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'
  },
  '144': {
    number: '1.4.4',
    name: 'Resize Text',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html'
  },
  '145': {
    number: '1.4.5',
    name: 'Images of Text',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html'
  },
  '146': {
    number: '1.4.6',
    name: 'Contrast (Enhanced)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html'
  },
  '147': {
    number: '1.4.7',
    name: 'Low or No Background Audio',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html'
  },
  '148': {
    number: '1.4.8',
    name: 'Visual Presentation',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html'
  },
  '149': {
    number: '1.4.9',
    name: 'Images of Text (No Exception)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html'
  },
  '1410': {
    number: '1.4.10',
    name: 'Reflow',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html'
  },
  '1411': {
    number: '1.4.11',
    name: 'Non-text Contrast',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html'
  },
  '1412': {
    number: '1.4.12',
    name: 'Text Spacing',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html'
  },
  '1413': {
    number: '1.4.13',
    name: 'Content on Hover or Focus',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html'
  },

  // Principle 2: Operable
  '211': {
    number: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html'
  },
  '212': {
    number: '2.1.2',
    name: 'No Keyboard Trap',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html'
  },
  '213': {
    number: '2.1.3',
    name: 'Keyboard (No Exception)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html'
  },
  '214': {
    number: '2.1.4',
    name: 'Character Key Shortcuts',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html'
  },
  '221': {
    number: '2.2.1',
    name: 'Timing Adjustable',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html'
  },
  '222': {
    number: '2.2.2',
    name: 'Pause, Stop, Hide',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html'
  },
  '223': {
    number: '2.2.3',
    name: 'No Timing',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html'
  },
  '224': {
    number: '2.2.4',
    name: 'Interruptions',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html'
  },
  '225': {
    number: '2.2.5',
    name: 'Re-authenticating',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html'
  },
  '226': {
    number: '2.2.6',
    name: 'Timeouts',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html'
  },
  '231': {
    number: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html'
  },
  '232': {
    number: '2.3.2',
    name: 'Three Flashes',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html'
  },
  '233': {
    number: '2.3.3',
    name: 'Animation from Interactions',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html'
  },
  '241': {
    number: '2.4.1',
    name: 'Bypass Blocks',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html'
  },
  '242': {
    number: '2.4.2',
    name: 'Page Titled',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html'
  },
  '243': {
    number: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html'
  },
  '244': {
    number: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html'
  },
  '245': {
    number: '2.4.5',
    name: 'Multiple Ways',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html'
  },
  '246': {
    number: '2.4.6',
    name: 'Headings and Labels',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html'
  },
  '247': {
    number: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html'
  },
  '248': {
    number: '2.4.8',
    name: 'Location',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/location.html'
  },
  '249': {
    number: '2.4.9',
    name: 'Link Purpose (Link Only)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html'
  },
  '2410': {
    number: '2.4.10',
    name: 'Section Headings',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html'
  },
  '2411': {
    number: '2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html'
  },
  '2412': {
    number: '2.4.12',
    name: 'Focus Not Obscured (Enhanced)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html'
  },
  '2413': {
    number: '2.4.13',
    name: 'Focus Appearance',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html'
  },
  '251': {
    number: '2.5.1',
    name: 'Pointer Gestures',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html'
  },
  '252': {
    number: '2.5.2',
    name: 'Pointer Cancellation',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html'
  },
  '253': {
    number: '2.5.3',
    name: 'Label in Name',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html'
  },
  '254': {
    number: '2.5.4',
    name: 'Motion Actuation',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html'
  },
  '255': {
    number: '2.5.5',
    name: 'Target Size (Enhanced)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html'
  },
  '256': {
    number: '2.5.6',
    name: 'Concurrent Input Mechanisms',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html'
  },
  '257': {
    number: '2.5.7',
    name: 'Dragging Movements',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html'
  },
  '258': {
    number: '2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'
  },

  // Principle 3: Understandable
  '311': {
    number: '3.1.1',
    name: 'Language of Page',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html'
  },
  '312': {
    number: '3.1.2',
    name: 'Language of Parts',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html'
  },
  '313': {
    number: '3.1.3',
    name: 'Unusual Words',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html'
  },
  '314': {
    number: '3.1.4',
    name: 'Abbreviations',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html'
  },
  '315': {
    number: '3.1.5',
    name: 'Reading Level',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html'
  },
  '316': {
    number: '3.1.6',
    name: 'Pronunciation',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html'
  },
  '321': {
    number: '3.2.1',
    name: 'On Focus',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html'
  },
  '322': {
    number: '3.2.2',
    name: 'On Input',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input.html'
  },
  '323': {
    number: '3.2.3',
    name: 'Consistent Navigation',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html'
  },
  '324': {
    number: '3.2.4',
    name: 'Consistent Identification',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html'
  },
  '325': {
    number: '3.2.5',
    name: 'Change on Request',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html'
  },
  '326': {
    number: '3.2.6',
    name: 'Consistent Help',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html'
  },
  '331': {
    number: '3.3.1',
    name: 'Error Identification',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html'
  },
  '332': {
    number: '3.3.2',
    name: 'Labels or Instructions',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html'
  },
  '333': {
    number: '3.3.3',
    name: 'Error Suggestion',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html'
  },
  '334': {
    number: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html'
  },
  '335': {
    number: '3.3.5',
    name: 'Help',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/help.html'
  },
  '336': {
    number: '3.3.6',
    name: 'Error Prevention (All)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html'
  },
  '337': {
    number: '3.3.7',
    name: 'Redundant Entry',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html'
  },
  '338': {
    number: '3.3.8',
    name: 'Accessible Authentication (Minimum)',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html'
  },
  '339': {
    number: '3.3.9',
    name: 'Accessible Authentication (Enhanced)',
    level: 'AAA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html'
  },

  // Principle 4: Robust
  '412': {
    number: '4.1.2',
    name: 'Name, Role, Value',
    level: 'A',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html'
  },
  '413': {
    number: '4.1.3',
    name: 'Status Messages',
    level: 'AA',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html'
  }
};

/**
 * Maps conformance level tags (e.g., "2a", "21aa") to full details
 */
export const WCAG_CONFORMANCE: Record<string, WCAGConformance> = {
  '2a': { version: '2.0', level: 'A', label: 'WCAG 2.0 Level A' },
  '2aa': { version: '2.0', level: 'AA', label: 'WCAG 2.0 Level AA' },
  '2aaa': { version: '2.0', level: 'AAA', label: 'WCAG 2.0 Level AAA' },
  '21a': { version: '2.1', level: 'A', label: 'WCAG 2.1 Level A' },
  '21aa': { version: '2.1', level: 'AA', label: 'WCAG 2.1 Level AA' },
  '21aaa': { version: '2.1', level: 'AAA', label: 'WCAG 2.1 Level AAA' },
  '22a': { version: '2.2', level: 'A', label: 'WCAG 2.2 Level A' },
  '22aa': { version: '2.2', level: 'AA', label: 'WCAG 2.2 Level AA' },
  '22aaa': { version: '2.2', level: 'AAA', label: 'WCAG 2.2 Level AAA' }
};

/**
 * Parses a WCAG tag from Axe-core and returns structured information
 * @param tag - Tag from Axe-core (e.g., "wcag2a", "wcag412", "wcag21aa")
 * @returns Parsed WCAG information or null if not a WCAG tag
 */
export function parseWCAGTag(tag: string): WCAGCriterion | WCAGConformance | null {
  if (!tag.startsWith('wcag')) {
    return null;
  }

  const code = tag.substring(4); // Remove "wcag" prefix

  // Check if it's a success criterion (contains only digits)
  if (/^\d+$/.test(code)) {
    return WCAG_CRITERIA[code] || null;
  }

  // Check if it's a conformance level tag
  return WCAG_CONFORMANCE[code] || null;
}

/**
 * Formats WCAG criteria for display
 * @param tags - Array of WCAG tags from Axe-core
 * @returns Object with separated criteria and conformance info
 */
export function formatWCAGTags(tags: string[]) {
  const criteria: WCAGCriterion[] = [];
  const conformance: WCAGConformance[] = [];

  tags
    .filter(tag => tag.startsWith('wcag'))
    .forEach(tag => {
      const parsed = parseWCAGTag(tag);
      if (parsed) {
        if ('number' in parsed) {
          criteria.push(parsed);
        } else {
          conformance.push(parsed);
        }
      }
    });

  return { criteria, conformance };
}
