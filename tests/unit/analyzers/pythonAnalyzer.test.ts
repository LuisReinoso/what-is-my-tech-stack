import { PythonAnalyzer } from '../../../src/analyzers/pythonAnalyzer.js';
import { FileReader } from '../../../src/utils/fileReader.js';

// Import the PythonDependency type
type PythonDependency = {
  name: string;
  version: string;
  constraint?: string;
};

// Mock the FileReader
jest.mock('../../../src/utils/fileReader.js');

describe('PythonAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze requirements.txt with various version formats', async () => {
      const mockRequirements = [
        'django==3.2.0',
        'requests>=2.25.1',
        'pytest<=6.2.4',
        'numpy~=1.20.0',
        'pandas!=1.2.0',
        'pillow>8.0.0',
        'beautifulsoup4<4.9.0',
        'simple-package',
      ];

      (FileReader.readRequirementsTxt as jest.Mock).mockResolvedValue(mockRequirements);

      const analyzer = new PythonAnalyzer('requirements.txt');
      const result = await analyzer.analyze();

      expect(result).toEqual([
        { name: 'django', version: '3.2.0', constraint: '==' },
        { name: 'requests', version: '2.25.1', constraint: '>=' },
        { name: 'pytest', version: '6.2.4', constraint: '<=' },
        { name: 'numpy', version: '1.20.0', constraint: '~=' },
        { name: 'pandas', version: '1.2.0', constraint: '!=' },
        { name: 'pillow', version: '8.0.0', constraint: '>' },
        { name: 'beautifulsoup4', version: '4.9.0', constraint: '<' },
        { name: 'simple-package', version: '' },
      ]);
    });

    it('should handle invalid requirement formats', async () => {
      const mockRequirements = ['invalid@package', 'package with spaces'];

      (FileReader.readRequirementsTxt as jest.Mock).mockResolvedValue(mockRequirements);

      const analyzer = new PythonAnalyzer('requirements.txt');
      const result = await analyzer.analyze();

      expect(result).toEqual([
        { name: 'invalid@package', version: '' },
        { name: 'package with spaces', version: '' },
      ]);
    });
  });

  describe('categorizeDependencies', () => {
    it('should categorize dependencies correctly', () => {
      const dependencies: PythonDependency[] = [
        { name: 'django', version: '3.2.0', constraint: '==' },
        { name: 'pytest', version: '6.2.4', constraint: '==' },
        { name: 'sqlalchemy', version: '1.4.0', constraint: '==' },
        { name: 'celery', version: '5.0.0', constraint: '==' },
        { name: 'numpy', version: '1.20.0', constraint: '==' },
        { name: 'requests', version: '2.25.1', constraint: '==' },
        { name: 'unknown-package', version: '1.0.0', constraint: '==' },
      ];

      const analyzer = new PythonAnalyzer('requirements.txt');
      const result = analyzer.categorizeDependencies(dependencies);

      expect(result).toEqual({
        web_framework: ['django'],
        testing: ['pytest'],
        database: ['sqlalchemy'],
        async: ['celery'],
        data_science: ['numpy'],
        utilities: ['requests'],
        other: ['unknown-package'],
      });
    });

    it('should remove empty categories', () => {
      const dependencies: PythonDependency[] = [
        { name: 'unknown-package', version: '1.0.0', constraint: '==' },
      ];

      const analyzer = new PythonAnalyzer('requirements.txt');
      const result = analyzer.categorizeDependencies(dependencies);

      expect(result).toEqual({
        other: ['unknown-package'],
      });
      expect(result.web_framework).toBeUndefined();
      expect(result.testing).toBeUndefined();
    });
  });
});
