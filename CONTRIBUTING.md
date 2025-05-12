# Contributing to ecoBrowse

Thank you for your interest in contributing to ecoBrowse! We welcome contributions of all kinds, from bug reports to new features. Please take a moment to review this guide to understand how you can contribute.

## Table of Contents

- [Setting Up Your Development Environment](#setting-up-your-development-environment)
- [Suggesting New Features](#suggesting-new-features)
- [Reporting Bugs](#reporting-bugs)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Code Style](#code-style)

## Setting Up Your Development Environment

To set up your local development environment, you'll need Node.js and npm or yarn installed.

1. **Clone the repository:**
```
bash
   git clone https://github.com/iyergkris/ecoBrowse.git
   cd ecoBrowse
   
```
2. **Install dependencies:**
```
bash
   npm install
   # or
   yarn install
   
```
3. **Run the development server:**
```
bash
   npm run dev
   # or
   yarn dev
   
```
This will start the development server at `http://localhost:9002` (or the port specified in your `next.config.ts`).

## Suggesting New Features

We love to hear your ideas for new features! To suggest a new feature, please open an issue on the GitHub repository. Clearly describe the feature, its potential benefits, and any alternatives you've considered.

## Reporting Bugs

If you find a bug, please report it by opening an issue on the GitHub repository. Provide as much detail as possible to help us understand and reproduce the issue. Include:

- A clear and concise description of the bug.
- Steps to reproduce the behavior.
- Expected behavior.
- Actual behavior.
- Screenshots or videos (if applicable).
- Your operating system, browser, and ecoBrowse version.

## Submitting Pull Requests

We welcome pull requests! To submit a pull request:

1. **Fork the repository.**
2. **Create a new branch:**
```
bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bugfix-name
   
```
3. **Make your changes.**
4. **Commit your changes:**
```
bash
   git commit -m "feat: Add your feature description"
   # or
   git commit -m "fix: Fix your bug description"
   
```
(Please use conventional commits if possible.)

5. **Push your branch:**
```
bash
   git push origin feature/your-feature-name
   # or
   git push origin bugfix/your-bugfix-name
   
```
6. **Open a pull request** on the original repository.

Please ensure your pull request includes:

- A clear description of the changes.
- References to any related issues.
- Passing tests (if applicable).
- Adherence to the code style.

## Code Style

We strive to maintain a consistent code style throughout the project. We use ESLint and Prettier to help enforce this. Please ensure your code passes linting and formatting checks before submitting a pull request.

You can run the linter and formatter with the following commands:
```
bash
npm run lint
npm run format
# or
yarn lint
yarn format
```
Thank you for contributing to ecoBrowse!