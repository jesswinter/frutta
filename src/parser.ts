export type TimerOptions = {
  duration: string;
};

export type ParseCommandLineResult =
  | ["error", string]
  | ["showHelp"]
  | ["showVersion"]
  | ["startTimer", TimerOptions];

/**
 * Parses the command line and returns the expected operation or error.
 * @param argv argv from node process object or an equivlent array of strings
 */
export function parseCommandLine(argv: string[]): ParseCommandLineResult {
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
