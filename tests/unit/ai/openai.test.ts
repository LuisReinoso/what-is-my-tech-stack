import { AIClient } from '../../../src/ai/openai.js';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('AIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
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

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: jest.fn().mockResolvedValue(mockResponse),
              },
            },
          }) as unknown as OpenAI
      );

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

      const mockCreate = jest
        .fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockResponse);

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as unknown as OpenAI
      );

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
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as unknown as OpenAI
      );

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

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: jest.fn().mockResolvedValue(mockResponse),
              },
            },
          }) as unknown as OpenAI
      );

      const dependencies = [
        { name: 'react', version: '17.0.0' },
        { name: 'jest', version: '27.0.0' },
      ];

      const result = await AIClient.categorizeDependencies(dependencies);
      expect(result).toEqual({
        framework: ['react'],
        testing: ['jest'],
      });
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

      const mockCreate = jest
        .fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockResponse);

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as unknown as OpenAI
      );

      const dependencies = [{ name: 'react', version: '17.0.0' }];

      const result = await AIClient.categorizeDependencies(dependencies);
      expect(result).toEqual({
        framework: ['react'],
      });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

      MockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as unknown as OpenAI
      );

      const dependencies = [{ name: 'react', version: '17.0.0' }];

      await expect(AIClient.categorizeDependencies(dependencies)).rejects.toThrow(
        'Failed to categorize dependencies after 3 attempts'
      );
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });
  });
});
