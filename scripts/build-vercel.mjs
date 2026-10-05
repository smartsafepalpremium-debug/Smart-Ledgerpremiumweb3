import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(rootDir, "..");
const outputDir = path.join(projectDir, "public");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await rm(outputDir, { recursive: true, force: true });
run("npm", ["run", "build:user"], { BASE_PATH: "/" });
run("npm", ["run", "build:admin"], { BASE_PATH: "/admin/" });

await mkdir(outputDir, { recursive: true });
await cp(path.join(projectDir, "artifacts/user-app/dist/public"), outputDir, {
  recursive: true,
});
await mkdir(path.join(outputDir, "admin"), { recursive: true });
await cp(
  path.join(projectDir, "artifacts/admin/dist/public"),
  path.join(outputDir, "admin"),
  { recursive: true },
);