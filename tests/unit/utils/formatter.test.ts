import { OutputFormatter } from '../../../src/utils/formatter.js';
import { AIClient } from '../../../src/ai/openai.js';

// Mock AIClient
jest.mock('../../../src/ai/openai.js');

describe('OutputFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('format', () => {
    it('should format content with bullet points', async () => {
      const content = '• react\n• express\n• typescript';
      const result = await OutputFormatter.format(content, 'text');
      expect(result).toBe('• react\n• express\n• typescript');
    });

    it('should show versions when requested', async () => {
      const content = '• react\n• express\n• typescript';
      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'express', version: '4.17.1' },
        { name: 'typescript', version: '4.5.0' },
      ];

      const result = await OutputFormatter.format(content, 'text', {
        showVersions: true,
        dependencies,
      });

      expect(result).toBe('• react (v17)\n• express (v4)\n• typescript (v4)');
    });

    it('should filter by focus area using AI', async () => {
      const content = '• react\n• express\n• typescript';
      (AIClient.filterTechnologies as jest.Mock).mockResolvedValueOnce(['react', 'typescript']);

      const result = await OutputFormatter.format(content, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('• react\n• typescript');
      expect(AIClient.filterTechnologies).toHaveBeenCalledWith(expect.stringContaining('frontend'));
    });

    it('should filter by tech focus using AI', async () => {
      const content = '• react\n• express\n• typescript\n• @types/react';
      (AIClient.filterTechnologies as jest.Mock).mockResolvedValueOnce(['react', '@types/react']);

      const result = await OutputFormatter.format(content, 'text', {
        techFocus: 'react',
      });

      expect(result).toBe('• react\n• @types/react');
      expect(AIClient.filterTechnologies).toHaveBeenCalledWith(expect.stringContaining('react'));
    });

    it('should handle AI filtering errors gracefully', async () => {
      const content = '• react\n• express\n• typescript';
      (AIClient.filterTechnologies as jest.Mock).mockRejectedValueOnce(new Error('AI Error'));

      const result = await OutputFormatter.format(content, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('• react\n• express\n• typescript');
    });

    it('should return content as is for json format', async () => {
      const content = JSON.stringify({ test: 'data' });
      const result = await OutputFormatter.format(content, 'json');
      expect(result).toBe(content);
    });

    it('should ignore non-bullet point lines', async () => {
      const content = 'Header\n• react\nMiddle\n• typescript\nFooter';
      const result = await OutputFormatter.format(content, 'text');
      expect(result).toBe('• react\n• typescript');
    });
  });

  describe('formatCategories', () => {
    it('should format categories with bullet points', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      const result = await OutputFormatter.formatCategories(categories, 'text');
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

      const result = await OutputFormatter.formatCategories(categories, 'text', {
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

      (AIClient.filterTechnologies as jest.Mock).mockResolvedValueOnce(['react', 'typescript']);

      const result = await OutputFormatter.formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript');
      expect(AIClient.filterTechnologies).toHaveBeenCalledWith(expect.stringContaining('frontend'));
    });

    it('should filter categories by tech focus using AI', async () => {
      const categories = {
        frontend: ['react', '@types/react'],
        testing: ['jest', 'react-testing-library'],
      };

      (AIClient.filterTechnologies as jest.Mock).mockResolvedValueOnce([
        'react',
        '@types/react',
        'react-testing-library',
      ]);

      const result = await OutputFormatter.formatCategories(categories, 'text', {
        techFocus: 'react',
      });

      expect(result).toBe('frontend\n• react\n• @types/react\n\ntesting\n• react-testing-library');
      expect(AIClient.filterTechnologies).toHaveBeenCalledWith(expect.stringContaining('react'));
    });

    it('should handle AI filtering errors gracefully in categories', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      (AIClient.filterTechnologies as jest.Mock).mockRejectedValueOnce(new Error('AI Error'));

      const result = await OutputFormatter.formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript\n\nbackend\n• express\n• node');
    });

    it('should return JSON string for json format', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
      };

      const result = await OutputFormatter.formatCategories(categories, 'json');
      expect(result).toBe(JSON.stringify(categories, null, 2));
    });

    it('should remove empty categories after filtering', async () => {
      const categories = {
        frontend: ['react', 'typescript'],
        backend: ['express', 'node'],
      };

      (AIClient.filterTechnologies as jest.Mock).mockResolvedValueOnce(['react', 'typescript']);

      const result = await OutputFormatter.formatCategories(categories, 'text', {
        focusArea: 'frontend',
      });

      expect(result).toBe('frontend\n• react\n• typescript');
      expect(result).not.toContain('backend');
    });
  });
});
