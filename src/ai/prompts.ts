/**
 * Base prompt for tech stack analysis
 */
export const BASE_TECH_STACK_PROMPT = `As a technical expert, analyze this project's tech stack and provide a clear, professional description.
Focus on how the technologies work together and their benefits.
Keep the descriptions concise but informative, suitable for a CV or project documentation.`;

/**
 * Prompt for Node.js project analysis
 */
export const NODE_ANALYSIS_PROMPT = `Analyze the following Node.js project dependencies and provide insights about:
1. The main frameworks and libraries used
2. The development and build tooling
3. Testing and quality assurance tools with testing frameworks
4. Any notable patterns or architectural choices suggested by the dependencies

Dependencies:
{{dependencies}}

Please provide a professional summary that would be suitable for a project description or CV.`;

/**
 * Prompt for Python project analysis
 */
export const PYTHON_ANALYSIS_PROMPT = `Analyze the following Python project dependencies and provide insights about:
1. The main frameworks and libraries used
2. Data processing and data processing capabilities
3. Testing and development tools
4. Any notable patterns or architectural choices suggested by the dependencies

Dependencies:
{{dependencies}}

Please provide a professional summary that would be suitable for a project description or CV.`;

/**
 * Prompt for dependency categorization
 */
export const CATEGORIZATION_PROMPT = `Categorize the following dependencies into meaningful groups:
{{dependencies}}

Group them into appropriate categories such as:
- Frontend Frameworks
- Backend Frameworks
- Testing Tools
- Build Tools
- Database
- Utilities
etc.

Consider the following guidelines:
1. Create logical groupings based on primary purpose
2. Place multi-purpose libraries in their most common use case
3. Create new categories if needed for specialized tools
4. Ensure each dependency is categorized appropriately

Return the categorization as a JSON object where each key is a category and the value is an array of dependency names.`;

/**
 * Formats for different output types
 */
export const OUTPUT_FORMATS = {
  markdown: {
    header: '# ',
    subheader: '## ',
    section: '### ',
    list: '- ',
    codeBlock: '```',
  },
  text: {
    header: '',
    subheader: '',
    section: '',
    list: '* ',
    codeBlock: '',
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
