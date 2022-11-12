import { captureNewEvents } from "../src/events";

describe("Capture Events", () => {
  // we set a long timeout while debugging to allow stepping through the code
  jest.setTimeout(500000);
  describe("like capture", () => {
    test("update global likes", async () => {
      const likeAccount = "0xfc0392dafc9b71146c9c3227786a87f6193ba8e013804efb7cb2320865923ba9";
      const likeStruct = "0xfc0392dafc9b71146c9c3227786a87f6193ba8e013804efb7cb2320865923ba9::bar::Cookbook";
      const likeField = "like_events";
      await captureNewEvents(likeAccount, likeStruct, likeField, 50);
    });
  });
});
