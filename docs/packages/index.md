# Packages

This monorepo is organized into modular packages, each serving a specific purpose.
Below is an overview of the core packages - see their individual READMEs for detailed documentation.

## 🔗 [`@fhevm/sdk`](./core.md)

Core FHEVM SDK providing cryptographic and relayer functionalities.
Includes encryption and decryption utilities, signature caching, and secure interaction with the FHEVM relayer.
It serves as the foundation for higher-level framework integrations.

## 🔗 [`@fhevm/react`](./react.md)

React bindings built on top of `@fhevm/sdk`, offering hooks and context providers for seamless integration with FHEVM smart contracts in React applications.

## 🔗 [`@fhevm/shared`](./shared.md)

Shared TypeScript definitions, ABIs, and utility functions used across all framework-specific packages.
Central point for maintaining consistent contract references and types.

## 🔗 [`@fhevm/vue`](./vue.md)

Lightweight Vue wrapper for `@fhevm/sdk`, enabling easy integration of FHEVM workflows in Vue applications with reactive state support.