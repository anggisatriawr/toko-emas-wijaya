const { execSync } = require("child_process");
const fs = require("fs");

try {
  const output = execSync("npx prisma validate", { encoding: "utf8" });
  fs.writeFileSync("validate.log", "STDOUT:\n" + output);
} catch (error) {
  fs.writeFileSync("validate.log", "ERROR STDOUT:\n" + error.stdout + "\nERROR STDERR:\n" + error.stderr);
}
