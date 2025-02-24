import { OUTPUT_FORMATS } from '../ai/prompts.js';
import { AIClient } from '../ai/openai.js';
import { formatPrompt, FOCUS_AREA_PROMPT, TECH_FOCUS_PROMPT } from '../ai/prompts.js';

type FormatConfig = {
  header: string;
  subheader: string;
  section: string;
  list: string;
  codeBlock: string;
};

type FormatterOptions = {
  showVersions?: boolean;
  focusArea?: string;
  techFocus?: string;
  dependencies?: Array<{
    name: string;
    version: string;
    type?: string;
  }>;
};

const FRONTEND_TECHS = [
  'react',
  'angular',
  'vue',
  'svelte',
  'next',
  'nuxt',
  '@angular',
  '@material-ui',
  '@mui',
  'tailwind',
  'bootstrap',
  'sass',
  'less',
  'styled-components',
  'emotion',
  'webpack',
  'vite',
  'parcel',
  'babel',
  'typescript',
  'javascript',
];

const BACKEND_TECHS = [
  'express',
  'nest',
  'fastify',
  'koa',
  'hapi',
  'django',
  'flask',
  'fastapi',
  'spring',
  'node',
  'python',
  'java',
  'go',
  'rust',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'prisma',
  'typeorm',
  'sequelize',
];

const TECH_FOCUS_MAP: Record<string, string[]> = {
  angular: [
    '@angular',
    'angular',
    'rxjs',
    'zone.js',
    'typescript',
    '@ngrx',
    'jasmine',
    'karma',
    '@angular-devkit',
    '@angular-cli',
    'angular-cli',
  ],
  react: [
    'react',
    '@types/react',
    'redux',
    '@reduxjs/toolkit',
    'react-router',
    'react-query',
    'recoil',
    'next.js',
    'gatsby',
    'styled-components',
    'emotion',
    'material-ui',
    '@mui',
    'react-testing-library',
    'jest',
  ],
  vue: [
    'vue',
    'vuex',
    'vue-router',
    'nuxt',
    'vuetify',
    '@vue',
    'vuepress',
    'vue-cli',
    '@vue/cli',
    'vue-test-utils',
  ],
  node: [
    'express',
    'nest',
    'fastify',
    'koa',
    'prisma',
    'typeorm',
    'sequelize',
    'mongoose',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    '@nestjs',
    '@types/express',
    '@types/node',
    'nodemon',
    'pm2',
    'jest',
    'supertest',
  ],
  python: [
    'django',
    'flask',
    'fastapi',
    'sqlalchemy',
    'alembic',
    'pytest',
    'celery',
    'pandas',
    'numpy',
    'scipy',
    'scikit-learn',
    'tensorflow',
    'pytorch',
  ],
  devops: [
    'docker',
    'kubernetes',
    'terraform',
    'aws-sdk',
    'azure-sdk',
    'google-cloud',
    'jenkins',
    'gitlab',
    'github-actions',
    'circleci',
    'prometheus',
    'grafana',
  ],
  testing: [
    'jest',
    'mocha',
    'chai',
    'cypress',
    'selenium',
    'playwright',
    'puppeteer',
    '@testing-library',
    'enzyme',
    'karma',
    'jasmine',
    'pytest',
    'unittest',
  ],
  database: [
    'postgresql',
    'mysql',
    'mongodb',
    'redis',
    'prisma',
    'typeorm',
    'sequelize',
    'mongoose',
    'sqlalchemy',
    'knex',
    'sqlite',
  ],
};

export class OutputFormatter {
  /**
   * Formats the tech stack analysis output
   */
  static async format(
    content: string,
    format: keyof typeof OUTPUT_FORMATS = 'markdown',
    options: FormatterOptions = {}
  ): Promise<string> {
    if (format === 'json') {
      return content;
    }

    const formatConfig = OUTPUT_FORMATS[format] as FormatConfig;
    const { showVersions, focusArea, techFocus, dependencies = [] } = options;

    // Get all technology names from the content
    const allTechs = content
      .split('\n')
      .map((line) => {
        line = line.trim();
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          return line.slice(1).trim().split(' ')[0];
        }
        return '';
      })
      .filter((tech) => tech);

    // Filter technologies based on focus area or tech focus
    let filteredTechs = allTechs;
    try {
      if (focusArea) {
        const prompt = formatPrompt(FOCUS_AREA_PROMPT, {
          dependencies: JSON.stringify(allTechs),
          focusArea: focusArea,
        });
        const result = await AIClient.filterTechnologies(prompt);
        filteredTechs = result;
      }

      if (techFocus) {
        const prompt = formatPrompt(TECH_FOCUS_PROMPT, {
          dependencies: JSON.stringify(filteredTechs),
          techFocus: techFocus,
        });
        const result = await AIClient.filterTechnologies(prompt);
        filteredTechs = result;
      }
    } catch (error) {
      console.warn('Failed to filter technologies:', (error as Error).message);
    }

    // Format the filtered technologies
    const lines = content
      .split('\n')
      .map((line) => {
        line = line.trim();
        if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
          return '';
        }

        const tech = line.slice(1).trim();
        const techName = tech.split(' ')[0];

        if (!filteredTechs.includes(techName)) {
          return '';
        }

        if (showVersions) {
          const dep = dependencies.find((d) => d.name === techName);
          if (dep) {
            const majorVersion = dep.version.split('.')[0];
            return `${formatConfig.list}${tech} (v${majorVersion})`;
          }
        }

        return formatConfig.list + tech;
      })
      .filter((line) => line);

    return lines.join('\n').trim();
  }

  /**
   * Formats the categorized dependencies
   */
  static async formatCategories(
    categories: Record<string, string[]>,
    format: keyof typeof OUTPUT_FORMATS = 'markdown',
    options: FormatterOptions = {}
  ): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(categories, null, 2);
    }

    const formatConfig = OUTPUT_FORMATS[format] as FormatConfig;
    const { showVersions, focusArea, techFocus, dependencies = [] } = options;

    // Get all technology names
    const allTechs = Object.values(categories).flat();

    // Filter technologies based on focus area or tech focus
    let filteredTechs = allTechs;
    try {
      if (focusArea) {
        const prompt = formatPrompt(FOCUS_AREA_PROMPT, {
          dependencies: JSON.stringify(allTechs),
          focusArea: focusArea,
        });
        const result = await AIClient.filterTechnologies(prompt);
        filteredTechs = result;
      }

      if (techFocus) {
        const prompt = formatPrompt(TECH_FOCUS_PROMPT, {
          dependencies: JSON.stringify(filteredTechs),
          techFocus: techFocus,
        });
        const result = await AIClient.filterTechnologies(prompt);
        filteredTechs = result;
      }
    } catch (error) {
      console.warn('Failed to filter technologies:', (error as Error).message);
    }

    // Filter and format categories
    const formattedCategories = Object.entries(categories)
      .map(([category, items]) => {
        const filteredItems = items.filter((item) => filteredTechs.includes(item));

        if (filteredItems.length === 0) return '';

        const formattedCategory = category.replace(/_/g, ' ');
        const formattedItems = filteredItems.map((item) => {
          if (showVersions) {
            const dep = dependencies.find((d) => d.name === item);
            if (dep) {
              const majorVersion = dep.version.split('.')[0];
              return `${formatConfig.list}${item} (v${majorVersion})`;
            }
          }
          return formatConfig.list + item.trim();
        });

        return formatConfig.subheader + formattedCategory + '\n' + formattedItems.join('\n');
      })
      .filter((category) => category);

    return formattedCategories.join('\n\n').trim();
  }
}
