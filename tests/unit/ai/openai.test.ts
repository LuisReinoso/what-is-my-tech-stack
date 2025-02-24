import { AIClient } from '../../../src/ai/openai.js';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('AIClient', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';

    // Setup mock for OpenAI chat completions
    mockCreate = jest.fn();
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: mockCreate,
      },
    } as any;
  });

  describe('generateTechStackDescription', () => {
    it('should generate a description successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated tech stack description',
            },
          },
        ],
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const techStack = {
        node: {
          dependencies: [
            { name: 'react', version: '17.0.0' },
            { name: 'express', version: '4.17.1' },
          ],
        },
      };

      const result = await AIClient.generateTechStackDescription(techStack);
      expect(result).toBe('Generated tech stack description');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated after retry',
            },
          },
        ],
      };

      mockCreate.mockRejectedValueOnce(new Error('API Error')).mockResolvedValueOnce(mockResponse);

      const techStack = {
        node: {
          dependencies: [{ name: 'react', version: '17.0.0' }],
        },
      };

      const result = await AIClient.generateTechStackDescription(techStack);
      expect(result).toBe('Generated after retry');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const techStack = {
        node: {
          dependencies: [{ name: 'react', version: '17.0.0' }],
        },
      };

      await expect(AIClient.generateTechStackDescription(techStack)).rejects.toThrow(
        'Failed to generate tech stack description after 3 attempts'
      );
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });
  });

  describe('categorizeDependencies', () => {
    it('should categorize dependencies successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                framework: ['react'],
                testing: ['jest'],
              }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'jest', version: '27.0.0' },
      ];

      const result = await AIClient.categorizeDependencies(dependencies);
      expect(result).toEqual({
        framework: ['react'],
        testing: ['jest'],
      });
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                framework: ['react'],
              }),
            },
          },
        ],
      };

      mockCreate.mockRejectedValueOnce(new Error('API Error')).mockResolvedValueOnce(mockResponse);

      const dependencies = [{ name: 'react', version: '17.0.0' }];

      const result = await AIClient.categorizeDependencies(dependencies);
      expect(result).toEqual({
        framework: ['react'],
      });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const dependencies = [{ name: 'react', version: '17.0.0' }];

      await expect(AIClient.categorizeDependencies(dependencies)).rejects.toThrow(
        'Failed to categorize dependencies after 3 attempts'
      );
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });
  });
});
