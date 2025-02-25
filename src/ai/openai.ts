import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MODEL = 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface TechStackItem {
  name: string;
  version: string;
  description?: string;
}

type TechStackMap = Record<string, TechStackItem[]>;

export class AIClient {
  /**
   * Generates a description for a tech stack using OpenAI
   */
  static async generateTechStackDescription(
    techStack: TechStackMap,
    format: 'markdown' | 'text' | 'json' = 'markdown'
  ): Promise<string> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const prompt = this.createPrompt(techStack, format);
        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a technical expert who specializes in analyzing project dependencies and providing clear, concise descriptions of tech stacks.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error('No content in OpenAI response');
        }

        return response.choices[0].message.content;
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error(
            `Failed to generate tech stack description after ${MAX_RETRIES} attempts: ${
              (error as Error).message
            }`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }
    throw new Error('Failed to generate tech stack description');
  }

  /**
   * Creates a prompt for the OpenAI API based on the tech stack
   */
  private static createPrompt(
    techStack: TechStackMap,
    format: 'markdown' | 'text' | 'json'
  ): string {
    const prompt = `Analyze the following tech stack and provide a clear, professional description of the technologies used. Focus on the main purpose and benefits of each category of dependencies.

Tech Stack:
${JSON.stringify(techStack, null, 2)}

Please provide the output in ${format} format. For each category:
1. List the technologies used
2. Provide a brief, professional description of how these technologies work together
3. Highlight any notable features or industry-standard tools

Keep the descriptions concise but informative, suitable for a CV or project documentation.`;

    return prompt;
  }

  /**
   * Categorizes a list of dependencies using OpenAI
   */
  static async categorizeDependencies(
    dependencies: { name: string; version: string }[]
  ): Promise<Record<string, string[]>> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const prompt = `Categorize the following dependencies into meaningful groups:
${JSON.stringify(dependencies, null, 2)}

Group them into categories like:
- Frontend Frameworks
- Backend Frameworks
- Testing Tools
- Build Tools
- Database
- Utilities
- etc.

Return the result as a JSON object where each key is a category and the value is an array of dependency names.`;

        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a technical expert who specializes in categorizing software dependencies.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error('No content in OpenAI response');
        }

        const content = response.choices[0].message.content;
        const result = JSON.parse(content) as Record<string, string[]>;
        return result;
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error(
            `Failed to categorize dependencies after ${MAX_RETRIES} attempts: ${
              (error as Error).message
            }`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }
    throw new Error('Failed to categorize dependencies');
  }

  /**
   * Filters technologies based on a specific focus or area
   */
  static async filterTechnologies(prompt: string): Promise<string[]> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a technical expert who specializes in analyzing and filtering technology stacks. Always return your response as a JSON array.',
            },
            {
              role: 'user',
              content: prompt + '\n\nReturn the result as a JSON array.',
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error('No content in OpenAI response');
        }

        const content = response.choices[0].message.content;
        try {
          const result = JSON.parse(content) as string[];
          return result;
        } catch (error) {
          // If the response is not valid JSON, try to extract array from the text
          const matches = content.match(/\[(.*)\]/s);
          if (matches) {
            const arrayContent = matches[0];
            const result = JSON.parse(arrayContent) as string[];
            return result;
          }
          throw new Error('Failed to parse AI response as JSON array');
        }
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error(
            `Failed to filter technologies after ${MAX_RETRIES} attempts: ${
              (error as Error).message
            }`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }
    throw new Error('Failed to filter technologies');
  }
}
