import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import * as dotenv from "dotenv";
import { machineId } from "node-machine-id";

import type { apiObject } from "@rudderstack/rudder-sdk-node";

dotenv.config();

let client: RudderAnalytics | undefined;
try {
  client = new RudderAnalytics(process.env.RUDDER_STACK_KEY!, {
    dataPlaneUrl: process.env.RUDDER_STACK_DATAPLANE_URL!,
  });
} catch {
  // ignore
}

export const track = async (event: string, properties?: unknown) => {
  if (!client || process.env.NO_TRACKING) return;

  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve) => {
    const raceFunction = setTimeout(() => {
      resolve();
    }, 1000);
    client!.track(
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
