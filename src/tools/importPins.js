
// 3. Paste your old pins here
const oldPins = [
  {
    name: "Deano's Bar & Restaurant",
    address: "Edge St, Manchester M4 1HN, UK",
    note: "Imagine a place where the pizzas are shareable, the cheese is pullable and the drinks are… drinkable? 📍Deanos, Edge St, Manchester",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNdoutbEj/",
    placeId: null,
    geo: { lat: 53.4844028, lng: -2.2365685 },
    addedBy: "Sam",
    createdAt: 1763507667677
  },

  {
    name: "Vino Cicchetti",
    address: "626 Manchester Rd, Bury BL9 9SU, UK",
    note: "Your choice of pasta inside our special garlic butter pizza bowl!",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNdoW4UV4/",
    placeId: null,
    geo: { lat: 53.5686781, lng: -2.2938081 },
    addedBy: "Sam",
    createdAt: 1763585708314
  },

  {
    name: "Maricarmen",
    address: "67 Great Ancoats St, Ancoats, Manchester M4 5AB, UK",
    note: "Tapas",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNdo7xMXL/",
    placeId: null,
    geo: { lat: 53.4832849, lng: -2.2296073 },
    addedBy: "Sam",
    createdAt: 1763590772289
  },

  {
    name: "American Pies Mcr",
    address: "23 Blossom St, Ancoats, Manchester M4 5EP, UK",
    note: "THE NEW SUNDAY ROAST CRAMMED INTO A HUGE YORKSHIRE PUDDING...",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNR1LS8dS/",
    placeId: null,
    geo: { lat: 53.4843664, lng: -2.2297459 },
    addedBy: "Sam",
    createdAt: 1763667905795
  },

  {
    name: "BREWSKI’S BIG TRAY BBQ",
    address: "Unit 35, the quays, quayside, media city, Salford M50 3AG, UK",
    note: "Manchester NEWEST BBQ 🍖",
    rating: 0,
    tags: ["restaurant"],
    url: "https://www.instagram.com/reel/DRW11MWCIyi/?igsh=MW8yNmw2bzR1Nnkxbw==",
    placeId: null,
    geo: { lat: 53.470185, lng: -2.2934872 },
    addedBy: "Sam",
    createdAt: 1763833011946
  },

  {
    name: "Dishoom Manchester",
    address: "32 Bridge St, Manchester M3 3BT, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "https://www.instagram.com/dishoom?igsh=YjViZTI4am0zdGk5",
    placeId: null,
    geo: { lat: 53.48105469999999, lng: -2.2502234 },
    addedBy: "Sam",
    createdAt: 1763989835409
  },

  {
    name: "Sweet Diner",
    address: "48 Hyde Rd, Denton, Manchester M34 3AQ, UK",
    note: "The Willy Wonker of Burgeds & Dessert🍬",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRJ4CyvE/",
    placeId: null,
    geo: { lat: 53.4562233, lng: -2.1104339 },
    addedBy: "Sam",
    createdAt: 1764085217255
  },

  {
    name: "La Fiesta Leeds",
    address: "Unit 4b, Merrion Centre, 7 Merrion Way, Leeds LS2 8BT, UK",
    note: "All you can eat Spanish tapas",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNReJx9ux/",
    placeId: null,
    geo: { lat: 53.8023175, lng: -1.5433495 },
    addedBy: "Sam",
    createdAt: 1764175874171
  },

  {
    name: "Bunny Jacksons",
    address: "1 Jack Rosenthal St, Manchester M15 4RA, UK",
    note: "Wings",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 53.473622, lng: -2.2458204 },
    addedBy: "Sam",
    createdAt: 1764176176050
  },

  {
    name: "Shukette",
    address: "312 W 25th St, New York, NY 10001, USA",
    note: "Al's recommendation!",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 40.74715459999999, lng: -74.0005218 },
    addedBy: "Sam",
    createdAt: 1764265371702
  },

  {
    name: "Six by Nico Leeds",
    address: "9 E Parade, Leeds LS1 2AJ, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "https://share.google/U85rVQZ2ph9iXdAON",
    placeId: null,
    geo: { lat: 53.7985732, lng: -1.5495524 },
    addedBy: "Sam",
    createdAt: 1763133851163
  },

  {
    name: "Salvi’s Mozzarella Bar",
    address: "1, The Corn Exchange, Corporation St, Manchester M4 3TR, UK",
    note: "Giant meatball subs",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRdPeLBs/",
    placeId: null,
    geo: { lat: 53.484773, lng: -2.2430098 },
    addedBy: "Sam",
    createdAt: 1764512698276
  },

  {
    name: "Landrace “La Pizza”",
    address: "GROUND FLOOR, 59 Walcot St, Bath BA1 5BN, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 51.3858218, lng: -2.3599323 },
    addedBy: "Sam",
    createdAt: 1764596618797
  },

  {
    name: "Kalpakavadi Restaurant",
    address: "26 Fossgate, York YO1 9TA, UK",
    note: "kozhi recommendation!",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 53.95820800000001, lng: -1.0783768 },
    addedBy: "Sam",
    createdAt: 1764678857391
  },

  {
    name: "The Ivy Asia Leeds",
    address: "Victoria Quarter Queen, Victoria St, Leeds LS1 6BE, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 53.7977881, lng: -1.5404771 },
    addedBy: "Sam",
    createdAt: 1764686448845
  },

  {
    name: "Different Gravy",
    address: "Mad Giant Food Hall, Unit 6, Preston, Animate PR1 2BL, UK",
    note: "A gravy restaurant 💦",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRRQ8PMS/",
    placeId: null,
    geo: { lat: 53.7611133, lng: -2.6998156 },
    addedBy: "Sam",
    createdAt: 1764773940957
  },

  {
    name: "My Nawaab",
    address: "1008 Stockport Rd, Manchester M19 3WN, UK",
    note: "All you can eat Indian buffet",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRRvjeN7/",
    placeId: null,
    geo: { lat: 53.4418939, lng: -2.1900052 },
    addedBy: "Sam",
    createdAt: 1764846837142
  },

  {
    name: "The Sensational Sandwich Shop",
    address: "Unit 6 & 7, 30 Stamford St, London SE1 9LQ, UK",
    note: "Launch day!",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNR86FqxG/",
    placeId: null,
    geo: { lat: 51.5073611, lng: -0.1067129 },
    addedBy: "Sam",
    createdAt: 1764931290109
  },

  {
    name: "Kaasbar Amsterdam",
    address: "Ferdinand Bolstraat 10, 1072 LJ Amsterdam, Netherlands",
    note: "Cheese conveyor belt bar",
    rating: 0,
    tags: ["restaurant"],
    url: "https://www.instagram.com/reel/DNkVJtVNASb/?igsh=Y3k5ZmlvY2lwZXU2",
    placeId: null,
    geo: { lat: 52.35728599999999, lng: 4.8905666 },
    addedBy: "Sam",
    createdAt: 1764940992609
  },

  {
    name: "MEXICALI TEX-MEX SMOKEHOUSE",
    address: "Holmfirth HD9 3AY, UK",
    note: "Birria tacos",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNR8V2eyA/",
    placeId: null,
    geo: { lat: 53.5711654, lng: -1.7863495 },
    addedBy: "Sam",
    createdAt: 1765027262034
  },

  {
    name: "Dough2go",
    address: "38 Booth St, Manchester M2 4AA, UK",
    note: "New Haven style pizza",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRLyoKc7/",
    placeId: null,
    geo: { lat: 53.47934540000001, lng: -2.2421862 },
    addedBy: "Sam",
    createdAt: 1765228659607
  },

  {
    name: "Wen's Restaurant",
    address: "72-74 North St, Leeds LS2 7PN, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 53.80167429999999, lng: -1.5379626 },
    addedBy: "Sam",
    createdAt: 1763164012463
  },

  {
    name: "Ugly Dumpling",
    address: "1 Newburgh St, Carnaby, London W1F 7RB, UK",
    note: "Best gluten free dumplings",
    rating: 0,
    tags: ["restaurant"],
    url: "https://vm.tiktok.com/ZNRLpdLrv/",
    placeId: null,
    geo: { lat: 51.5133636, lng: -0.1383818 },
    addedBy: "Sam",
    createdAt: 1765301217205
  },

  {
    name: "Salt Pig",
    address: "39 Fossgate, York YO1 9TA, UK",
    note: "Focaccia sandos",
    rating: 0,
    tags: ["restaurant"],
    url: "https://www.instagram.com/reel/DSCrtiJiAWh/?igsh=NzZ0eDdxeDk5MWph",
    placeId: null,
    geo: { lat: 53.9581002, lng: -1.0786567 },
    addedBy: "Sam",
    createdAt: 1765301450708
  },

  {
    name: "Quo Vadis",
    address: "8 Royalty Mews, London W1D 3AT, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 51.5141128, lng: -0.1326476 },
    addedBy: "Sam",
    createdAt: 1765308215283
  },

  {
    name: "Josephine Bistro Marylebone",
    address: "6-8 Blandford St, London W1U 4AU, UK",
    note: "",
    rating: 0,
    tags: ["restaurant"],
    url: "",
    placeId: null,
    geo: { lat: 51.51845040000001, lng: -0.1519947 },
    addedBy: "Sam",
    createdAt: 1765308260136
  },

  {
    name: "Medieval Tavern “U Pavouka”",
    address: "17, Celetná 595, Staré Město, 110 00 Praha-Praha 1, Czechia",
    note: "Prague dinner show",
    rating: 0,
    tags: ["restaurant", "activity"],
    url: "https://www.instagram.com/reel/DLeY5nXsNSW/?igsh=Nnc2NzR6MHR4NTk4",
    placeId: null,
    geo: { lat: 50.0872288, lng: 14.4246098 },
    addedBy: "Sam",
    createdAt: 1765309685331
  },

  {
    name: "Sarastro",
    address: "Sarastro Restaurant, 126 Drury Ln, London WC2B 5SU, UK",
    note: "Theatreland restaurant",
    rating: 0,
    tags: ["restaurant"],
    url: "https://www.instagram.com/reel/DQohbDdDQLI/?igsh=cm1jdzB3ejZzNGZn",
    placeId: null,
    geo: { lat: 51.5137734, lng: -0.1198054 },
    addedBy: "Sam",
    createdAt: 1765486562107
  },

  {
    name: "Pranzo Italian York",
    address: "15-17 Church St, York YO1 8BE, UK",
    note: "Festive Italian menu",
    rating: 0,
    tags: ["restaurant", "italian"],
    url: "https://vm.tiktok.com/ZNR2SD1AM/",
    placeId: null,
    geo: { lat: 53.9600404, lng: -1.0809105 },
    addedBy: "Sam",
    createdAt: 1766258029820
  },

  {
    name: "Onda Pasta Bar",
    address: "Circle Square, Manchester M1 7FS, UK",
    note: "",
    rating: 0,
    tags: ["restaurant", "italian"],
    url: "",
    placeId: null,
    geo: { lat: 53.47315829999999, lng: -2.2392851 },
    addedBy: "Sam",
    createdAt: 1766408860750
  },
  {
  name: "Whitelock's Ale House",
  address: "Turk's Head Yard, Leeds LS1 6HB, UK",
  note: "Arguably best sticky toffee pudding in leeds",
  rating: 0,
  tags: ["bar", "restaurant"],
  url: "",
  placeId: null,
  geo: { lat: 53.7972541, lng: -1.5429886 },
  addedBy: "Sam",
  createdAt: 1763230343881
},
{
  name: "The Highland Laddie",
  address: "38 Cavendish St, Leeds LS3 1LY, UK",
  note: "Best pub in England!",
  rating: 0,
  tags: ["restaurant", "bar"],
  url: "",
  placeId: null,
  geo: { lat: 53.79996689999999, lng: -1.5618154 },
  addedBy: "Sam",
  createdAt: 1763230586712
},
{
  name: "Stuzzi",
  address: "7 Merrion St, Leeds LS1 6PQ, UK",
  note: "Fantastic arancini!!",
  rating: 0,
  tags: ["restaurant"],
  url: "",
  placeId: null,
  geo: { lat: 53.8003552, lng: -1.5397887 },
  addedBy: "Sam",
  createdAt: 1763236580192
},
{
  name: "Stuzzi",
  address: "7 Merrion St, Leeds LS1 6PQ, UK",
  note: "Fantastic arancini!!",
  rating: 0,
  tags: ["restaurant"],
  url: "",
  placeId: null,
  geo: { lat: 53.8003552, lng: -1.5397887 },
  addedBy: "Sam",
  createdAt: 1763236581409
}

]; // I will fill this for you
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

