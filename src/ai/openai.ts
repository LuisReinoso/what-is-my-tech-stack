import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export class AIClient {
  /**
   * Generates a description for a tech stack using OpenAI
   */
  static async generateTechStackDescription(
    techStack: Record<string, any>,
    format: 'markdown' | 'text' | 'json' = 'markdown'
  ): Promise<string> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const prompt = this.createPrompt(techStack, format);
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
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
    techStack: Record<string, any>,
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
          model: 'gpt-4o-mini',
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
        return JSON.parse(content);
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
}
