# aptos-firebase-event-capture
Some demo code to show how to capture any Aptos event handle, write each event to a Firestore collection, then trigger a cloud function with each event written to the collection.

Aptos events are low cost/gas methods of letting the off chain world know whats going on in your module. Once the events are emitted, we've got to have a way to read and then act on those events. The Aptos Indexer can grab this data, but we find this code more approachable and definitely more surgical/precise. Plus, we can rely on Google Cloud's infrastructure horsepower processing these events rather than trying to run a singular Indexer on a server somewhere.

The root of the capability is in events.ts with this function:
```
export const captureNewEvents = async (
  account: Types.Address,
  handle_struct: string,
  handle_field: string,
  limit: number = 25
): Promise<void>
```
We're simply passing parameters that describe the event handle we want to capture: 1) The account address that holds the event handle we're interested in. 2) The struct at that address that holds the event handle (represented in the typical string format `address::module::struct`. 3) The field name on that struct that holds the event handle. The fourth parameter, `limit`, just sets how many events we pull down at a time from the Aptos SDK. To be honest - we don't know yet if there is a performance benefit to taking bigger bites or not, but we've left the capability in there.

From there, we use a naming convention for our event collections of `[account]_[handle_struct].[handle_field]` which ensures a globally unique name. In Firestore, we're using a collection structure of:
```
\events
    \config
        \eventCaptureCursors
           \[account]_[handle_struct].[handle_field]
              -start
    \stores
        \[account]_[handle_struct].[handle_field]
           \event
              -event data
           \event
              -event data
           \event
              -event data
        \[account]_[handle_struct].[handle_field]
        \[account]_[handle_struct].[handle_field]
```
`config` is a document with one sub-collection, `eventCaptureCursors`.  For every event handle we capture, we store the index of the last event captured in a document using the same naming convention. This lets us know where to set the offset the next time we collect events for the handle. 

Within `stores`, we have a sub collection for each event handle captured, and then a document in that sub collection for each event captured. For the Firestore document ID for each event, we use a naming convention of event guid account address + creation number + sequence_number for the event - again ensuring a globally unique identifier. The rest of the capture process is pretty self explanatory.

We call this function from a PubSub scheduled function that we run every 5 minutes.  That's really a business logic decision where you need to balance the latency between event emission and capture vs the number of times you're calling this function. If you're calling every minute, that's 3,600 calls a day or 1.3 million calls per year. That's going to run you all of $0.51 in Google Cloud fees - so you're probably ok running it often!

The other Firebase function is the Firestore onCreate event:

. We've set this up with wild cards. Whenever a new event is written to Firestore, this function is called.  The value of 
