import inquirer from "inquirer";

import type { Answers, QuestionCollection } from "inquirer";

export function optionNameToParam(input: string): string {
  // "--l1-rpc-url" => "l1RpcUrl"
  const parts = input.replace(/^--/, "").split("-");

  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
  }

  return parts.join("");
}

export const fillMissingParams = async (options: Record<string, unknown>, questions: QuestionCollection) => {
  const results: Answers = await inquirer.prompt(
    (questions as Array<{ name: string }>).filter((e) => !options[e.name])
  );
  for (const prop in results) {
    options[prop] = results[prop];
  }
};
