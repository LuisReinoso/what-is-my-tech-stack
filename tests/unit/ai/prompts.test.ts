import {
  BASE_TECH_STACK_PROMPT,
  NODE_ANALYSIS_PROMPT,
  PYTHON_ANALYSIS_PROMPT,
  CATEGORIZATION_PROMPT,
  FOCUS_AREA_PROMPT,
  TECH_FOCUS_PROMPT,
  OUTPUT_FORMATS,
  formatPrompt,
} from '../../../src/ai/prompts.js';

describe('Prompts', () => {
  describe('BASE_TECH_STACK_PROMPT', () => {
    it('should contain essential instructions', () => {
      expect(BASE_TECH_STACK_PROMPT).toContain('ONLY');
      expect(BASE_TECH_STACK_PROMPT).toContain('technology names');
      expect(BASE_TECH_STACK_PROMPT).toContain('NO descriptions');
      expect(BASE_TECH_STACK_PROMPT).toContain('NO explanations');
    });
  });

  describe('NODE_ANALYSIS_PROMPT', () => {
    it('should contain Node.js specific instructions', () => {
      expect(NODE_ANALYSIS_PROMPT).toContain('ONLY');
      expect(NODE_ANALYSIS_PROMPT).toContain('technology names');
      expect(NODE_ANALYSIS_PROMPT).toContain('{{dependencies}}');
      expect(NODE_ANALYSIS_PROMPT).toContain('NO descriptions');
      expect(NODE_ANALYSIS_PROMPT).toContain('NO explanations');
      expect(NODE_ANALYSIS_PROMPT).toContain('NO headers');
      expect(NODE_ANALYSIS_PROMPT).toContain('NO categories');
      expect(NODE_ANALYSIS_PROMPT).toContain('NO versions');
    });
  });

  describe('PYTHON_ANALYSIS_PROMPT', () => {
    it('should contain Python specific instructions', () => {
      expect(PYTHON_ANALYSIS_PROMPT).toContain('ONLY');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('technology names');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('{{dependencies}}');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('NO descriptions');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('NO explanations');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('NO headers');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('NO categories');
      expect(PYTHON_ANALYSIS_PROMPT).toContain('NO versions');
    });
  });

  describe('CATEGORIZATION_PROMPT', () => {
    it('should contain categorization instructions', () => {
      expect(CATEGORIZATION_PROMPT).toContain('Group these technologies');
      expect(CATEGORIZATION_PROMPT).toContain('Categories to use');
      expect(CATEGORIZATION_PROMPT).toContain('Core Technologies');
      expect(CATEGORIZATION_PROMPT).toContain('Testing');
      expect(CATEGORIZATION_PROMPT).toContain('Development Tools');
      expect(CATEGORIZATION_PROMPT).toContain('{{dependencies}}');
      expect(CATEGORIZATION_PROMPT).toContain('NO descriptions');
      expect(CATEGORIZATION_PROMPT).toContain('NO explanations');
    });
  });

  describe('FOCUS_AREA_PROMPT', () => {
    it('should contain focus area instructions', () => {
      expect(FOCUS_AREA_PROMPT).toContain('Filter and return ONLY');
      expect(FOCUS_AREA_PROMPT).toContain('{{dependencies}}');
      expect(FOCUS_AREA_PROMPT).toContain('{{focusArea}}');
      expect(FOCUS_AREA_PROMPT).toContain('frontend, backend, or fullstack');
      expect(FOCUS_AREA_PROMPT).toContain('JSON array');
      expect(FOCUS_AREA_PROMPT).toContain('NO descriptions');
      expect(FOCUS_AREA_PROMPT).toContain('NO explanations');
      expect(FOCUS_AREA_PROMPT).toContain('NO categories');
    });
  });

  describe('TECH_FOCUS_PROMPT', () => {
    it('should contain tech focus instructions', () => {
      expect(TECH_FOCUS_PROMPT).toContain('Filter and return ONLY');
      expect(TECH_FOCUS_PROMPT).toContain('{{dependencies}}');
      expect(TECH_FOCUS_PROMPT).toContain('{{techFocus}}');
      expect(TECH_FOCUS_PROMPT).toContain('Core libraries and frameworks');
      expect(TECH_FOCUS_PROMPT).toContain('Testing tools');
      expect(TECH_FOCUS_PROMPT).toContain('Development tools');
      expect(TECH_FOCUS_PROMPT).toContain('Related ecosystem packages');
      expect(TECH_FOCUS_PROMPT).toContain('JSON array');
      expect(TECH_FOCUS_PROMPT).toContain('NO descriptions');
      expect(TECH_FOCUS_PROMPT).toContain('NO explanations');
      expect(TECH_FOCUS_PROMPT).toContain('NO categories');
    });
  });

  describe('OUTPUT_FORMATS', () => {
    it('should define markdown format correctly', () => {
      expect(OUTPUT_FORMATS.markdown).toEqual({
        header: '',
        subheader: '### ',
        section: '',
        list: '• ',
        codeBlock: '',
      });
    });

    it('should define text format correctly', () => {
      expect(OUTPUT_FORMATS.text).toEqual({
        header: '',
        subheader: '',
        section: '',
        list: '• ',
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
