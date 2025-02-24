/**
 * Base prompt for tech stack analysis
 */
export const BASE_TECH_STACK_PROMPT = `Return ONLY a list of technology names. NO descriptions. NO explanations.`;

/**
 * Prompt for Node.js project analysis
 */
export const NODE_ANALYSIS_PROMPT = `List ONLY the technology names from these dependencies:
{{dependencies}}

Format as:
• Technology1
• Technology2

NO descriptions.
NO explanations.
NO headers.
NO categories.
NO versions.
JUST the list.`;

/**
 * Prompt for Python project analysis
 */
export const PYTHON_ANALYSIS_PROMPT = `List ONLY the technology names from these dependencies:
{{dependencies}}

Format as:
• Technology1
• Technology2

NO descriptions.
NO explanations.
NO headers.
NO categories.
NO versions.
JUST the list.`;

/**
 * Prompt for dependency categorization
 */
export const CATEGORIZATION_PROMPT = `Group these technologies into ONLY these categories:

Technologies:
{{dependencies}}

Categories to use:
• Core Technologies
• Testing
• Development Tools

Rules:
• NO descriptions
• NO explanations
• NO additional categories
• NO headers except category names
• NO versions
• ONLY technology names under each category

Example format:
{
  "Core Technologies": ["tech1", "tech2"],
  "Testing": ["test1", "test2"],
  "Development Tools": ["tool1", "tool2"]
}`;

/**
 * Prompt for filtering by focus area
 */
export const FOCUS_AREA_PROMPT = `Given these technologies:
{{dependencies}}

Filter and return ONLY the technologies that are relevant to the {{focusArea}} area.
Focus area is: {{focusArea}} (frontend, backend, or fullstack)

Rules:
• Return ONLY the technology names that are relevant
• Return as a JSON array of strings
• NO descriptions
• NO explanations
• NO categories`;

/**
 * Prompt for filtering by specific technology
 */
export const TECH_FOCUS_PROMPT = `Given these technologies:
{{dependencies}}

Filter and return ONLY the technologies that are related to {{techFocus}}.
The focus technology is: {{techFocus}}

Consider:
• Core libraries and frameworks
• Testing tools specific to this technology
• Development tools commonly used with this technology
• Related ecosystem packages

Rules:
• Return ONLY the technology names that are relevant
• Return as a JSON array of strings
• NO descriptions
• NO explanations
• NO categories`;

/**
 * Formats for different output types
 */
export const OUTPUT_FORMATS = {
  markdown: {
    header: '',
    subheader: '### ',
    section: '',
    list: '• ',
    codeBlock: '',
  },
  text: {
    header: '',
    subheader: '',
    section: '',
    list: '• ',
    codeBlock: '',
  },
  inline: {
    header: '',
    subheader: '',
    section: '',
    list: '',
    codeBlock: '',
    separator: ', ',
  },
  json: {
    type: 'json_object',
  },
} as const;

/**
 * Replaces template variables in a prompt
 */
export function formatPrompt(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replaceAll(`{{${key}}}`, value),
    template
  );
}
