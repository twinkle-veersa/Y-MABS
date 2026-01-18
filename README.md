# Merck HCP Portal

This project was generated using [Angular CLI](https://github.com/angular/angular-cli).
For more details and official documentation follow [angular.dev](https://angular.dev/).

## Project Specifications

- **NodeJS** (Runtime): versions **>= 22.14.xx**
- **NPM** (Package Manager) **>= 10.9.xx**
- **Angular** (Framework) **>= 21.1.xx**
- **VS Code** (IDE) **(recommended)**

**NOTE**: This project is configured with **npm** as the preffered package manager, please **don't use yarn** or any commands around `yarn` ecosystem in this project.

## Setup

1. Ensure you are running **NodeJs** version greater than **22.14.xx**. You can check this by running `node -v` command in your terminal.
2. Clone this repository to the desired location and switch to the project root directory.
3. Ensure you are using **npm version >= 10.9.xx**. To check this use `npm -v` command.
4. To install the project dependencies simply run `npm install` in your terminal. This will install all the dependencies required for this project.
5. Now you are ready and good to run the project simply run `npm start`. 🎉

**NOTE**: This project comes with some vscode settings and extensions configured, please don't forget to install the workspace recommended extensions. This would be prompted when you open this project in vscode for the first time.

## Additional tools configured with this project

- **EsLint**: To ensure best coding practices, eslint with all necessary rules as per the latest coding standards and recommendations from angular, typescript, etc. are configured in this project. To check for lint issues or find bad coding practices in the project, you can use `npm run lint` command in your terminal.

- **Prettier**: To keep the codebase constistent and maintainable over the time, `prettier` is configured with standard code formating rules in this project. A consistent code formatting throughout the project ensures better code readability and promotes faster debugging & development. Use `npm run format-check` to check for formatting issues in the codebase and `npm run format-fix` to fix the formatting issues.

- **Commitlint**: Commitlint is configured with this project to ensure every commit message follows the conventional commit standards.

- **Conventional Commits**: This project uses conventional commits standards for commit messages. Refer this [link](https://www.conventionalcommits.org/en/v1.0.0/#summary) for more details.

- **Commitizen**: A handy tool to help developers follow the conventinal commits standards which will guide them through properly structuring their commit messages. Use `npm run commit` command in your terminal to invoke this.

- **Husky**: This project also comes with uses git hooks configured to enforce and ensure all the required checks and standards pass at different stages of development workflow, this keeps the codebase consistent, maintainable and always bound to follow the best coding standards and recommended guidelines.

- **Bundle Analyzer**: To keep track of the bundle sizes and keep the app performant over time, `esbuild-visualizer` has been setup in this project to have a better view of the bundles sizes generated over the time and optimize it. To view this, use `npm run visualize` command in the terminal and open `stats.html` in any browser of your choice, you can find this in the dist folder after the build completes --> `dist/lantheus-portal/stats.html`.

## Development server

To start a local development server, run:

```bash
npm start
```

OR

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:3200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

OR

> If Angular is not installed globally, you can put `npm run` in the beginning of this command, to get the same result. This would work for any Angular CLI related commands, which starts with `ng` and you can simply use `npm run ng` instead followed by the further CLI command.

Example:

```bash
npm run ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Linting

To lint the project run:

```bash
ng lint
```

OR

```bash
npm run lint
```

## Building

To build the project run:

```bash
ng build
```

OR

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Jest](https://jestjs.io/) test runner, use the following command:

```bash
ng test
```

OR

```bash
npm run test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
