import * as shell from "shelljs";

export interface CommandResult {
  output: string;
  exitCode: number;
}

export const executeCommand = (command: string): CommandResult => {
  const result = shell.exec(command, { async: false });
  return {
    exitCode: result.code,
    output: result.stdout.trim() || result.stderr.trim(),
  };
};
