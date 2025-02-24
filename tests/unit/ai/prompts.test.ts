import {
  BASE_TECH_STACK_PROMPT,
  NODE_ANALYSIS_PROMPT,
  PYTHON_ANALYSIS_PROMPT,
  CATEGORIZATION_PROMPT,
  OUTPUT_FORMATS,
  formatPrompt,
} from '../../../src/ai/prompts.js';

describe('Prompts', () => {
  describe('BASE_TECH_STACK_PROMPT', () => {
    it('should contain essential instructions', () => {
      expect(BASE_TECH_STACK_PROMPT).toContain('analyze');
      expect(BASE_TECH_STACK_PROMPT).toContain('tech stack');
      expect(BASE_TECH_STACK_PROMPT).toContain('CV');
    });
  });

  describe('NODE_ANALYSIS_PROMPT', () => {
    it('should contain Node.js specific instructions', () => {
      expect(NODE_ANALYSIS_PROMPT).toContain('Node.js');
      expect(NODE_ANALYSIS_PROMPT).toContain('frameworks');
      expect(NODE_ANALYSIS_PROMPT).toContain('testing');
      expect(NODE_ANALYSIS_PROMPT).toContain('{{dependencies}}');
    });
  });

  describe('PYTHON_ANALYSIS_PROMPT', () => {
    it('should contain Python specific instructions', () => {
      expect(PYTHON_ANALYSIS_PROMPT).toContain('Python');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('frameworks');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('data processing');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('{{dependencies}}');
    });
  });

  describe('CATEGORIZATION_PROMPT', () => {
    it('should contain categorization instructions', () => {
      expect(CATEGORIZATION_PROMPT).toContain('Categorize');
      expect(CATEGORIZATION_PROMPT).toContain('Frontend');
      expect(CATEGORIZATION_PROMPT).toContain('Backend');
      expect(CATEGORIZATION_PROMPT).toContain('JSON');
      expect(CATEGORIZATION_PROMPT).toContain('{{dependencies}}');
    });
  });

  describe('OUTPUT_FORMATS', () => {
    it('should define markdown format correctly', () => {
      expect(OUTPUT_FORMATS.markdown).toEqual({
        header: '# ',
        subheader: '## ',
        section: '### ',
        list: '- ',
        codeBlock: '```',
      });
    });

    it('should define text format correctly', () => {
      expect(OUTPUT_FORMATS.text).toEqual({
        header: '',
        subheader: '',
        section: '',
        list: '* ',
        codeBlock: '',
      });
    });

    it('should define json format correctly', () => {
      expect(OUTPUT_FORMATS.json).toEqual({
        type: 'json_object',
      });
    });
  });

  describe('formatPrompt', () => {
    it('should replace template variables', () => {
      const template = 'Hello {{name}}, your age is {{age}}';
      const variables = {
        name: 'John',
        age: '30',
      };

      const result = formatPrompt(template, variables);
      expect(result).toBe('Hello John, your age is 30');
    });

    it('should handle multiple occurrences of the same variable', () => {
      const template = '{{name}} {{name}} {{name}}';
      const variables = {
        name: 'test',
      };

      const result = formatPrompt(template, variables);
      expect(result).toBe('test test test');
    });

    it('should leave unmatched variables unchanged', () => {
      const template = 'Hello {{name}}, {{unmatched}}';
      const variables = {
        name: 'John',
      };

      const result = formatPrompt(template, variables);
      expect(result).toBe('Hello John, {{unmatched}}');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello {{name}}';
      const variables = {};

      const result = formatPrompt(template, variables);
      expect(result).toBe('Hello {{name}}');
    });
  });
});
