/**
 * Outputs help message to the console.
 */
export function showHelp(): void {
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
