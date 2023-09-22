import { compose, composeStatus } from "./docker";
import { mockExecute } from "../test-utils/mocks";

describe("docker", () => {
  let runCommandMock: ReturnType<typeof mockExecute>;

  beforeEach(() => {
    runCommandMock = mockExecute();
  });

  afterEach(() => {
    runCommandMock.mockRestore();
  });

  describe("checkDockerInstallation", () => {
    it("throws an error if Docker is not installed", async () => {
      runCommandMock.mockRejectedValue(new Error("Command exited with code 127: docker: command not found"));

      await expect(composeStatus("some_path/docker-compose.yml")).rejects.toThrow(
        "Docker is not installed. Download: https://www.docker.com/get-started/"
      );
    });
  });

  describe("compose", () => {
    const dockerComposePath = "some_path/docker-compose.yml";

    it("executes 'create' command correctly", async () => {
      await compose.create(dockerComposePath);

      expect(runCommandMock).toHaveBeenCalledWith(
        `docker compose -f ${dockerComposePath} --project-directory some_path create`
      );
    });

    it("executes 'up' command correctly", async () => {
      await compose.up(dockerComposePath);

      expect(runCommandMock).toHaveBeenCalledWith(
        `docker compose -f ${dockerComposePath} --project-directory some_path up -d`
      );
    });

    it("executes 'stop' command correctly", async () => {
      await compose.stop(dockerComposePath);

      expect(runCommandMock).toHaveBeenCalledWith(
        `docker compose -f ${dockerComposePath} --project-directory some_path stop`
      );
    });

    it("executes 'down' command correctly", async () => {
      await compose.down(dockerComposePath);

      expect(runCommandMock).toHaveBeenCalledWith(
        `docker compose -f ${dockerComposePath} --project-directory some_path down`
      );
    });
  });

  describe("composeStatus", () => {
    const dockerComposePath = "some_path/docker-compose.yml";

    it("returns empty array if statusJson is empty", async () => {
      runCommandMock.mockResolvedValue("");

      const status = await composeStatus(dockerComposePath);

      expect(status).toEqual([]);
    });

    it("parses the container status correctly", async () => {
      runCommandMock.mockResolvedValue(
        // eslint-disable-next-line quotes
        '{"Name": "container1", "State": "running"}\n{"Name": "container2", "State": "stopped"}'
      );

      const status = await composeStatus(dockerComposePath);

      expect(status).toEqual([
        { name: "container1", isRunning: true },
        { name: "container2", isRunning: false },
      ]);
    });

    it("returns an empty array if JSON parsing fails", async () => {
      runCommandMock.mockResolvedValue("invalid_json");

      const status = await composeStatus(dockerComposePath);

      expect(status).toEqual([]);
    });
  });
});