// 1. Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYj5v8v8j6o3eYwZoTJoX0b-8ixu49Zx8",
  authDomain: "mappin-14d4d.firebaseapp.com",
  projectId: "mappin-14d4d",
  storageBucket: "mappin-14d4d.firebasestorage.app",
  messagingSenderId: "638312610226",
  appId: "1:638312610226:web:e97242247a34f273b24cab",
  measurementId: "G-XCCYR413C9"
};

// 2. Init (v9 modular)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Helper: convert your old timestamp format
function convertTimestamp(msOrString) {
  if (!msOrString) return serverTimestamp();
  return new Date(msOrString);
}

// 5. Tag normalisation
function normaliseTags(oldTags) {
  if (!oldTags || !Array.isArray(oldTags)) return [];

  const map = {
    "Restaurant": "restaurant",
    "Pizza": "restaurant",
    "Italian": "restaurant",
    "Mexican": "restaurant",
    "South Indian": "restaurant",
    "All You Can Eat": "restaurant",

    "Bar": "bar",
    "Cafe": "cafe",
    "Sandwich": "cafe",

    "Activity": "activity"
  };

  return oldTags.map(t => map[t] || null).filter(Boolean);
}

// 6. Import workflow
async function importPins() {
  for (const pin of oldPins) {
    const newId = crypto.randomUUID();

    await setDoc(
      doc(
        collection(
          doc(collection(db, "maps"), "5XnxTgQkgYriLOHjZVzv"),
          "pins"
        ),
        newId
      ),
      {
        name: pin.name || "",
        address: pin.address || "",
        note: pin.note || "",
        rating: pin.rating || 0,
        tags: normaliseTags(pin.tags),
        url: pin.url || "",
        placeId: pin.placeId || null,

        geo: {
          lat: pin.geo.lat,
          lng: pin.geo.lng
        },

        pos: pin.pos || {
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 55
        },

        addedBy: pin.addedBy || "unknown",
        createdAt: convertTimestamp(pin.createdAt || pin.dateAdded)
      }
    );

    console.log("Imported:", pin.name);
  }

  console.log("Done!");
}

importPins();
