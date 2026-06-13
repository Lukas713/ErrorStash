export type MockStatus = "SOLVED" | "UNSOLVED";

export interface MockTag {
  id: string;
  name: string;
}

export interface MockErrorEntry {
  id: string;
  title: string;
  description: string | null;
  stackTrace: string | null;
  solution: string | null;
  status: MockStatus;
  isPublic: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  tags: MockTag[];
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export const MOCK_USER: MockUser = {
  id: "user_1",
  name: "JD",
  email: "jd@example.com",
  image: null,
  isPro: true,
};

export const MOCK_TAGS: MockTag[] = [
  { id: "tag_react", name: "react" },
  { id: "tag_hooks", name: "hooks" },
  { id: "tag_typescript", name: "typescript" },
  { id: "tag_async", name: "async" },
  { id: "tag_test", name: "test" },
  { id: "tag_prisma", name: "prisma" },
  { id: "tag_postgresql", name: "postgresql" },
  { id: "tag_migrations", name: "migrations" },
  { id: "tag_nextauth", name: "nextauth" },
  { id: "tag_oauth", name: "oauth" },
  { id: "tag_nextjs", name: "next.js" },
  { id: "tag_session", name: "session" },
  { id: "tag_tailwind", name: "tailwind" },
  { id: "tag_vite", name: "vite" },
  { id: "tag_build", name: "build" },
  { id: "tag_useeffect", name: "useEffect" },
  { id: "tag_performance", name: "performance" },
  { id: "tag_stripe", name: "stripe" },
  { id: "tag_webhooks", name: "webhooks" },
  { id: "tag_api", name: "api" },
  { id: "tag_cors", name: "cors" },
  { id: "tag_type_safety", name: "type-safety" },
  { id: "tag_wsl2", name: "wsl2" },
  { id: "tag_hmr", name: "hmr" },
  { id: "tag_dev_tooling", name: "dev-tooling" },
];

export const MOCK_ERROR_ENTRIES: MockErrorEntry[] = [
  {
    id: "entry_1",
    title: "TypeError: Cannot read properties of undefined (reading 'map')",
    description:
      "Was building a custom React hook that fetches a list of items from the API. The component renders before the fetch completes, so `data` is undefined on first render. Forgot to initialize state with an empty array instead of `undefined`.",
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'map')
    at ItemList (ItemList.tsx:24:18)
    at renderWithHooks (react-dom.development.js:14985)
    at mountIndeterminateComponent (react-dom.development.js:17811)
    at beginWork (react-dom.development.js:19049)`,
    solution:
      "Initialized the state with an empty array: `const [items, setItems] = useState<Item[]>([])`. Also added optional chaining as a safety net: `items?.map(...)`. Both are needed — the state init fixes the root cause, optional chaining guards against future regressions.",
    status: "SOLVED",
    isPublic: true,
    isFavorite: true,
    isPinned: true,
    createdAt: "2025-06-08T10:00:00Z",
    tags: [
      { id: "tag_react", name: "react" },
      { id: "tag_hooks", name: "hooks" },
      { id: "tag_typescript", name: "typescript" },
    ],
  },
  {
    id: "entry_2",
    title: "test error",
    description: "Testing the error entry system.",
    stackTrace: null,
    solution: null,
    status: "UNSOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-11T09:00:00Z",
    tags: [
      { id: "tag_typescript", name: "typescript" },
      { id: "tag_async", name: "async" },
      { id: "tag_test", name: "test" },
    ],
  },
  {
    id: "entry_3",
    title: "Prisma migration failed: column already exists",
    description:
      "Ran `prisma migrate dev` after adding a new field to the schema. Migration failed because a previous incomplete migration had already added the column directly in the DB.",
    stackTrace: `Error: P3006
    Migration \`20250607_add_user_role\` failed to apply cleanly to the shadow database.
    ERROR: column "role" of relation "User" already exists`,
    solution:
      "Resolved by marking the failed migration as applied with `prisma migrate resolve --applied 20250607_add_user_role`, then ran `prisma migrate dev` again. Root cause: never manually alter production DB schema outside of migrations.",
    status: "SOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: true,
    createdAt: "2025-06-07T14:30:00Z",
    tags: [
      { id: "tag_prisma", name: "prisma" },
      { id: "tag_postgresql", name: "postgresql" },
      { id: "tag_migrations", name: "migrations" },
    ],
  },
  {
    id: "entry_4",
    title: "NextAuth session is null on first render after OAuth redirect",
    description:
      "After GitHub OAuth redirect, `useSession()` returns `null` for one render cycle before populating. Causes a flash of unauthenticated UI even when the user is logged in.",
    stackTrace: `TypeError: Cannot read properties of null (reading 'user')
    at Dashboard (dashboard/page.tsx:12:24)`,
    solution: null,
    status: "UNSOLVED",
    isPublic: false,
    isFavorite: true,
    isPinned: false,
    createdAt: "2025-06-06T11:00:00Z",
    tags: [
      { id: "tag_nextauth", name: "nextauth" },
      { id: "tag_oauth", name: "oauth" },
      { id: "tag_nextjs", name: "next.js" },
      { id: "tag_session", name: "session" },
    ],
  },
  {
    id: "entry_5",
    title: "Tailwind classes not applying after production build",
    description:
      "All styles worked in development but were stripped in the production build. Tailwind's content scanner wasn't picking up certain component files.",
    stackTrace: null,
    solution:
      "Updated the `content` array in `tailwind.config.ts` to include `./src/components/**/*.{ts,tsx}`. Classes were being used dynamically via template literals which Tailwind can't statically analyze — switched to full class names.",
    status: "SOLVED",
    isPublic: true,
    isFavorite: false,
    isPinned: false,
    createdAt: "2025-06-05T16:00:00Z",
    tags: [
      { id: "tag_tailwind", name: "tailwind" },
      { id: "tag_vite", name: "vite" },
      { id: "tag_build", name: "build" },
    ],
  },
  {
    id: "entry_6",
    title: "useEffect infinite loop when object is in dependency array",
    description:
      "Passing an object literal directly into a useEffect dependency array caused an infinite re-render loop. JavaScript reference equality means a new object is created on every render.",
    stackTrace: `Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.`,
    solution:
      "Moved the object outside the component (if static) or wrapped it in `useMemo`. For config objects: `const config = useMemo(() => ({ key: value }), [value])`. Alternatively, destructure the object and pass individual primitives as dependencies.",
    status: "SOLVED",
    isPublic: true,
    isFavorite: true,
    isPinned: false,
    createdAt: "2025-06-04T09:30:00Z",
    tags: [
      { id: "tag_react", name: "react" },
      { id: "tag_hooks", name: "hooks" },
      { id: "tag_useeffect", name: "useEffect" },
      { id: "tag_performance", name: "performance" },
    ],
  },
  {
    id: "entry_7",
    title: "Stripe webhook 400: No signatures found matching the expected signature",
    description:
      "Stripe webhook endpoint returning 400 in production. Works fine locally with the Stripe CLI. The signature validation kept failing.",
    stackTrace: `StripeSignatureVerificationError: No signatures found matching the expected signature for payload.
    Are you passing the raw request body you received from Stripe?
    at WebhooksHelper.constructEvent (stripe/lib/Webhooks.js:81)`,
    solution:
      "The issue was that Next.js was parsing the body before it reached the webhook handler. Fixed by disabling body parsing for the webhook route and reading the raw buffer instead: `export const config = { api: { bodyParser: false } }`.",
    status: "SOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: false,
    createdAt: "2025-06-03T13:00:00Z",
    tags: [
      { id: "tag_stripe", name: "stripe" },
      { id: "tag_nextjs", name: "next.js" },
      { id: "tag_webhooks", name: "webhooks" },
      { id: "tag_api", name: "api" },
    ],
  },
  {
    id: "entry_8",
    title: "CORS error when calling Supabase Edge Function from browser",
    description:
      "Browser fetch to a Supabase Edge Function failing with CORS error. The function works fine when called with curl.",
    stackTrace: `Access to fetch at 'https://xyz.functions.supabase.co/my-function' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    solution: null,
    status: "UNSOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: false,
    createdAt: "2025-06-02T10:00:00Z",
    tags: [
      { id: "tag_cors", name: "cors" },
    ],
  },
  {
    id: "entry_9",
    title: "TypeScript: Object is possibly undefined in optional chain",
    description:
      "Getting TS2532 even when using optional chaining. TypeScript still considers the final value possibly undefined after `?.`.",
    stackTrace: `TS2532: Object is possibly 'undefined'.
    const name = user?.profile?.name.toUpperCase()
                                    ^`,
    solution:
      "Optional chaining short-circuits to `undefined` if any part is nullish, but the final property access still needs a guard. Fixed with: `user?.profile?.name?.toUpperCase()` — the `?.` needs to be on every access in the chain, not just the first.",
    status: "SOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: false,
    createdAt: "2025-06-01T14:00:00Z",
    tags: [
      { id: "tag_typescript", name: "typescript" },
      { id: "tag_type_safety", name: "type-safety" },
    ],
  },
  {
    id: "entry_10",
    title: "Vite HMR disconnects constantly in WSL2 development",
    description:
      "Hot Module Replacement keeps dropping the WebSocket connection every few minutes in WSL2. Page requires a full manual refresh to see changes.",
    stackTrace: `[vite] server connection lost. Polling for restart...
WebSocket connection to 'ws://localhost:5173/' failed`,
    solution:
      "Added `server.watch: { usePolling: true }` to `vite.config.ts`. WSL2's file system bridge doesn't propagate inotify events reliably, so Vite's default watcher misses changes. Polling is slower but stable in WSL2.",
    status: "SOLVED",
    isPublic: false,
    isFavorite: false,
    isPinned: false,
    createdAt: "2025-05-31T11:00:00Z",
    tags: [
      { id: "tag_vite", name: "vite" },
      { id: "tag_wsl2", name: "wsl2" },
      { id: "tag_hmr", name: "hmr" },
      { id: "tag_dev_tooling", name: "dev-tooling" },
    ],
  },
];
