#!/usr/bin/env node

import { Command } from 'commander';
import { DependencyAnalyzer } from '../analyzers/dependencyAnalyzer.js';
import { OutputFormatter } from '../utils/formatter.js';
import chalk from 'chalk';
import path from 'path';
import ora from 'ora';

interface CliOptions {
  path: string;
  format: 'text' | 'markdown' | 'json';
  showVersions: boolean;
  focusArea?: string;
  techFocus?: string;
}

const program = new Command();

program
  .name('what-is-my-tech-stack')
  .description('Analyze project dependencies and generate a human-readable tech stack description')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to the project directory', '.')
  .option('-f, --format <format>', 'Output format (text, markdown, or json)', 'text')
  .option('-v, --show-versions', 'Show major version numbers')
  .option('-a, --focus-area <area>', 'Focus on specific area (frontend, backend, fullstack)')
  .option('-t, --tech-focus <tech>', 'Focus on specific technology (e.g., angular, react, node)')
  .action(async (options: CliOptions) => {
    try {
      const projectPath = path.resolve(options.path);
      const spinner = ora({
        text: chalk.blue(`Analyzing project at ${projectPath}...`),
        spinner: 'dots',
      }).start();

      const analyzer = new DependencyAnalyzer(projectPath);
      const techStack = await analyzer.analyze();

      spinner.stop();

      // Format the output based on project type
      if (techStack.node) {
        const description = techStack.node.description;
        const categories = techStack.node.categories;

        if (description) {
          const formattedDescription = await OutputFormatter.format(description, options.format, {
            showVersions: options.showVersions,
            focusArea: options.focusArea,
            techFocus: options.techFocus,
            dependencies: techStack.node.dependencies,
          });
          process.stdout.write(formattedDescription + '\n');
        }
        if (categories) {
          const formattedCategories = await OutputFormatter.formatCategories(
            categories,
            options.format,
            {
              showVersions: options.showVersions,
              focusArea: options.focusArea,
              techFocus: options.techFocus,
              dependencies: techStack.node.dependencies,
            }
          );
          process.stdout.write('\n' + formattedCategories + '\n');
        }
      }

      if (techStack.python) {
        if (techStack.node) process.stdout.write('\n'); // Add spacing if we had Node.js output

        const description = techStack.python.description;
        const categories = techStack.python.categories;

        if (description) {
          const formattedDescription = await OutputFormatter.format(description, options.format, {
            showVersions: options.showVersions,
            focusArea: options.focusArea,
            techFocus: options.techFocus,
            dependencies: techStack.python.dependencies,
          });
          process.stdout.write(formattedDescription + '\n');
        }
        if (categories) {
          const formattedCategories = await OutputFormatter.formatCategories(
            categories,
            options.format,
            {
              showVersions: options.showVersions,
              focusArea: options.focusArea,
              techFocus: options.techFocus,
              dependencies: techStack.python.dependencies,
            }
          );
          process.stdout.write('\n' + formattedCategories + '\n');
        }
      }

      if (techStack.type === 'unknown') {
        process.stderr.write(
          'No recognized dependency files found (package.json or requirements.txt).\n'
        );
      }
    } catch (error) {
      process.stderr.write(chalk.red(`Error: ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse();
