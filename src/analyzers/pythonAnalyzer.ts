import { FileReader } from '../utils/fileReader.js';

interface PythonDependency {
  name: string;
  version: string;
  constraint?: string;
}

export class PythonAnalyzer {
  private requirementsPath: string;

  constructor(requirementsPath: string) {
    this.requirementsPath = requirementsPath;
  }

  /**
   * Analyzes the requirements.txt file and returns a list of dependencies
   */
  async analyze(): Promise<PythonDependency[]> {
    try {
      const requirements = await FileReader.readRequirementsTxt(this.requirementsPath);
      return requirements.map((line) => this.parseDependency(line));
    } catch (error) {
      process.stderr.write(`Error analyzing requirements.txt: ${(error as Error).message}\n`);
      return [];
    }
  }

  /**
   * Parses a single requirement line into a PythonDependency object
   */
  private parseDependency(line: string): PythonDependency {
    // Match patterns like:
    // package==1.0.0
    // package>=1.0.0
    // package<=1.0.0
    // package~=1.0.0
    // package!=1.0.0
    // package
    const pattern = /^([a-zA-Z0-9-_.]+)(?:([<>=!~]=|[<>])(.+))?$/;
    const match = line.match(pattern);

    if (!match) {
      return {
        name: line,
        version: '',
      };
    }

    const [, name, constraint, version] = match;

    return {
      name,
      version: version || '',
      constraint: constraint || undefined,
    };
  }

  /**
   * Categorizes dependencies into common tech categories
   */
  categorizeDependencies(dependencies: PythonDependency[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      web_framework: [],
      testing: [],
      database: [],
      async: [],
      data_science: [],
      utilities: [],
      other: [],
    };

    dependencies.forEach((dep) => {
      const name = dep.name.toLowerCase();

      if (this.isWebFramework(name)) {
        categories.web_framework.push(dep.name);
      } else if (this.isTestingTool(name)) {
        categories.testing.push(dep.name);
      } else if (this.isDatabase(name)) {
        categories.database.push(dep.name);
      } else if (this.isAsync(name)) {
        categories.async.push(dep.name);
      } else if (this.isDataScience(name)) {
        categories.data_science.push(dep.name);
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

  private isWebFramework(name: string): boolean {
    const frameworks = ['django', 'flask', 'fastapi', 'pyramid', 'tornado', 'aiohttp', 'sanic'];
    return frameworks.some((framework) => name.includes(framework));
  }

  private isTestingTool(name: string): boolean {
    const testingTools = ['pytest', 'unittest', 'nose', 'coverage', 'tox', 'mock'];
    return testingTools.some((tool) => name.includes(tool));
  }

  private isDatabase(name: string): boolean {
    const databases = ['sqlalchemy', 'django-orm', 'psycopg2', 'pymongo', 'redis', 'peewee'];
    return databases.some((db) => name.includes(db));
  }

  private isAsync(name: string): boolean {
    const async = ['asyncio', 'aiohttp', 'celery', 'dramatiq', 'rq'];
    return async.some((pkg) => name.includes(pkg));
  }

  private isDataScience(name: string): boolean {
    const dataScienceTools = [
      'numpy',
      'pandas',
      'scipy',
      'scikit-learn',
      'tensorflow',
      'pytorch',
      'matplotlib',
    ];
    return dataScienceTools.some((tool) => name.includes(tool));
  }

  private isUtility(name: string): boolean {
    const utilities = ['requests', 'click', 'pyyaml', 'python-dotenv', 'pillow', 'beautifulsoup4'];
    return utilities.some((utility) => name.includes(utility));
  }
}
