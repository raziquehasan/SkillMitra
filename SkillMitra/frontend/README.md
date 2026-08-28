# SkillMitra — Frontend

Next.js frontend for the SkillMitra Labour Market Intelligence Platform.

## Stack

- Next.js (latest) — App Router
- TypeScript
- Tailwind CSS
- ESLint

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server will start at: `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific modules
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Library configurations and clients
│   ├── services/       # API service layer (calls to backend)
│   ├── types/          # TypeScript type definitions
│   ├── constants/      # App-wide constants
│   └── utils/          # Utility functions
├── public/
│   ├── images/         # Static images
│   └── icons/          # Icon assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── Dockerfile
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
