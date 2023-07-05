
var express = require("express");
var { Base64 } = require('js-base64');
var fetch = require("node-fetch");
var cors = require("cors")
require('dotenv').config()

var app = express();
app.use(express.json());
app.use(cors())

const url = "https://api.gordiansoftware.com/v2.2";

app.get("/trip/:trip_id", async function (req, res, next) {
    let response = await fetch(url + "/trip/" + req.params.trip_id, {
        headers: {
            Authorization: "Basic " + Base64.encode(process.env.API_KEY + ":"),
            "Content-Type": "application/json"
        },
    })
    let json = await response.json();
    res.send(json);
})

/* New trip */
app.post("/trip", async function (req, res, next) {
    const body = JSON.stringify({
        country: "US",
        currency: "USD",
        language: "en-US",
        passengers: [
            {
                first_names: "Van Gogh",
                surname: "William",
                passenger_type: "adult",
                date_of_birth: "2000-01-01"
            },
            {
                passenger_type: "adult",
                date_of_birth: "2001-01-01",
                first_names: "Ali",
                surname: "Reza"
            }
        ],
        search: {
            seat: {
                search: true
            }
        },
        tickets: [
            {
                journeys: [
                    {
                        segments: [{
                            arrival_airport: 'ATL',
                            arrival_time: '2025-03-21T06:58:00-05:00',
                            departure_airport: 'LAX',
                            departure_time: '2025-03-20T23:50:00-08:00',
                            fare_basis: 'WA7NR',
                            fare_class: 'W',
                            fare_family: 'book_it',
                            marketing_airline: 'CQ',
                            marketing_flight_number: '1200',
                            operating_airline: 'CQ',
                            operating_flight_number: '1200',
                        }]
                    },
                    {
                        segments: [{
                            arrival_airport: 'LAX',
                            arrival_time: '2025-03-24T06:58:00-05:00',
                            departure_airport: 'ATL',
                            departure_time: '2025-03-24T23:50:00-08:00',
                            fare_basis: 'WA7NR',
                            fare_class: 'W',
                            fare_family: 'book_it',
                            marketing_airline: 'CQ',
                            marketing_flight_number: '800',
                            operating_airline: 'CQ',
                            operating_flight_number: '800',
                        }]
                    }
                ],
                metadata: {
                    "your-id": "your-key"
                },
                offered_price: {
                    base_price: 7000,
                    currency: "USD",
                    decimal_places: 2,
                    markup: 0,
                    total: 7000
                },
                status: "offered"
            }
        ]
    });
    let response = await fetch(url + "/trip", {
        method: "POST",
        headers: {
            Authorization: "Basic " + Base64.encode(process.env.API_KEY + ":"),
            "Content-Type": "application/json"
        },
        body
    });
    let json = await response.json();

    res.send(json);
});

/* Fulfill */
app.post("/fulfill", async function (req, res, next) {
    var fulfillUrl = url + "/trip/" + req.body.trip_id + "/fulfill";
    let response = await fetch(fulfillUrl, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Base64.encode(process.env.API_KEY + ":"),
            "Content-Type": "application/json"
        },
        // Using mock data here for this demo.
        body: JSON.stringify({
            "contact_details": {
                "contact_details_type": "passenger",
                "passenger_id": req.body.passenger_id,
                "email": "joe@bloggs.com",
                "phone_number": "1234567890",
                "address": {
                    "city": "Seattle",
                    "state": "WA",
                    "country": "US",
                    "postal_code": "98105",
                    "street_address_1": "123 Street St.",
                }
            },
            tickets: [
                {
                    ticket_id: req.body.ticket_id,
                    access_details: {
                        record_locator: '123456'
                    },
                    status: 'booked'
                }
            ],
            "payment_details": {
                "payment_type": "card",
                "card_number": 9231836912116018,
                "cvv": 123,
                "expiry_month": "05",
                "expiry_year": "2040",
                "card_holder_name": "Gordian Software",
                "network": "visa",
                "billing_address": {
                    "city": "Seattle",
                    "state": "WA",
                    "country": "US",
                    "postal_code": "98105",
                    "street_address_1": "123 Street St.",
                }
            }
        })
    });
    let json = await response.json();
    res.send(json);
});

var listener = app.listen(8080, function () {
    console.log("Listening on port " + listener.address().port);
});
