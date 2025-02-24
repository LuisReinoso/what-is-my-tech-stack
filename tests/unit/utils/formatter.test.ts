import { OutputFormatter } from '../../../src/utils/formatter.js';
import { AIClient } from '../../../src/ai/openai.js';

type FormatterOptions = {
  showVersions?: boolean;
  focusArea?: string;
  techFocus?: string;
  dependencies?: Array<{
    name: string;
    version: string;
    type?: string;
  }>;
};

// Mock AIClient
jest.mock('../../../src/ai/openai.js');

describe('OutputFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('format', () => {
    const format = (
      content: string,
      type: 'markdown' | 'text' | 'inline' | 'json',
      options?: FormatterOptions
    ): Promise<string> => OutputFormatter.format(content, type, options);

    it('should format content with bullet points', async () => {
      const content = '• react\n• express\n• typescript';
      const result = await format(content, 'text');
      expect(result).toBe('• react\n• express\n• typescript');
    });

    it('should show versions when requested', async () => {
      const content = '• react\n• express\n• typescript';
      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'express', version: '4.17.1' },
        { name: 'typescript', version: '4.5.0' },
      ];

      const result = await format(content, 'text', {
        showVersions: true,
        dependencies,
      });

      expect(result).toBe('• react (v17)\n• express (v4)\n• typescript (v4)');
    });

    it('should filter by focus area using AI', async () => {
      const content = '• react\n• express\n• typescript';
      const filterSpy = jest
        .spyOn(AIClient, 'filterTechnologies')
        .mockResolvedValueOnce(['react', 'typescript']);

      const result = await format(content, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('• react\n• typescript');
      expect(filterSpy).toHaveBeenCalledWith(expect.stringContaining('frontend'));
    });

    it('should filter by tech focus using AI', async () => {
      const content = '• react\n• express\n• typescript\n• @types/react';
      const filterSpy = jest
        .spyOn(AIClient, 'filterTechnologies')
        .mockResolvedValueOnce(['react', '@types/react']);

      const result = await format(content, 'text', {
        techFocus: 'react',
      });

      expect(result).toBe('• react\n• @types/react');
      expect(filterSpy).toHaveBeenCalledWith(expect.stringContaining('react'));
    });

    it('should handle AI filtering errors gracefully', async () => {
      const content = '• react\n• express\n• typescript';
      jest.spyOn(AIClient, 'filterTechnologies').mockRejectedValueOnce(new Error('AI Error'));

      const result = await format(content, 'text', {
        focusArea: 'frontend',
      });

      const technologies = result.split('\n').map((line) => line.trim().replace('• ', ''));
      expect(technologies).toContain('react');
      expect(technologies).toContain('express');
      expect(technologies).toContain('typescript');
    });

    it('should return content as is for json format', async () => {
      const content = JSON.stringify({ test: 'data' });
      const result = await format(content, 'json');
      expect(result).toBe(content);
    });

    it('should ignore non-bullet point lines', async () => {
      const content = 'Header\n• react\nMiddle\n• typescript\nFooter';
      const result = await format(content, 'text');
      expect(result).toBe('• react\n• typescript');
    });

    it('should format content in inline format', async () => {
      const content = '• react\n• express\n• typescript';
      const result = await format(content, 'inline');
      expect(result).toBe('react, express, typescript');
    });

    it('should format content in inline format with versions', async () => {
      const content = '• react\n• express\n• typescript';
      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'express', version: '4.17.1' },
        { name: 'typescript', version: '4.5.0' },
      ];

      const result = await format(content, 'inline', {
        showVersions: true,
        dependencies,
      });

      expect(result).toBe('react (v17), express (v4), typescript (v4)');
    });

    it('should filter inline format by focus area', async () => {
      const content = '• react\n• express\n• typescript';
      jest.spyOn(AIClient, 'filterTechnologies').mockResolvedValueOnce(['react', 'typescript']);

      const result = await format(content, 'inline', {
        focusArea: 'frontend',
      });

      expect(result).toBe('react, typescript');
    });
  });

  describe('formatCategories', () => {
    const formatCategories = (
      categories: Record<string, string[]>,
      type: 'markdown' | 'text' | 'inline' | 'json',
      options?: FormatterOptions
    ): Promise<string> => OutputFormatter.formatCategories(categories, type, options);

    it('should format categories with bullet points', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      const result = await formatCategories(categories, 'text');
      expect(result).toBe('frontend\n• react\n• typescript\n\nbackend\n• express\n• node');
    });

    it('should show versions in categories when requested', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
      };

      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'typescript', version: '4.5.0' },
      ];

      const result = await formatCategories(categories, 'text', {
        showVersions: true,
        dependencies,
      });

      expect(result).toBe('frontend\n• react (v17)\n• typescript (v4)');
    });

    it('should filter categories by focus area using AI', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      const filterSpy = jest
        .spyOn(AIClient, 'filterTechnologies')
        .mockResolvedValueOnce(['react', 'typescript']);

      const result = await formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript');
      expect(filterSpy).toHaveBeenCalledWith(expect.stringContaining('frontend'));
    });

    it('should filter categories by tech focus using AI', async () => {
      const categories = {
        frontend: ['react', '@types/react'],
        testing: ['jest', 'react-testing-library'],
      };

      const filterSpy = jest
        .spyOn(AIClient, 'filterTechnologies')
        .mockResolvedValueOnce(['react', '@types/react', 'react-testing-library']);

      const result = await formatCategories(categories, 'text', {
        techFocus: 'react',
      });

      expect(result).toBe('frontend\n• react\n• @types/react\n\ntesting\n• react-testing-library');
      expect(filterSpy).toHaveBeenCalledWith(expect.stringContaining('react'));
    });

    it('should handle AI filtering errors gracefully in categories', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      jest.spyOn(AIClient, 'filterTechnologies').mockRejectedValueOnce(new Error('AI Error'));

      const result = await formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript\n\nbackend\n• express\n• node');
    });

    it('should return JSON string for json format', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
      };

      const result = await formatCategories(categories, 'json');
      expect(result).toBe(JSON.stringify(categories, null, 2));
    });

    it('should remove empty categories after filtering', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      jest.spyOn(AIClient, 'filterTechnologies').mockResolvedValueOnce(['react', 'typescript']);

      const result = await formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript');
      expect(result).not.toContain('backend');
    });
  });
});
