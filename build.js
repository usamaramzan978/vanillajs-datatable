import { rollup } from "rollup";
import config from "./rollup.config.js";

async function build() {
  const bundle = await rollup(config);
  await Promise.all(config.output.map((output) => bundle.write(output)));
  console.log("Build completed!");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
