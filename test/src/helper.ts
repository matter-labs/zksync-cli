import { spawnSync } from "child_process";


export function executeCommand(command: string) {
  const result = spawnSync(command, { encoding: 'utf-8', shell: true, stdio: 'pipe' });

  if (result.error) {
    return {
      output: '' || result.stderr.trim(),
      exitCode: result.status || 1, error: result.error
    };
  } else {
    console.log(result.stdout);
    return {
      output: result.stdout.trim() || result.stderr.trim(),
      exitCode: result.status || 0
    };
  }
}
