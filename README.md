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
pnpm add -g what-is-my-tech-stack

# Or run directly using pnpm
pnpm dlx what-is-my-tech-stack
```

## Usage

Basic usage (in your project directory):

```bash
what-is-my-tech-stack
```

With options:

```bash
# Analyze a specific directory
what-is-my-tech-stack --path /path/to/project

# Output in different formats
what-is-my-tech-stack --format markdown
what-is-my-tech-stack --format text
```

### Options

- `-p, --path <path>`: Path to the project directory (default: current directory)
- `-f, --format <format>`: Output format, either 'markdown' or 'text' (default: markdown)
- `-v, --version`: Show version number
- `-h, --help`: Show help

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_api_key_here
```

## Example Output

```markdown
# Project Tech Stack Analysis

## Node.js Dependencies

### Frameworks
react, express
Description: A modern web application stack using React for the frontend and Express.js for the backend API.

### Testing Tools
jest, cypress
Description: Comprehensive testing setup with Jest for unit/integration tests and Cypress for end-to-end testing.

### Build Tools & Bundlers
webpack, babel
Description: Industry-standard build tooling with Webpack for bundling and Babel for modern JavaScript transpilation.

### Linting & Code Style
eslint, prettier
Description: Strict code quality enforcement with ESLint and consistent formatting with Prettier.

### TypeScript
typescript, @types/node
Description: Full TypeScript integration for enhanced type safety and developer experience.

### Utilities
lodash, axios
Description: Essential utility libraries for data manipulation and HTTP requests.

## Python Dependencies

### Web Frameworks
django, flask
Description: Robust web development capabilities with Django's full-featured framework and Flask's lightweight approach.

### Testing Tools
pytest, coverage
Description: Modern Python testing infrastructure with pytest and code coverage reporting.

### Database & ORM
sqlalchemy, psycopg2
Description: Flexible database integration with SQLAlchemy ORM and PostgreSQL support.

### Data Science & ML
numpy, pandas, scikit-learn
Description: Comprehensive data science stack for numerical computing, data analysis, and machine learning.

### Utilities
requests, python-dotenv
Description: Core Python utilities for HTTP operations and environment management.
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/what-is-my-tech-stack.git
   cd what-is-my-tech-stack
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

### Testing

Run the test suite:

```bash
pnpm test
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 