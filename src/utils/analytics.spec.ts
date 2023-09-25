import RudderAnalytics from "@rudderstack/rudder-sdk-node";
import { machineId } from "node-machine-id";

import { track } from "./analytics.js";

jest.mock("@rudderstack/rudder-sdk-node");
jest.mock("dotenv");
jest.mock("node-machine-id");

describe("analytics", () => {
  let mockRudderTrack: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRudderTrack = jest.fn();
    (RudderAnalytics as jest.Mock).mockImplementation(() => {
      return {
        track: mockRudderTrack,
      };
    });

    (machineId as jest.Mock).mockResolvedValue("testMachineId");
  });

  describe("track", () => {
    it("does not track if client is not initialized", async () => {
      (RudderAnalytics as jest.Mock).mockImplementationOnce(() => {
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
      mockRudderTrack.mockImplementationOnce((_data, callback) => {
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
