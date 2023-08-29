import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import { machineId } from "node-machine-id";

let client: RudderAnalytics | undefined;
try {
  client = new RudderAnalytics(process.env.RUDDER_STACK_KEY!, {
    dataPlaneUrl: process.env.RUDDER_STACK_DATAPLANE_URL!,
  });
} catch (e) {}

export const track = async (event: string, properties?: any) => {
  return new Promise<void>(async (resolve) => {
    if (!client || process.env.NO_TRACKING) return;

    const raceFunction = setTimeout(() => {
      resolve();
    }, 1000);
    client!.track(
      {
        userId: await machineId(),
        event,
        properties,
      },
      () => {
        clearTimeout(raceFunction);
        resolve();
      },
    );
  });
};
