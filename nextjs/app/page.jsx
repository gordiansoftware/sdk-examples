'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [gordianReady, setGordianReady] = useState(false)
  const [seatmapLoaded, setSeatmapLoaded] = useState(false)
  const [displayType, setDisplayType] = useState("card")
  const [trip, setTrip] = useState()
  const [basket, setBasket] = useState()
  const [requestedFulfillment, setRequestedFulfillment] = useState(false)
  const [fulfillmentOrders, setFulfillmentOrders] = useState()

  // This function is called when the user adds products to their basket. Reflect their changes on your frontend with this callback.
  const onBasketChange = ({ basket }) => {
    console.log("Called onBasketChange")
    console.log(basket)
    setBasket(basket)
  }

  // This function is called when the user has completed selection and the products are ready for fulfillment. 
  // It calls a fulfillendpoint on the backend which then calls Gordian for fulfillment.
  const fulfill = async () => {
    // Call the fulfillment endpoint on the backend, which in turns calls Gordian's fulfillment endpoint.
    console.log("Requesting fulfillment")
    const { trip_id, passengers, tickets } = trip
    const firstPassenger = passengers[0]
    const firstTicket = tickets[0]
    const { passenger_id } = firstPassenger
    const { ticket_id } = firstTicket

    setRequestedFulfillment(true)
    const response = await fetch("http://localhost:8080/fulfill", {

      method: "POST",
      body: JSON.stringify({
        trip_id: trip_id,
        passenger_id,
        ticket_id
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const result = await response.json()
    if (result.status === "success") {
      console.log("Fulfillment request successful")
    }
  };

  // After calling fulfillment, you can poll the trip to see the status of the frontend. This is typically done on the backend as fulfillment can take time.
  // It's shown on the frontend here for reference. It's recommended that partners subscribe to callbacks to be notified of product status. 
  // https://docs.gordiansoftware.com/docs/receive-callbacks

  const pollTrip = async () => {
    console.log("Polling the trip")
    const { trip_id } = trip
    const response = await fetch(`http://localhost:8080/trip/${trip_id}`)
    const result = await response.json()
    const { orders } = result;
    console.log(orders)
    setFulfillmentOrders(orders)
  }

  // This is an example of listing products selected by the user on your frontend.
  const listBasketProducts = () => {
    const products = []
    for (const productId in basket) {
      const product = basket[productId]
      const { price, display_name } = product
      const formattedPrice = Gordian.formatPrice(
        price.total.amount,
        price.total.decimal_places,
        price.total.currency
      )
      products.push(<li key={productId}>{`${display_name} - ${formattedPrice}`}</li>)
    }
    return products
  }

  // This is an example of listing orders that have been sent for fulfillment.
  const listFulfillmentOrders = () => {
    const products = []
    for (const orderId in fulfillmentOrders) {
      const order = fulfillmentOrders[orderId]
      const { price, display_name, status } = order
      const formattedPrice = Gordian.formatPrice(
        price.total.amount,
        price.total.decimal_places,
        price.total.currency
      )
      products.push(<li key={orderId}>{`${display_name} - ${formattedPrice} - ${status}`}</li>)
    }
    return products
  }

  // Depending on your integration, you may be able to use Nextjs's getServerSideProps to initiate trip creation on the server-side.
  useEffect(() => {
    if (gordianReady) {
      const showUpsell = async () => {
        const tripResponse = await fetch("http://localhost:8080/trip", {
          method: "POST"
        });
        const tripJson = await tripResponse.json()
        const { trip_id, trip_access_token, search_id } = tripJson

        // Store the trip to use at fulfillment time.
        setTrip(tripJson)

        const searchIds = {
          seat: search_id
        }
        await Gordian.init({
          tripId: trip_id,
          tripAccessToken: trip_access_token,
          onBasketChange,
          searchIds,
          eventCallbacks: {
            onSeatLoad: () => {
              // Called when the seatmap is ready to open.
              setSeatmapLoaded(true)
              console.log('onSeatLoad executed');
            },
            onSeatModalClosed: () => {
              // Called when the seatmap modal is closed.
              console.log('onSeatModalClosed executed');
            },
            onBagLoad: () => {
              // Called when the baggage widget is ready to open.
              console.log('onBagLoad executed');
            },
            onBagModalClosed: () => {
              // Called when the baggage widget modal is closed.
              console.log('onBagModalClosed executed');
            },

            onSeatFail: () => {
              // Called when seats aren't available for the given trip.
              console.log('onSeatFail executed');
            },
            onBagFail: () => {
              // Called when bags aren't available for the given trip.
              console.log('onBagFail executed');
            },
            onInvalidBasket: () => {
              // Basket items can become invalid due to changes in availability or passenger information.
              // Notify the user and show the upsell widget again so users can make new selections.
              console.log('onInvalidBasket executed')
            }
          }
        })
        Gordian.showUpsell({
          container: document.getElementById("upsell-container-card"),
          display: displayType, // card | embedded | modal
          allowProducts: ["seats"]
        }).catch((error) => {
          console.error(`unable to show upsell: ${error.message}`);
        });
      }
      showUpsell()
    }
  }, [gordianReady, displayType])

  return (
    <>
      <Head>

      </Head>
      <main>
        <div>
          1. Select the display type. "Card" provides a simple prebuilt UI for opening and closing the seatmap and is recommended for testing.
        </div>
        <button disabled={displayType === "card"} onClick={() => setDisplayType("card")}>Card</button>
        <button disabled={displayType === "modal"} onClick={() => setDisplayType("modal")}>Modal</button>
        <button disabled={displayType === "embedded"} onClick={() => setDisplayType("embedded")}>Embedded</button>
        <div>
          2. Open the seatmap and select seats.
        </div>
        {/* This is set by the onSeatLoad callback*/}
        <div>
          {!seatmapLoaded && "loading seatmap..."}
        </div>


        {/* The Gordian Upsell widget will mount to this div */}
        <div id="upsell-container-card" />

        {/* This lists the items selected by the user */}
        <div>
          3. Items that the user selects will show up here. <br />
          Basket Items:
          <ul>
            {listBasketProducts()}
          </ul>
        </div>

        {/* Request fulfillment */}
        <div>
          4. Once items have been added to basket, you can request fulfillment: <br/>
          <button onClick={fulfill} disabled={!basket || requestedFulfillment}>Fulfill</button> <br/>
          {requestedFulfillment && <span style={{color: 'green'}}>Fulfillment requested</span>}
        </div>

        <div>
          5. Poll the trip to see the status of the fulfillment: <br/>
          <button onClick={pollTrip} disabled={!requestedFulfillment}>Poll Trip</button>
        </div>

        <div>
          6. Items that have been ordered and their status will show up here: <br/>
          Orders:
          <ul>
            {listFulfillmentOrders()}
          </ul>
        </div>

        {/* Use Nextjs's onReady callback to indicate when the Gordian SDK has loaded and is ready to use */}
        <Script src="https://sdk.gordiansoftware.com/javascript/v2.2/gordian.min.js"
          onReady={() => {
            setGordianReady(true)
          }}
        />
      </main>
    </>

  )
}
