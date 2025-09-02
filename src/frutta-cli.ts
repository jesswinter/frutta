import fs from "node:fs/promises";
import url from "node:url";
import path from "node:path";
import { CAC, Command } from "cac";
import { startTerminalTimer } from "./terminal-timer.js";

const cli = new CAC("frutta");
cli.version(await getVersion());
cli.help();

// Default command is pomodoro
setupPomodoroCommand(cli.command("", ""));
setupPomodoroCommand(
  cli.command("pomodoro", "(default) Start a pomodoro timer")
);

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

// const [operation, options] = parseCommandLine(process.argv);
// let exitCode = 0;
// if (operation === "error") {
//   console.log(options);
//   exitCode = 1;
// } else if (operation === "showVersion") {
//   await showVersion();
// } else if (operation === "startTimer") {
//   let duration = parseInt(options.duration, 10);
//   if (options.duration.endsWith("h")) {
//     duration *= 1000 * 60 * 60;
//   } else if (options.duration.endsWith("s")) {
//     duration *= 1000;
//   } else {
//     duration *= 1000 * 60;
//   }

//   if (!(duration > 0)) {
//     console.error(`Duration must be greater than 0. Got ${options.duration}`);
//     exitCode = 1;
//   } else {
//     exitCode = await startTerminalTimer(duration);
//   }
// } else {
//   showHelp();
// }

// process.exit(exitCode);

/** @returns the version from package.json */
async function getVersion(): Promise<string> {
  const scriptDir = path.dirname(url.fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(scriptDir, "..", "package.json");
  const fileContent = await fs.readFile(packageJsonPath, { encoding: "utf8" });
  const packageJson = JSON.parse(fileContent);
  return packageJson.version;
}

/** Configures action and options for the pomodoro command */
function setupPomodoroCommand(cmd: Command): void {
  cmd.option(
    "-d, --duration <time>",
    `Duration of the timer with option units
    'h': hours
    'm': minutes (default)
    's': seconds`
  );
  cmd.action(async function pomodoro(options) {
    const durationMs = parseDuration(options.duration || "25m");
    if (!durationMs) {
      throw new Error(`Invalid duration '${options.duration}'`);
    }

    let exitCode = await startTerminalTimer(durationMs);
  });

  cmd.example(`frutta ${cmd.name} 60   # 60 minute timer`);
  cmd.example(`frutta ${cmd.name} 10m  # 10 mintue timer`);
}

/**
 * Parses a duration option from the command line
 * @returns duration in ms or null if the str could not be parsed
 */
function parseDuration(option: string): number | null {
  let duration = parseInt(option, 10);
  if (option.endsWith("h")) {
    duration *= 1000 * 60 * 60;
  } else if (option.endsWith("s")) {
    duration *= 1000;
  } else {
    // default units are minutes
    duration *= 1000 * 60;
  }

  if (duration > 0) return duration;

  return null;
}
