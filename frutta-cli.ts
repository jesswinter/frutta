import packageConfig from "./package.json" with { type: "json" };
import cliProgress from "cli-progress";
const { SingleBar, Presets, Format } = cliProgress;

const [operation, options] = parseCommandLine(process.argv);
if (operation === "error") {
  console.log(options);
  process.exit(1);
} else if (operation === "showVersion") {
  console.log(`frutta version ${packageConfig.version}`);
} else if (operation === "startTimer") {
  fruttaCmd(options.duration);
} else {
  showHelp();
}

type TimerOptions = {
  duration: string;
};

type ParseCommandLineResult =
  | ["error", string]
  | ["showHelp"]
  | ["showVersion"]
  | ["startTimer", TimerOptions];

  /**
 * Parses the command line and returns the expected operation or error.
 * @param argv argv from node process object or an equivlent array of strings
 */
function parseCommandLine(argv: string[]): ParseCommandLineResult {
  if (argv.length === 2) {
    return ["showHelp"];
  }

  if (argv.length === 3) {
    switch (argv[2]) {
      case "-h":
      case "--help":
        return ["showHelp"];

      case "-v":
      case "--version":
        return ["showVersion"];

      default: {
        if (!/^\d+[hms]?$/.test(argv[2])) {
          return ["error", `Invalid duration: ${argv[2]}`];
        }

        return ["startTimer", { duration: argv[2] }];
      }
    }
  }

  return ["error", `Expected 1 argument, got ${argv.length - 2}`];
}

/**
 * Outputs help message to the console.
 */
function showHelp(): void {
  console.log(`usage: frutta [-h | --help] [-v | --version] <duration>

<duration> - duration of the timer with option units: 
  h: hours
  m: minutes (default)
  s: seconds

-h | --help - Display this help message and exit
-v | --version - Display version information and exit

Examples:
  frutta 60   # 60 minute timer
  frutta 10m  # 10 mintue timer`);
}

/**
 * Executes frutta command
 * @param durationStr duration argument from command line
 */
export function fruttaCmd(durationStr: string): void {
  let duration = parseInt(durationStr, 10);
  if (durationStr.endsWith("h")) {
    duration *= 1000 * 60 * 60;
  } else if (durationStr.endsWith("s")) {
    duration *= 1000;
  } else {
    duration *= 1000 * 60;
  }

  if (!(duration > 0)) {
    console.error(`Duration must be greater than 0. Got ${durationStr}`);
    process.exit(1);
  }

  startTerminalTimer(duration);
}

/**
 * Starts a timer the shows progress in the terminal.
 * @param durationMs time in ms
 */
export function startTerminalTimer(durationMs: number): void {
  // Timer's start time in ms
  const startMs = Date.now();

  const progressBar = new SingleBar(
    {
      format: formatProgressString,
      hideCursor: true,
    },
    Presets.shades_classic
  );

  progressBar.start(durationMs, 0);

  // The last second (floored elapsedTime) the progress bar was updated.
  let lastUpdateSecond = 0;

  // ID for the timer's timeout
  let timeoutId = setTimeout(function updateProgressIfNeeded() {
    clearTimeout(timeoutId);

    // Elasped time since timer start in ms
    const elapsedTime = Date.now() - startMs;

    // Current whole second since timer start
    const curSecond = Math.floor(elapsedTime / 1000);

    /** @returns Gets the delay until the next update check in ms */
    function getUpdateCheckDelayMs(): number {
      return Math.max(0, 1000 - (elapsedTime - lastUpdateSecond * 1000));
    }

    if (curSecond <= lastUpdateSecond) {
      timeoutId = setTimeout(updateProgressIfNeeded, getUpdateCheckDelayMs());
      return;
    }

    lastUpdateSecond = curSecond;
    progressBar.update(elapsedTime);

    if (elapsedTime >= durationMs) {
      progressBar.stop();
    } else {
      timeoutId = setTimeout(updateProgressIfNeeded, getUpdateCheckDelayMs());
    }
  }, 500);
}

/**
 * format function passed to cli-progress to show the timer's progress on a console.
 * @returns The formatted progress string
 */
function formatProgressString(
  options: cliProgress.Options,
  params: cliProgress.Params
): string {
  const elapsedSeconds = Math.floor(params.value / 1000);
  const remainingSeconds = Math.floor(params.total / 1000) - elapsedSeconds;
  const timePassed = Format.TimeFormat(elapsedSeconds, options, 1);
  const timeRemaining = Format.TimeFormat(remainingSeconds, options, 1);

  const bar = Format.BarFormat(params.progress, options);

  return `${bar} | ${timePassed} passed | ${timeRemaining} remaining`;
}
