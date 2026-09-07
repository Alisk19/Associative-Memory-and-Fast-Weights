# Fast Weights Laboratory

An interactive inquiry into outer-product Hebbian writes, associative memory capacity limits, and high-dimensional sparsity mitigation based on Ba et al. (2016) and BDH Dragon Hatchling (2025).

## Overview

Fast Weights Laboratory is an interactive educational tool designed to visualize and explore the mechanics of Fast Weights in neural networks. It provides a step-by-step interactive laboratory guiding users through the core concepts of associative memory.

## Chapters

The laboratory is divided into several interactive chapters:

1. **OPEN (Intro)** - Introduction to the concepts.
2. **MECHANISM** - Exploring outer-product Hebbian writes.
3. **LOAD** - Understanding how memories are loaded into the network.
4. **INTERFERENCE** - Visualizing associative memory capacity limits and interference.
5. **SPARSIFY** - Exploring high-dimensional sparsity mitigation.
6. **BDH LENS** - Deep dive into BDH Dragon Hatchling (2025) concepts.
7. **SANDBOX** - A free-play environment to experiment with all parameters.

## Technology Stack

This project is built with:

- **React** (v19)
- **TypeScript**
- **Vite**
- **Tailwind CSS** (v4)
- **Framer Motion** (for interactive animations)
- **Lucide React** (for icons)

## Getting Started

To run the laboratory locally:

1. Clone the repository and navigate to the project directory:
   ```bash
   cd data_forge-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the project for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript type checking.
