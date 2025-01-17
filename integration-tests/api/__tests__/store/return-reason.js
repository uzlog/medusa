const path = require("path");

const { ReturnReason } = require("@medusajs/medusa");

const setupServer = require("../../../helpers/setup-server");
const { useApi } = require("../../../helpers/use-api");
const { initDb, useDb } = require("../../../helpers/use-db");

jest.setTimeout(30000);

describe("/store/return-reasons", () => {
  let medusaProcess;
  let dbConnection;

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", ".."));
    dbConnection = await initDb({ cwd });
    medusaProcess = await setupServer({ cwd });
  });

  afterAll(async () => {
    const db = useDb();
    await db.shutdown();
    medusaProcess.kill();
  });

  describe("GET /store/return-reasons", () => {
    let rrId;

    beforeEach(async () => {
      try {
        const created = dbConnection.manager.create(ReturnReason, {
          value: "too_big",
          label: "Too Big",
        });

        const result = await dbConnection.manager.save(created);
        rrId = result.id;
      } catch (err) {
        console.log(err);
        throw err;
      }
    });

    afterEach(async () => {
      const db = useDb();
      await db.teardown();
    });

    it("list return reasons", async () => {
      const api = useApi();

      const response = await api.get("/store/return-reasons").catch((err) => {
        console.log(err);
      });

      expect(response.status).toEqual(200);

      expect(response.data.return_reasons).toEqual([
        expect.objectContaining({
          id: rrId,
          value: "too_big",
        }),
      ]);
    });
  });
});
