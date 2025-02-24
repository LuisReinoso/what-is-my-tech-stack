import fs from 'fs';
import path from 'path';

export class FileReader {
  /**
   * Checks if a file exists at the given path
   */
  static fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Reads and parses a package.json file
   */
  static readPackageJson(filePath: string): Record<string, any> {
    try {
      const absolutePath = path.resolve(filePath);
      if (!this.fileExists(absolutePath)) {
        throw new Error(`package.json not found at ${absolutePath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Error reading package.json: ${(error as Error).message}`);
    }
  }

  /**
   * Reads and parses a requirements.txt file
   */
  static readRequirementsTxt(filePath: string): string[] {
    try {
      const absolutePath = path.resolve(filePath);
      if (!this.fileExists(absolutePath)) {
        throw new Error(`requirements.txt not found at ${absolutePath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      return fileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#')); // Remove empty lines and comments
    } catch (error) {
      throw new Error(`Error reading requirements.txt: ${(error as Error).message}`);
    }
  }

  /**
   * Detects the type of project based on the files present in the directory
   */
  static detectProjectType(directoryPath: string): 'node' | 'python' | 'both' | 'unknown' {
    const hasPackageJson = this.fileExists(path.join(directoryPath, 'package.json'));
    const hasRequirementsTxt = this.fileExists(path.join(directoryPath, 'requirements.txt'));

    if (hasPackageJson && hasRequirementsTxt) return 'both';
    if (hasPackageJson) return 'node';
    if (hasRequirementsTxt) return 'python';
    return 'unknown';
  }
}
