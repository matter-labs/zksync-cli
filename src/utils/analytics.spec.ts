import { jest } from "@jest/globals";
import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import machine from "node-machine-id";

import { track } from "./analytics.js";

jest.mock("@rudderstack/rudder-sdk-node");
jest.mock("dotenv");
jest.mock("node-machine-id", () => ({
  machineId: jest.fn().mockResolvedValue("testMachineId"),
}));

describe("analytics", () => {
  let mockRudderTrack: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRudderTrack = jest.fn();
    (RudderAnalytics.default as jest.Mock).mockImplementation(() => {
      return {
        track: mockRudderTrack,
      };
    });

    (machine.machineId as jest.Mock).mockResolvedValue("testMachineId");
  });

  describe("track", () => {
    it("does not track if client is not initialized", async () => {
      (RudderAnalytics.default as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Client initialization error");
      });

      await track("TestEvent", { prop: "value" });

      expect(mockRudderTrack).not.toHaveBeenCalled();
    });

    it("tracks event with the correct parameters", async () => {
      await track("TestEvent", { prop: "value" });

      expect(mockRudderTrack).toHaveBeenCalledWith(
        {
          userId: "testMachineId",
          event: "TestEvent",
          properties: { prop: "value" },
        },
        expect.any(Function)
      );
    });

    it("resolves after event is tracked", async () => {
      // Use mockResolvedValueOnce to simulate the behavior of the callback being executed after tracking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockRudderTrack.mockImplementationOnce((_data, callback: any) => {
        callback();
      });

      await expect(track("TestEvent", { prop: "value" })).resolves.toBeUndefined();
    });

    it("resolves after 1 second even if event is not tracked yet", async () => {
      jest.useFakeTimers();

      const promise = track("TestEvent", { prop: "value" });

      jest.advanceTimersByTime(1000);

      await expect(promise).resolves.toBeUndefined();

      jest.useRealTimers();
    });

    it("does not track if NO_TRACKING environment variable is set", async () => {
      process.env.NO_TRACKING = "true";

      await track("TestEvent", { prop: "value" });

      expect(mockRudderTrack).not.toHaveBeenCalled();
    });
  });
});
