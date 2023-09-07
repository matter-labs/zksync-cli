# Contributing to zkSync Era CLI

## Welcome! 🎉

Hello, contributor! Thanks for thinking about helping with the `zkSync Era CLI` project. This guide will help you understand how to contribute to our CLI tool.

## Getting Started

- **Fork the project.** First, fork the `zkSync Era CLI` repository to your GitHub account.

- **Download the project.** Now, get the project on your computer:

  ```bash
  git clone https://github.com/<your-github-username>/zksync-cli.git
  ```

- **Make a new branch.** Give your branch a simple name that tells what you're working on:

  ```bash
  git checkout -b my-new-feature
  ```

## Making Changes

- **Write your code.** Keep your code clear and easy to understand. It helps everyone.

- **Test your code.** Make sure your code is covered with tests and all tests are passing:

  ```bash
  npm run test
  ```

- **Build and check your code.** Before you ask others to look at your code, make sure it works well. You can use these commands:

  ```bash
  npm run build
  npx zksync-cli [command] # you should be in the root directory of the project
  ```

- **Save your changes.** Use easy-to-understand messages when saving your changes.

- **Send your changes.** Now, put your code back on your GitHub:

  ```bash
  git push origin my-new-feature
  ```

## Sending a Pull Request

- **Ask to add your changes.** Go to the `zkSync Era CLI` repository on GitHub. You'll see a button "Compare & pull request." Click it and tell us about your changes.

- **Wait for feedback.** Our team will look at your changes. We might ask you to change some things.

Remember, we have a system that checks your code automatically when you ask to add your changes. Make sure you pass that check!

## Code Style

We have rules about how to write code. This helps everyone understand and trust the code. Use this command to make sure your code follows our rules:

```bash
npm run lint
```

## Questions?

If you have questions, you can ask on our [zkSync Community Hub](https://github.com/zkSync-Community-Hub/zkSync-developers/discussions). We're here to help!

## Thank You!

After we add your changes to the `zkSync Era CLI` project, we'll be very thankful! Your help makes our project better.

We hope you enjoy helping and come back to help more. Thanks for being part of our team!

---

*Last update: September 7, 2023*