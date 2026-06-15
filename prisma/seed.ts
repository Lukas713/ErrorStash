import { config } from "dotenv";
config({ path: ".env.local" });

import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws;

import { PrismaClient, Status } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TAG_NAMES = [
  "react",
  "hooks",
  "typescript",
  "nextjs",
  "prisma",
  "postgresql",
  "database",
  "docker",
  "devops",
  "css",
  "tailwind",
  "api",
  "cors",
  "nodejs",
  "npm",
  "git",
  "ssr",
];

interface EntryData {
  title: string;
  description: string;
  stackTrace: string;
  solution: string | null;
  status: Status;
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  tags: string[];
}

const ENTRIES: EntryData[] = [
  {
    title: "TypeError: Cannot read properties of undefined (reading 'map')",
    description:
      "Building a custom hook that returns a list of items. Called `.map()` on the return value before the data had loaded, causing a crash on first render.",
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'map')
    at ItemList (src/components/ItemList.tsx:18:22)
    at renderWithHooks (react-dom.development.js:14985)
    at mountIndeterminateComponent (react-dom.development.js:17811)`,
    solution:
      "Added a default value of `[]` to the hook's return and used optional chaining (`items?.map(...)`) at the call site. Also added a loading state guard before rendering.",
    status: Status.SOLVED,
    isFavorite: true,
    isPinned: true,
    isPublic: false,
    tags: ["react", "hooks", "typescript"],
  },
  {
    title: "Prisma migration failed — column already exists in table",
    description:
      "Ran `prisma migrate dev` after adding a new field to the schema. Migration failed because a previous `db push` had already added the column directly without a migration file.",
    stackTrace: `Error: P3006

Migration \`20260610120000_add_status_field\` failed to apply cleanly to the shadow database.
Error code: 42701
ERROR: column "status" of relation "ErrorEntry" already exists`,
    solution:
      "Resolved by creating a manual baseline migration. Ran `prisma migrate resolve --applied 20260610120000_add_status_field` to mark the migration as already applied, then continued with `prisma migrate dev`.",
    status: Status.SOLVED,
    isFavorite: false,
    isPinned: false,
    isPublic: false,
    tags: ["prisma", "postgresql", "database"],
  },
  {
    title: "Next.js hydration mismatch — server and client rendered different HTML",
    description:
      "A component conditionally renders content based on `window.innerWidth`. Works fine in dev, but throws a hydration warning in the console and causes a layout flash on first load.",
    stackTrace: `Warning: Prop \`className\` did not match.
 Server: "hidden"
 Client: "block"
    at Sidebar
    at DashboardLayout (src/app/(dashboard)/layout.tsx:12)`,
    solution: null,
    status: Status.UNSOLVED,
    isFavorite: false,
    isPinned: false,
    isPublic: false,
    tags: ["nextjs", "react", "ssr"],
  },
  {
    title: "Docker container exits immediately with code 0",
    description:
      "Built a Node.js Docker image and ran it with `docker run`. Container started and exited instantly with code 0 — no error, just silence.",
    stackTrace: `$ docker run my-app
(no output)
$ docker ps -a
CONTAINER ID   IMAGE     COMMAND       STATUS
a1b2c3d4e5f6   my-app    "node ."      Exited (0) 2 seconds ago`,
    solution:
      "The Dockerfile was using `CMD [\"node\", \"server.js\"]` but `server.js` ran synchronously and returned immediately. Fixed by switching to an Express server that listens on a port, keeping the process alive.",
    status: Status.SOLVED,
    isFavorite: true,
    isPinned: false,
    isPublic: false,
    tags: ["docker", "devops"],
  },
  {
    title: "TypeScript: Property 'data' does not exist on type 'ApiResponse'",
    description:
      "Defined a generic `ApiResponse<T>` type but destructured `.data` from it without the generic being passed, so TypeScript resolved it as `ApiResponse<unknown>` and couldn't guarantee `.data` existed.",
    stackTrace: `src/lib/fetcher.ts:24:22 - error TS2339:
Property 'data' does not exist on type 'ApiResponse<unknown>'

24   const { data } = await fetchEntries();`,
    solution:
      "Updated the function signature to explicitly pass the generic: `fetchEntries<ErrorEntry[]>()`. Also added a return type annotation to the function so TypeScript could infer it everywhere it was called.",
    status: Status.SOLVED,
    isFavorite: false,
    isPinned: false,
    isPublic: false,
    tags: ["typescript", "api"],
  },
  {
    title: "CORS error when calling internal API route from client component",
    description:
      "Making a `fetch('/api/errors')` call from a client component. Works locally but fails with a CORS error in preview deployments where the API and frontend are on different Vercel URLs.",
    stackTrace: `Access to fetch at 'https://error-stash-git-feature-xyz.vercel.app/api/errors'
from origin 'https://error-stash.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    solution: null,
    status: Status.UNSOLVED,
    isFavorite: false,
    isPinned: false,
    isPublic: false,
    tags: ["cors", "api", "nextjs"],
  },
  {
    title: "Tailwind CSS utility classes not applying after production build",
    description:
      "Custom color classes defined in `globals.css` under `@theme` worked in dev but disappeared after `npm run build`. The styles were simply missing from the compiled CSS.",
    stackTrace: "(no runtime error — styles visually missing in production)",
    solution:
      "The class names were being constructed dynamically with string concatenation (`\"text-\" + color`), which Tailwind's static scanner can't detect. Switched to a lookup map of complete class names so the scanner could include them in the output.",
    status: Status.SOLVED,
    isFavorite: false,
    isPinned: false,
    isPublic: false,
    tags: ["tailwind", "css", "nextjs"],
  },
  {
    title: "npm install fails — EACCES permission denied on global package",
    description:
      "Running `npm install -g prisma` on a new Linux dev machine failed with a permissions error. npm tried to write to `/usr/lib/node_modules` which is owned by root.",
    stackTrace: `npm error code EACCES
npm error syscall mkdir
npm error path /usr/lib/node_modules/prisma
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/lib/node_modules/prisma'`,
    solution:
      "Fixed by changing the npm global prefix to a user-owned directory: `npm config set prefix ~/.npm-global`, then adding `~/.npm-global/bin` to `PATH` in `.bashrc`. No more sudo needed for global installs.",
    status: Status.SOLVED,
    isFavorite: false,
    isPinned: true,
    isPublic: false,
    tags: ["npm", "nodejs"],
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@errorstash.io" },
    update: {},
    create: {
      email: "demo@errorstash.io",
      name: "Demo Dev",
      emailVerified: new Date(),
      isPro: false,
      password: hashedPassword,
    },
  });
  console.log(`User: ${user.email} (${user.id})`);

  const tagMap: Record<string, string> = {};
  for (const name of TAG_NAMES) {
    const tag = await prisma.tag.upsert({
      where: { name_userId: { name, userId: user.id } },
      update: {},
      create: { name, userId: user.id },
    });
    tagMap[name] = tag.id;
  }
  console.log(`Tags: ${TAG_NAMES.length} upserted`);

  await prisma.errorEntry.deleteMany({ where: { userId: user.id } });

  for (const entry of ENTRIES) {
    const { tags, ...data } = entry;
    await prisma.errorEntry.create({
      data: {
        ...data,
        userId: user.id,
        tags: {
          create: tags.map((name) => ({ tagId: tagMap[name] })),
        },
      },
    });
    console.log(`  + ${data.title.slice(0, 60)}...`);
  }

  console.log(`\nDone — ${ENTRIES.length} entries created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
