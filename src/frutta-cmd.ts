import { startCliTimer } from "./frutta-cli.js";

export function fruttaCmd(args) {
  if (args.length !== 1) {
    showUsage();
    process.exit(1);
  }

  const durationStr = args[0];
  let duration = parseInt(durationStr, 10);
  if (durationStr.endsWith("h")) {
    duration *= 1000 * 60 * 60;
  } else if (durationStr.endsWith("s")) {
    duration *= 1000;
  } else {
    duration *= 1000 * 60;
  }

  if (!(duration > 0)) {
    console.error(`Duration must be greater than 0. duration = ${duration}ms`);
    process.exit(1);
  }

  startCliTimer(duration);

  function showUsage() {
    console.log(`Pomodoro style timer for the command-line with progess bar.

usage: frutta <duration>

<duration> - duration of the timer with option units: 
  h: hours
  m: minutes (default)
  s: seconds

examples:
frutta 60   # 60 minute timer
frutta 10m  # 10 mintue timer`);
  }
}
