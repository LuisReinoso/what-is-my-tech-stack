# What Is My Tech Stack?

A CLI tool that analyzes your project's dependencies and generates a clear, human-readable description of your tech stack using AI. Perfect for developers preparing their CVs or documenting their projects.

## Features

- 📦 Analyzes package.json and requirements.txt files
- 🤖 Uses OpenAI to generate human-readable descriptions
- 📝 Provides formatted output ready for CVs/portfolios
- 🚀 Supports both Node.js and Python projects
- 💡 Intelligent categorization of technologies

## Installation

```bash
# Install globally using pnpm
pnpm add -g what-is-project-tech-stack

# Or run directly using pnpm
pnpm dlx what-is-project-tech-stack
```

## Usage

```bash
# Basic usage - analyzes current directory
what-is-my-tech-stack

# Specify a different project directory
what-is-my-tech-stack --dir /path/to/project

# Output in different formats
what-is-my-tech-stack --format markdown
what-is-my-tech-stack --format json
```

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_api_key_here
```

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/what-is-project-tech-stack.git

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Start in development mode
pnpm dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 