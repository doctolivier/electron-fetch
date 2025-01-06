import { $, chalk } from "zx";
import esbuild from "esbuild";

const buildESM = async () => {
  try {
    await esbuild.build({
      entryPoints: ["src/**/*.ts"],
      outdir: "lib/esm",
      platform: "node",
      sourcemap: true,
      target: "esnext",
      format: "esm",
    });

    await $`echo '{"type": "module"}' > lib/esm/package.json`;
    console.log(chalk.green("ESM compilation successful"));
  } catch (error) {
    console.error(
      chalk.red("ESM compilation failed:"),
      chalk.red(error.message)
    );
  }
};

const buildCJS = async () => {
  try {
    await esbuild.build({
      entryPoints: ["src/**/*.ts"],
      outdir: "lib/cjs",
      platform: "node",
      sourcemap: true,
      target: "esnext",
      format: "cjs",
    });

    await $`echo '{"type": "commonjs"}' > lib/cjs/package.json`;
    console.log(chalk.green("CJS compilation successful"));
  } catch (error) {
    console.error(
      chalk.red("CJS compilation failed:"),
      chalk.red(error.message)
    );
  }
};

try {
  await $`rm -rf ./lib`;
  await $`npx tsc --declaration --emitDeclarationOnly --outDir lib/esm`;
  await buildESM();
  await $`npx tsc --declaration --emitDeclarationOnly --outDir lib/cjs`;
  await buildCJS();
  console.log(chalk.green("Overall compilation successful"));
} catch (error) {
  console.error(chalk.red("Overall compilation failed:"));
  console.error(chalk.red(error));
}
