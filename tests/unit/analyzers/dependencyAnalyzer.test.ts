import { DependencyAnalyzer } from '../../../src/analyzers/dependencyAnalyzer.js';
import { FileReader } from '../../../src/utils/fileReader.js';
import { NodeAnalyzer } from '../../../src/analyzers/nodeAnalyzer.js';
import { PythonAnalyzer } from '../../../src/analyzers/pythonAnalyzer.js';
import { AIClient } from '../../../src/ai/openai.js';

// Mock all dependencies
jest.mock('../../../src/utils/fileReader.js');
jest.mock('../../../src/analyzers/nodeAnalyzer.js');
jest.mock('../../../src/analyzers/pythonAnalyzer.js');
jest.mock('../../../src/ai/openai.js');

describe('DependencyAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze Node.js project', async () => {
      // Mock project type detection
      (FileReader.detectProjectType as jest.Mock).mockReturnValue('node');

      // Mock Node.js analysis results
      const mockNodeDependencies = [
        { name: 'react', version: '17.0.0', type: 'dependency' },
        { name: 'jest', version: '27.0.0', type: 'devDependency' },
      ];

      const mockNodeCategories = {
        framework: ['react'],
        testing: ['jest'],
      };

      const mockNodeDescription = 'AI-generated Node.js tech stack description';

      (NodeAnalyzer.prototype.analyze as jest.Mock).mockReturnValue(mockNodeDependencies);
      (NodeAnalyzer.prototype.categorizeDependencies as jest.Mock).mockReturnValue(
        mockNodeCategories
      );
      (AIClient.generateTechStackDescription as jest.Mock).mockResolvedValue(mockNodeDescription);

      const analyzer = new DependencyAnalyzer('.');
      const result = await analyzer.analyze();

      expect(result).toEqual({
        type: 'node',
        node: {
          dependencies: mockNodeDependencies,
          categories: mockNodeCategories,
          description: mockNodeDescription,
        },
      });
    });

    it('should analyze Python project', async () => {
      // Mock project type detection
      (FileReader.detectProjectType as jest.Mock).mockReturnValue('python');

      // Mock Python analysis results
      const mockPythonDependencies = [
        { name: 'django', version: '3.2.0', constraint: '==' },
        { name: 'pytest', version: '6.2.4', constraint: '==' },
      ];

      const mockPythonCategories = {
        web_framework: ['django'],
        testing: ['pytest'],
      };

      const mockPythonDescription = 'AI-generated Python tech stack description';

      (PythonAnalyzer.prototype.analyze as jest.Mock).mockReturnValue(mockPythonDependencies);
      (PythonAnalyzer.prototype.categorizeDependencies as jest.Mock).mockReturnValue(
        mockPythonCategories
      );
      (AIClient.generateTechStackDescription as jest.Mock).mockResolvedValue(mockPythonDescription);

      const analyzer = new DependencyAnalyzer('.');
      const result = await analyzer.analyze();

      expect(result).toEqual({
        type: 'python',
        python: {
          dependencies: mockPythonDependencies,
          categories: mockPythonCategories,
          description: mockPythonDescription,
        },
      });
    });

    it('should analyze project with both Node.js and Python', async () => {
      // Mock project type detection
      (FileReader.detectProjectType as jest.Mock).mockReturnValue('both');

      // Mock Node.js analysis results
      const mockNodeDependencies = [{ name: 'react', version: '17.0.0', type: 'dependency' }];
      const mockNodeCategories = { framework: ['react'] };
      const mockNodeDescription = 'AI-generated Node.js description';

      // Mock Python analysis results
      const mockPythonDependencies = [{ name: 'django', version: '3.2.0', constraint: '==' }];
      const mockPythonCategories = { web_framework: ['django'] };
      const mockPythonDescription = 'AI-generated Python description';

      (NodeAnalyzer.prototype.analyze as jest.Mock).mockReturnValue(mockNodeDependencies);
      (NodeAnalyzer.prototype.categorizeDependencies as jest.Mock).mockReturnValue(
        mockNodeCategories
      );
      (PythonAnalyzer.prototype.analyze as jest.Mock).mockReturnValue(mockPythonDependencies);
      (PythonAnalyzer.prototype.categorizeDependencies as jest.Mock).mockReturnValue(
        mockPythonCategories
      );
      (AIClient.generateTechStackDescription as jest.Mock)
        .mockResolvedValueOnce(mockNodeDescription)
        .mockResolvedValueOnce(mockPythonDescription);

      const analyzer = new DependencyAnalyzer('.');
      const result = await analyzer.analyze();

      expect(result).toEqual({
        type: 'both',
        node: {
          dependencies: mockNodeDependencies,
          categories: mockNodeCategories,
          description: mockNodeDescription,
        },
        python: {
          dependencies: mockPythonDependencies,
          categories: mockPythonCategories,
          description: mockPythonDescription,
        },
      });
    });

    it('should handle unknown project type', async () => {
      // Mock project type detection
      (FileReader.detectProjectType as jest.Mock).mockReturnValue('unknown');

      const analyzer = new DependencyAnalyzer('.');
      const result = await analyzer.analyze();

      expect(result).toEqual({
        type: 'unknown',
      });
    });

    it('should handle AI generation errors', async () => {
      // Mock project type detection
      (FileReader.detectProjectType as jest.Mock).mockReturnValue('node');

      // Mock Node.js analysis results
      const mockNodeDependencies = [{ name: 'react', version: '17.0.0', type: 'dependency' }];
      const mockNodeCategories = { framework: ['react'] };

      (NodeAnalyzer.prototype.analyze as jest.Mock).mockReturnValue(mockNodeDependencies);
      (NodeAnalyzer.prototype.categorizeDependencies as jest.Mock).mockReturnValue(
        mockNodeCategories
      );
      (AIClient.generateTechStackDescription as jest.Mock).mockRejectedValue(
        new Error('AI generation failed')
      );

      const analyzer = new DependencyAnalyzer('.');
      const result = await analyzer.analyze();

      // Should still return results without description
      expect(result).toEqual({
        type: 'node',
        node: {
          dependencies: mockNodeDependencies,
          categories: mockNodeCategories,
          description: undefined,
        },
      });
    });
  });

  describe('generateSummary', () => {
    it('should generate summary for Node.js project', () => {
      const techStack = {
        type: 'node' as const,
        node: {
          dependencies: [
            { name: 'react', version: '17.0.0', type: 'dependency' as const },
            { name: 'jest', version: '27.0.0', type: 'devDependency' as const },
          ],
          categories: {
            framework: ['react'],
            testing: ['jest'],
          },
          description: 'AI-generated description of the tech stack',
        },
      };

      const analyzer = new DependencyAnalyzer('.');
      const summary = analyzer.generateSummary(techStack);

      expect(summary).toContain('# Project Tech Stack Analysis');
      expect(summary).toContain('## Node.js Dependencies');
      expect(summary).toContain('### Overview');
      expect(summary).toContain('AI-generated description');
      expect(summary).toContain('### Frameworks');
      expect(summary).toContain('react');
      expect(summary).toContain('### Testing Tools');
      expect(summary).toContain('jest');
    });

    it('should generate summary for Python project', () => {
      const techStack = {
        type: 'python' as const,
        python: {
          dependencies: [
            { name: 'django', version: '3.2.0', constraint: '==' },
            { name: 'pytest', version: '6.2.4', constraint: '==' },
          ],
          categories: {
            web_framework: ['django'],
            testing: ['pytest'],
          },
          description: 'AI-generated description of the Python stack',
        },
      };

      const analyzer = new DependencyAnalyzer('.');
      const summary = analyzer.generateSummary(techStack);

      expect(summary).toContain('# Project Tech Stack Analysis');
      expect(summary).toContain('## Python Dependencies');
      expect(summary).toContain('### Overview');
      expect(summary).toContain('AI-generated description');
      expect(summary).toContain('### Web Frameworks');
      expect(summary).toContain('django');
      expect(summary).toContain('### Testing Tools');
      expect(summary).toContain('pytest');
    });

    it('should generate summary for unknown project type', () => {
      const techStack = {
        type: 'unknown' as const,
      };

      const analyzer = new DependencyAnalyzer('.');
      const summary = analyzer.generateSummary(techStack);

      expect(summary).toContain('# Project Tech Stack Analysis');
      expect(summary).toContain('No recognized dependency files found');
    });

    it('should handle missing AI descriptions', () => {
      const techStack = {
        type: 'node' as const,
        node: {
          dependencies: [{ name: 'react', version: '17.0.0', type: 'dependency' as const }],
          categories: {
            framework: ['react'],
          },
          // No description provided
        },
      };

      const analyzer = new DependencyAnalyzer('.');
      const summary = analyzer.generateSummary(techStack);

      expect(summary).toContain('# Project Tech Stack Analysis');
      expect(summary).toContain('## Node.js Dependencies');
      expect(summary).toContain('### Frameworks');
      expect(summary).toContain('react');
      expect(summary).not.toContain('### Overview');
    });
  });
});
