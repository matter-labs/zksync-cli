import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import dotenv from "dotenv";
import { machineId } from "node-machine-id";
import path from "path";

import type { apiObject } from "@rudderstack/rudder-sdk-node";

const envPath = path.join(__dirname, "../../", ".env-public-analytics");
dotenv.config({ path: envPath });

let client: RudderAnalytics | undefined;

const getClient = () => {
  if (!client) {
    try {
      client = new RudderAnalytics(process.env.RUDDER_STACK_KEY!, {
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
        userId: await machineId(),
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
