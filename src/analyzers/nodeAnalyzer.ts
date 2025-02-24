import { FileReader } from '../utils/fileReader.js';

interface PackageDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
}

export class NodeAnalyzer {
  private packageJsonPath: string;

  constructor(packageJsonPath: string) {
    this.packageJsonPath = packageJsonPath;
  }

  /**
   * Analyzes the package.json file and returns a list of dependencies
   */
  async analyze(): Promise<PackageDependency[]> {
    try {
      const packageJson = await FileReader.readPackageJson(this.packageJsonPath);
      const dependencies: PackageDependency[] = [];

      // Process regular dependencies
      if (packageJson.dependencies) {
        dependencies.push(...this.processDependencies(packageJson.dependencies, 'dependency'));
      }

      // Process dev dependencies
      if (packageJson.devDependencies) {
        dependencies.push(
          ...this.processDependencies(packageJson.devDependencies, 'devDependency')
        );
      }

      return dependencies;
    } catch (error) {
      process.stderr.write(`Error analyzing package.json: ${(error as Error).message}\n`);
      return [];
    }
  }

  /**
   * Processes a dependency object and converts it to PackageDependency array
   */
  private processDependencies(
    deps: Record<string, string>,
    type: 'dependency' | 'devDependency'
  ): PackageDependency[] {
    return Object.entries(deps).map(([name, version]) => ({
      name,
      version: this.normalizeVersion(version),
      type,
    }));
  }

  /**
   * Normalizes version strings by removing special characters
   */
  private normalizeVersion(version: string): string {
    // Remove special characters like ^, ~, >, <, = and whitespace
    return version.replace(/[\^~>=<\s]/g, '');
  }

  /**
   * Categorizes dependencies into common tech categories
   */
  categorizeDependencies(dependencies: PackageDependency[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      framework: [],
      testing: [],
      bundler: [],
      linter: [],
      typescript: [],
      utilities: [],
      other: [],
    };

    dependencies.forEach((dep) => {
      const name = dep.name.toLowerCase();

      if (this.isFramework(name)) {
        categories.framework.push(dep.name);
      } else if (this.isTestingTool(name)) {
        categories.testing.push(dep.name);
      } else if (this.isBundler(name)) {
        categories.bundler.push(dep.name);
      } else if (this.isLinter(name)) {
        categories.linter.push(dep.name);
      } else if (this.isTypescript(name)) {
        categories.typescript.push(dep.name);
      } else if (this.isUtility(name)) {
        categories.utilities.push(dep.name);
      } else {
        categories.other.push(dep.name);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }

  private isFramework(name: string): boolean {
    const frameworks = [
      'react',
      'vue',
      'angular',
      'next',
      'nuxt',
      'express',
      'koa',
      'fastify',
      'nest',
    ];
    return frameworks.some((framework) => name.includes(framework));
  }

  private isTestingTool(name: string): boolean {
    const testingTools = [
      'jest',
      'mocha',
      'chai',
      'cypress',
      'playwright',
      'vitest',
      'ava',
      'karma',
    ];
    return testingTools.some((tool) => name.includes(tool));
  }

  private isBundler(name: string): boolean {
    const bundlers = ['webpack', 'rollup', 'parcel', 'vite', 'esbuild', 'babel'];
    return bundlers.some((bundler) => name.includes(bundler));
  }

  private isLinter(name: string): boolean {
    const linters = ['eslint', 'prettier', 'tslint', 'stylelint'];
    return linters.some((linter) => name.includes(linter));
  }

  private isTypescript(name: string): boolean {
    const typescript = ['typescript', '@types'];
    return typescript.some((ts) => name.includes(ts));
  }

  private isUtility(name: string): boolean {
    const utilities = ['lodash', 'moment', 'axios', 'chalk', 'commander', 'dotenv', 'uuid'];
    return utilities.some((utility) => name.includes(utility));
  }
}
