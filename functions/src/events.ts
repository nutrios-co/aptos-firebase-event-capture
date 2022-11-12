import { db, NODE_URL } from "./config";
import { AptosClient, Types } from "aptos";

export const captureNewEvents = async (
  account: Types.Address,
  handle_struct: string,
  handle_field: string,
  limit: number = 25
): Promise<void> => {
  // this formula for eventStore ensures a globally unique store for each event collection
  const eventStore = account + "_" + handle_struct + "." + handle_field;
  const eventStoreCursorRef = db.collection("events/config/eventCaptureCursors").doc(eventStore);
  let index = 0;
  let start = 0;
  const doc = await eventStoreCursorRef.get();

  if (doc.exists) {
    const data = doc.data();
    start = data ? data.start : 0;
    index = start;
  }

  const client = new AptosClient(NODE_URL);

  let events = await client.getEventsByEventHandle(account, handle_struct, handle_field, {
    start,
    limit,
  });

  while (events.length > 0) {
    for (const event of events) {
      const docID = event.guid.account_address + event.guid.creation_number + event.sequence_number;

      const eventRef = db.collection("events/stores/" + eventStore).doc(docID);
      await eventRef.set(event.data);
      index = index + 1;
    }
    start = index;
    events = await client.getEventsByEventHandle(account, handle_struct, handle_field, {
      start,
      limit,
    });
  }
  //save our place in the index to start next time.
  await eventStoreCursorRef.set({ start: index });
};
