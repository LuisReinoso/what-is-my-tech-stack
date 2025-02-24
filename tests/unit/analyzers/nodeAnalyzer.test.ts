import { NodeAnalyzer } from '../../../src/analyzers/nodeAnalyzer.js';
import { FileReader } from '../../../src/utils/fileReader.js';

// Import the PackageDependency type
type PackageDependency = {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
};

// Mock the FileReader
jest.mock('../../../src/utils/fileReader.js');

describe('NodeAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze package.json with both dependencies and devDependencies', () => {
      const mockPackageJson = {
        dependencies: {
          react: '^17.0.0',
          axios: '0.21.1',
        },
        devDependencies: {
          jest: '^27.0.0',
          typescript: '4.3.5',
        },
      };

      (FileReader.readPackageJson as jest.Mock).mockReturnValue(mockPackageJson);

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.analyze();

      expect(result).toEqual([
        { name: 'react', version: '17.0.0', type: 'dependency' },
        { name: 'axios', version: '0.21.1', type: 'dependency' },
        { name: 'jest', version: '27.0.0', type: 'devDependency' },
        { name: 'typescript', version: '4.3.5', type: 'devDependency' },
      ]);
    });

    it('should handle package.json with only dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          react: '^17.0.0',
        },
      };

      (FileReader.readPackageJson as jest.Mock).mockReturnValue(mockPackageJson);

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.analyze();

      expect(result).toEqual([{ name: 'react', version: '17.0.0', type: 'dependency' }]);
    });

    it('should handle package.json with only devDependencies', () => {
      const mockPackageJson = {
        devDependencies: {
          jest: '^27.0.0',
        },
      };

      (FileReader.readPackageJson as jest.Mock).mockReturnValue(mockPackageJson);

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.analyze();

      expect(result).toEqual([{ name: 'jest', version: '27.0.0', type: 'devDependency' }]);
    });
  });

  describe('categorizeDependencies', () => {
    it('should categorize dependencies correctly', () => {
      const dependencies: PackageDependency[] = [
        { name: 'react', version: '17.0.0', type: 'dependency' },
        { name: 'jest', version: '27.0.0', type: 'devDependency' },
        { name: 'webpack', version: '5.0.0', type: 'devDependency' },
        { name: 'eslint', version: '7.0.0', type: 'devDependency' },
        { name: 'typescript', version: '4.3.5', type: 'devDependency' },
        { name: 'lodash', version: '4.17.21', type: 'dependency' },
        { name: 'unknown-package', version: '1.0.0', type: 'dependency' },
      ];

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.categorizeDependencies(dependencies);

      expect(result).toEqual({
        framework: ['react'],
        testing: ['jest'],
        bundler: ['webpack'],
        linter: ['eslint'],
        typescript: ['typescript'],
        utilities: ['lodash'],
        other: ['unknown-package'],
      });
    });

    it('should remove empty categories', () => {
      const dependencies: PackageDependency[] = [
        { name: 'unknown-package', version: '1.0.0', type: 'dependency' },
      ];

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.categorizeDependencies(dependencies);

      expect(result).toEqual({
        other: ['unknown-package'],
      });
      expect(result.framework).toBeUndefined();
      expect(result.testing).toBeUndefined();
    });
  });

  describe('version normalization', () => {
    it('should normalize different version formats', () => {
      const mockPackageJson = {
        dependencies: {
          pkg1: '^1.0.0',
          pkg2: '~2.0.0',
          pkg3: '>=3.0.0',
          pkg4: '4.0.0',
        },
      };

      (FileReader.readPackageJson as jest.Mock).mockReturnValue(mockPackageJson);

      const analyzer = new NodeAnalyzer('package.json');
      const result = analyzer.analyze();

      expect(result).toEqual([
        { name: 'pkg1', version: '1.0.0', type: 'dependency' },
        { name: 'pkg2', version: '2.0.0', type: 'dependency' },
        { name: 'pkg3', version: '3.0.0', type: 'dependency' },
        { name: 'pkg4', version: '4.0.0', type: 'dependency' },
      ]);
    });
  });
});
