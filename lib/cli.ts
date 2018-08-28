#!/usr/bin/env node
import { tsGen } from "ts-generator";

import { parseArgs } from "./parseArgs";
import Typechain from "./index";
import { logger } from "./logger";

async function main() {
  (global as any).IS_CLI = true;
  const options = parseArgs();
  const cwd = process.cwd();

  await tsGen({ cwd }, new Typechain({ cwd, rawConfig: { ...options, generator: "typechain" } }));
}

main().catch(e => {
  // tslint:disable-next-line
  logger.error("Error occured: ", e.message);
  process.exit(1);
});