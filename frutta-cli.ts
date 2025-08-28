import packageConfig from "./package.json" with { type: "json" };
import { showHelp } from "./src/help.js";
import { parseCommandLine } from "./src/parser.js";
import { startTerminalTimer } from "./src/terminal-timer.js";

const [operation, options] = parseCommandLine(process.argv);
let exitCode = 0;
if (operation === "error") {
  console.log(options);
  exitCode = 1;
} else if (operation === "showVersion") {
  console.log(`frutta version ${packageConfig.version}`);
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