export function suggestCommands(
  command: string,
  activeCommands: readonly string[],
): readonly string[] {
  const normalizedCommand = command.trim();

  if (normalizedCommand.length < 3) {
    return [];
  }

  return activeCommands
    .map((activeCommand) => ({
      command: activeCommand,
      score: suggestionScore(normalizedCommand, activeCommand),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.command.localeCompare(second.command);
    })
    .slice(0, 3)
    .map((candidate) => candidate.command);
}

function suggestionScore(inputCommand: string, activeCommand: string): number {
  if (activeCommand === inputCommand) {
    return 4;
  }

  if (activeCommand.startsWith(inputCommand)) {
    return 3;
  }

  if (activeCommand.includes(inputCommand)) {
    return 2;
  }

  if (inputCommand.includes(activeCommand)) {
    return 1;
  }

  return 0;
}
