import { pubsub } from "firebase-functions/v1";
import { document } from "firebase-functions/v1/firestore";
import { captureNewEvents } from "./events";

const likeAccount = "0xfc0392dafc9b71146c9c3227786a87f6193ba8e013804efb7cb2320865923ba9";
const likeStruct = "0xfc0392dafc9b71146c9c3227786a87f6193ba8e013804efb7cb2320865923ba9::bar::Cookbook";
const likeField = "like_events";

exports.captureLikeEvents = pubsub.schedule("every 5 minutes").onRun(async (context) => {
  await captureNewEvents(likeAccount, likeStruct, likeField, 50);
  // can add more events here or create separate pubsub functions
  return null;
});

exports.processEvents = document("events/stores/{eventHandle}/{documentId}").onCreate((event) => {
  // this function will fire every time an event is written to any of the handles we capture.
  // we get the eventHandle (in the form of account+struct+field) so we can progamatically decide
  // what to do with different events types
  //
  // the data from the event itself is in a JSON object in `event.data()`
  console.log(event.data());
});
