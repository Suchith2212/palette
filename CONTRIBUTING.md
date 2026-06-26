# Contributing to Palette

First of all, thank you for showing interest in contributing to Palette! It is community contributions like yours that keep the Fine Arts Club portal running smoothly.

Please take a moment to review this document to ensure a smooth and productive workflow.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](file:///f:/palette/CODE_OF_CONDUCT.md). Please report any violations or inappropriate behavior to **palette@iitgn.ac.in**.

---

## Reporting Issues

If you find a bug or want to suggest a new feature, please submit an issue through GitHub:
1. Search existing issues to check if it has already been reported.
2. If not, open a new issue using the appropriate template (Bug Report or Feature Request).
3. Provide as much detail as possible, including screenshots, steps to reproduce, and console/terminal logs.

---

## Branch Naming Convention

When working on a new feature or bug fix, create a new branch from `main`. Use the following naming format:

- `feature/short-description` (for new features, e.g. `feature/user-profiles`)
- `bugfix/short-description` (for bug fixes, e.g. `bugfix/cors-origin-fix`)
- `docs/short-description` (for documentation changes, e.g. `docs/api-reference`)
- `refactor/short-description` (for code refactoring, e.g. `refactor/seed-scripts`)

---

## Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Suchith2212/palette.git
   cd palette
   ```

2. **Install Workspace Dependencies**
   Install all dependencies for root, client, and server workspaces:
   ```bash
   npm install
   npm run install:all # Or run npm install inside client and server directories manually
   ```

3. **Configure Environment Variables**
   Create local env configurations in both frontend and backend:
   - In `server/`, copy `.env.example` to `.env` and fill in local MongoDB and SMTP details.
   - In `client/`, copy `.env.example` to `.env` and set `VITE_API_ORIGIN`.

4. **Running Locally**
   Start both front-end and back-end in development mode:
   ```bash
   # Run both concurrently from the root directory
   npm run dev:client
   npm run dev:server
   ```
   Alternatively, run `npm run dev` inside their respective directories in separate terminals.

5. **Typechecking and Build Verification**
   Verify that your TypeScript changes compile without warnings:
   ```bash
   npm run verify
   ```

---

## Coding Standards

### TypeScript & JavaScript
- Write clean, modern TypeScript.
- Define explicit interfaces/types for props, state, and API responses.
- Avoid using `any` unless absolutely necessary (e.g. error handling blocks where type is unknown).
- Use ES6+ syntax (arrow functions, destructuring, async/await).

### React (Frontend)
- Use functional components with hooks.
- Keep components small, focused, and reusable.
- Put global states in contexts (`client/src/context/`).
- Style components using Vanilla CSS. Store page styles in separate files matching the page component name (e.g., `LoginPage.tsx` and `LoginPage.css`).

### Express & Mongoose (Backend)
- Use standard RESTful conventions for Express routers.
- Encapsulate logic in controller functions.
- Use `express-async-handler` to handle controller exceptions.
- Add validations in Mongoose schemas or middleware.

---

## Commit Message Guidelines

We follow the **Conventional Commits** specification. This helps in maintaining a readable changelog and automate versions. Commit messages should look like this:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature for the user (not a build script tweak)
- `fix`: A bug fix for the user
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, etc.; no production code change
- `refactor`: Refactoring production code (e.g. renaming variables, cleaning up functions)
- `test`: Adding missing tests or correcting existing tests
- `chore`: Updating build tasks, package manager configs, etc.

### Examples
- `feat(auth): add numeric code verification for emails`
- `fix(gallery): fix image load crash on empty lists`
- `docs(readme): add installation instructions for docker`

---

## Pull Request Process

1. Ensure all TypeScript errors are resolved and the project builds successfully by running `npm run verify`.
2. Format your code consistently.
3. Commit your changes using the Conventional Commits format.
4. Push your branch to GitHub and open a Pull Request (PR) against the `main` branch.
5. Fill out the [Pull Request Template](file:///f:/palette/.github/PULL_REQUEST_TEMPLATE.md) completely.
6. A maintainer will review your code. Address any feedback and keep the PR branch updated.
7. Once approved, a maintainer will merge your branch into `main`.
