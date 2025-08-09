# Rotating polygon physics simulation

A browser-based physics toy built with React, TypeScript, Vite, Matter.js, Canvas 2D, Leva, and the Web Audio API.  
The simulation shows a ball bouncing inside a rotating polygon with fully adjustable parameters and live updates.

## ✨ Features

- Change polygon sides (3–8) in real time
- Control rotation direction and speed
- Adjust wall slipperiness/stickiness
- Change ball size and bounciness
- Live gravity control (0g to 2g, default Earth gravity)
- Toggle collision click sounds and motor hum
- Tiny debug overlay with FPS and basic stats
- Smooth 60 FPS target on desktop Chrome/Edge

## 🛠 Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for tooling and dev server
- [Matter.js](https://brm.io/matter-js/) for physics
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for rendering
- [Leva](https://leva.pm/) for the live control panel
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for sound effects

## 🚀 Getting started

**Prerequisites**
- [Node.js](https://nodejs.org/) 18 or higher
- [npm](https://www.npmjs.com/) (bundled with Node) or [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/)

**Clone the repo**
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>