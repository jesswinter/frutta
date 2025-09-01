import fs from "node:fs/promises";
import url from "node:url";
import path from "node:path";
import { showHelp } from "./help.js";
import { parseCommandLine } from "./parser.js";
import { startTerminalTimer } from "./terminal-timer.js";

const [operation, options] = parseCommandLine(process.argv);
let exitCode = 0;
if (operation === "error") {
  console.log(options);
  exitCode = 1;
} else if (operation === "showVersion") {
  await showVersion();
} else if (operation === "startTimer") {
  let duration = parseInt(options.duration, 10);
  if (options.duration.endsWith("h")) {
    duration *= 1000 * 60 * 60;
  } else if (options.duration.endsWith("s")) {
    duration *= 1000;
  } else {
    duration *= 1000 * 60;
  }

  if (!(duration > 0)) {
    console.error(`Duration must be greater than 0. Got ${options.duration}`);
    exitCode = 1;
  } else {
    exitCode = await startTerminalTimer(duration);
  }
} else {
  showHelp();
}

process.exit(exitCode);

async function showVersion() {
  const scriptDir = path.dirname(url.fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(scriptDir, "..", "package.json");
  const fileContent = await fs.readFile(packageJsonPath, { encoding: "utf8" });
  const packageJson = JSON.parse(fileContent);
  console.log(`frutta version ${packageJson.version}`);
}
