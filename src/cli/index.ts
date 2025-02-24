#!/usr/bin/env node

import { Command } from 'commander';
import { DependencyAnalyzer } from '../analyzers/dependencyAnalyzer.js';
import chalk from 'chalk';
import path from 'path';
import ora from 'ora';

const program = new Command();

program
  .name('what-is-my-tech-stack')
  .description('Analyze project dependencies and generate a human-readable tech stack description')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to the project directory', '.')
  .option('-f, --format <format>', 'Output format (text or markdown)', 'markdown')
  .action(async (options) => {
    try {
      const projectPath = path.resolve(options.path);
      const spinner = ora({
        text: chalk.blue(`Analyzing project at ${projectPath}...`),
        spinner: 'dots',
      }).start();

      const analyzer = new DependencyAnalyzer(projectPath);
      const techStack = await analyzer.analyze();
      const summary = analyzer.generateSummary(techStack);

      spinner.stop();

      if (options.format === 'text') {
        // Convert markdown to plain text (simple conversion)
        const plainText = summary
          .replace(/^# /gm, '')
          .replace(/^## /gm, '')
          .replace(/^### /gm, '')
          .replace(/\n\n/g, '\n');
        console.log(plainText);
      } else {
        console.log(summary);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse();
