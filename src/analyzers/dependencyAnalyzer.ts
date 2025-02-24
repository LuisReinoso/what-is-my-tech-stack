import { FileReader } from '../utils/fileReader.js';
import { NodeAnalyzer } from './nodeAnalyzer.js';
import { PythonAnalyzer } from './pythonAnalyzer.js';
import { AIClient } from '../ai/openai.js';

interface ProjectTechStack {
  type: 'node' | 'python' | 'both' | 'unknown';
  node?: {
    dependencies: {
      name: string;
      version: string;
      type: 'dependency' | 'devDependency';
    }[];
    categories: Record<string, string[]>;
    description?: string;
  };
  python?: {
    dependencies: {
      name: string;
      version: string;
      constraint?: string;
    }[];
    categories: Record<string, string[]>;
    description?: string;
  };
}

export class DependencyAnalyzer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Analyzes the project dependencies and returns a structured tech stack
   */
  async analyze(): Promise<ProjectTechStack> {
    const projectType = FileReader.detectProjectType(this.projectPath);
    const result: ProjectTechStack = { type: projectType };

    if (projectType === 'node' || projectType === 'both') {
      const nodeAnalyzer = new NodeAnalyzer(`${this.projectPath}/package.json`);
      const nodeDependencies = nodeAnalyzer.analyze();
      const nodeCategories = nodeAnalyzer.categorizeDependencies(nodeDependencies);

      // Get AI-generated description
      let nodeDescription: string | undefined;
      try {
        // Generate a minimal list of technologies
        const techList = nodeDependencies.map((dep) => `• ${dep.name}`).join('\n');
        nodeDescription = techList;
      } catch (error) {
        console.warn(
          'Failed to generate Node.js tech stack description:',
          (error as Error).message
        );
      }

      result.node = {
        dependencies: nodeDependencies,
        categories: nodeCategories,
        description: nodeDescription,
      };
    }

    if (projectType === 'python' || projectType === 'both') {
      const pythonAnalyzer = new PythonAnalyzer(`${this.projectPath}/requirements.txt`);
      const pythonDependencies = pythonAnalyzer.analyze();
      const pythonCategories = pythonAnalyzer.categorizeDependencies(pythonDependencies);

      // Get AI-generated description
      let pythonDescription: string | undefined;
      try {
        // Generate a minimal list of technologies
        const techList = pythonDependencies.map((dep) => `• ${dep.name}`).join('\n');
        pythonDescription = techList;
      } catch (error) {
        console.warn('Failed to generate Python tech stack description:', (error as Error).message);
      }

      result.python = {
        dependencies: pythonDependencies,
        categories: pythonCategories,
        description: pythonDescription,
      };
    }

    return result;
  }

  /**
   * Generates a human-readable summary of the tech stack
   */
  generateSummary(techStack: ProjectTechStack): string {
    const summary: string[] = [];

    summary.push('# Project Tech Stack Analysis\n');

    if (techStack.type === 'unknown') {
      summary.push('No recognized dependency files found (package.json or requirements.txt).');
      return summary.join('\n');
    }

    if (techStack.node) {
      summary.push('## Node.js Dependencies\n');
      this.appendNodeSummary(summary, techStack.node);
    }

    if (techStack.python) {
      if (techStack.node) summary.push('\n'); // Add spacing between sections
      summary.push('## Python Dependencies\n');
      this.appendPythonSummary(summary, techStack.python);
    }

    return summary.join('\n');
  }

  private appendNodeSummary(
    summary: string[],
    nodeStack: NonNullable<ProjectTechStack['node']>
  ): void {
    const { categories, description } = nodeStack;

    if (description) {
      summary.push('### Overview');
      summary.push(description + '\n');
    }

    if (categories.framework?.length) {
      summary.push('### Frameworks');
      summary.push(categories.framework.join(', ') + '\n');
    }

    if (categories.testing?.length) {
      summary.push('### Testing Tools');
      summary.push(categories.testing.join(', ') + '\n');
    }

    if (categories.bundler?.length) {
      summary.push('### Build Tools & Bundlers');
      summary.push(categories.bundler.join(', ') + '\n');
    }

    if (categories.linter?.length) {
      summary.push('### Linting & Code Style');
      summary.push(categories.linter.join(', ') + '\n');
    }

    if (categories.typescript?.length) {
      summary.push('### TypeScript');
      summary.push(categories.typescript.join(', ') + '\n');
    }

    if (categories.utilities?.length) {
      summary.push('### Utilities');
      summary.push(categories.utilities.join(', ') + '\n');
    }

    if (categories.other?.length) {
      summary.push('### Other Dependencies');
      summary.push(categories.other.join(', ') + '\n');
    }
  }

  private appendPythonSummary(
    summary: string[],
    pythonStack: NonNullable<ProjectTechStack['python']>
  ): void {
    const { categories, description } = pythonStack;

    if (description) {
      summary.push('### Overview');
      summary.push(description + '\n');
    }

    if (categories.web_framework?.length) {
      summary.push('### Web Frameworks');
      summary.push(categories.web_framework.join(', ') + '\n');
    }

    if (categories.testing?.length) {
      summary.push('### Testing Tools');
      summary.push(categories.testing.join(', ') + '\n');
    }

    if (categories.database?.length) {
      summary.push('### Database & ORM');
      summary.push(categories.database.join(', ') + '\n');
    }

    if (categories.async?.length) {
      summary.push('### Async & Task Queue');
      summary.push(categories.async.join(', ') + '\n');
    }

    if (categories.data_science?.length) {
      summary.push('### Data Science & ML');
      summary.push(categories.data_science.join(', ') + '\n');
    }

    if (categories.utilities?.length) {
      summary.push('### Utilities');
      summary.push(categories.utilities.join(', ') + '\n');
    }

    if (categories.other?.length) {
      summary.push('### Other Dependencies');
      summary.push(categories.other.join(', ') + '\n');
    }
  }
}
