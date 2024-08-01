// eslint-disable-next-line @typescript-eslint/no-require-imports
const options = require("@github/markdownlint-github").init({
  "no-empty-alt-text": true,
  "line-length": {
    code_block_line_length: 125,
    line_length: 125,
    heading_line_length: 125,
  },
});

module.exports = {
  config: options,
  customRules: ["@github/markdownlint-github"],
  outputFormatters: [
    ["markdownlint-cli2-formatter-pretty", { appendLink: true }], // ensures the error message includes a link to the rule documentation
  ],
};
