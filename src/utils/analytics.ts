import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import { config } from "dotenv";
import machine from "node-machine-id";
import path from "path";

import { getDirPath } from "./files.js";

import type { apiObject } from "@rudderstack/rudder-sdk-node";

const envPath = path.join(getDirPath(import.meta.url), "../../", ".env-public-analytics");
config({ path: envPath });

let client: RudderAnalytics.default | undefined;

const getClient = () => {
  if (!client) {
    try {
      client = new RudderAnalytics.default(process.env.RUDDER_STACK_KEY!, {
        dataPlaneUrl: process.env.RUDDER_STACK_DATAPLANE_URL!,
        logLevel: "error",
      });
    } catch {
      // ignore or handle the error appropriately
    }
  }
  return client!;
};

export const track = async (event: string, properties?: unknown) => {
  const clientInstance = getClient();
  if (!clientInstance || process.env.NO_TRACKING) return;

  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve) => {
    const raceFunction = setTimeout(() => {
      resolve();
    }, 1000);
    clientInstance!.track(
      {
        userId: await machine.machineId(),
        event,
        properties: properties as apiObject,
      },
      () => {
        clearTimeout(raceFunction);
        resolve();
      }
    );
  });
};
