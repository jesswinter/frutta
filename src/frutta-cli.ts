import cliProgress from "cli-progress";
const { SingleBar, Presets, Format } = cliProgress;

/**
 * Starts a timer the shows progress on the console.
 * @param durationMs time in ms
 */
export function startCliTimer(durationMs: number): void {
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
function formatProgressString(options: cliProgress.Options, params: cliProgress.Params): string {
  const elapsedSeconds = Math.floor(params.value / 1000);
  const remainingSeconds = Math.floor(params.total / 1000) - elapsedSeconds;
  const timePassed = Format.TimeFormat(elapsedSeconds, options, 1);
  const timeRemaining = Format.TimeFormat(remainingSeconds, options, 1);

  const bar = Format.BarFormat(params.progress, options);

  return `${bar} | ${timePassed} passed | ${timeRemaining} remaining`;
}
