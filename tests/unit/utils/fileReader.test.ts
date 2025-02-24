import fs from 'fs';
import path from 'path';
import { FileReader } from '../../../src/utils/fileReader';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('FileReader', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fileExists', () => {
    it('should return true when file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      expect(FileReader.fileExists('some/path')).toBe(true);
    });

    it('should return false when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(FileReader.fileExists('some/path')).toBe(false);
    });

    it('should return false when error occurs', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Some error');
      });
      expect(FileReader.fileExists('some/path')).toBe(false);
    });
  });

  describe('readPackageJson', () => {
    it('should read and parse package.json successfully', () => {
      const mockPackageJson = { name: 'test', version: '1.0.0' };
      (path.resolve as jest.Mock).mockReturnValue('/absolute/path');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockPackageJson));

      const result = FileReader.readPackageJson('package.json');
      expect(result).toEqual(mockPackageJson);
    });

    it('should throw error when package.json does not exist', () => {
      (path.resolve as jest.Mock).mockReturnValue('/absolute/path');
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => FileReader.readPackageJson('package.json')).toThrow('package.json not found');
    });

    it('should throw error when package.json is invalid JSON', () => {
      (path.resolve as jest.Mock).mockReturnValue('/absolute/path');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

      expect(() => FileReader.readPackageJson('package.json')).toThrow(
        'Error reading package.json'
      );
    });
  });

  describe('readRequirementsTxt', () => {
    it('should read and parse requirements.txt successfully', () => {
      const mockContent = 'package1==1.0.0\n# comment\npackage2>=2.0.0\n\npackage3';
      (path.resolve as jest.Mock).mockReturnValue('/absolute/path');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);

      const result = FileReader.readRequirementsTxt('requirements.txt');
      expect(result).toEqual(['package1==1.0.0', 'package2>=2.0.0', 'package3']);
    });

    it('should throw error when requirements.txt does not exist', () => {
      (path.resolve as jest.Mock).mockReturnValue('/absolute/path');
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => FileReader.readRequirementsTxt('requirements.txt')).toThrow(
        'requirements.txt not found'
      );
    });
  });

  describe('detectProjectType', () => {
    it('should detect node project', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // package.json exists
        .mockReturnValueOnce(false); // requirements.txt doesn't exist

      expect(FileReader.detectProjectType('.')).toBe('node');
    });

    it('should detect python project', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // package.json doesn't exist
        .mockReturnValueOnce(true); // requirements.txt exists

      expect(FileReader.detectProjectType('.')).toBe('python');
    });

    it('should detect both project types', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // package.json exists
        .mockReturnValueOnce(true); // requirements.txt exists

      expect(FileReader.detectProjectType('.')).toBe('both');
    });

    it('should return unknown when no recognized files exist', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // package.json doesn't exist
        .mockReturnValueOnce(false); // requirements.txt doesn't exist

      expect(FileReader.detectProjectType('.')).toBe('unknown');
    });
  });
});
