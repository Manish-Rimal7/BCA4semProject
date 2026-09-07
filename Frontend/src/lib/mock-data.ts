export type Condition = "New" | "Like new" | "Good" | "Well loved";

export type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: Condition;
  location: string;
  postedAt: string;
  image: string;
  status: "available" | "reserved" | "given";
  donor: { id: string; name: string; rating: number; ratingCount: number };
  requestCount: number;
};

export type RequestRecord = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  counterpart: string;
  message: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined" | "completed";
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export const categories = [
  "All",
  "Cloths",
  "Books",
  "Electronics",
  "Furniture",
];

export const items: Item[] = [
  {
    id: "1",
    title: "Oak reading chair",
    description:
      "A sturdy oak-framed armchair with a linen cushion. Lived in our study for six years and is still perfectly comfortable — we're moving and it won't fit. Pick up any evening.",
    category: "Furniture",
    condition: "Good",
    location: "Riverside, 2.1 km away",
    postedAt: "2 days ago",
    image: img("oakchair"),
    status: "available",
    donor: { id: "u2", name: "Marta Feld", rating: 4.8, ratingCount: 26 },
    requestCount: 4,
  },
  {
    id: "2",
    title: "Box of paperback novels (32)",
    description:
      "Mixed fiction — crime, literary, a few classics. All readable, some spine wear. Happy to split the box between a couple of people.",
    category: "Books",
    condition: "Well loved",
    location: "Old Town, 0.8 km away",
    postedAt: "5 hours ago",
    image: img("books32"),
    status: "available",
    donor: { id: "u3", name: "Ivan Petrov", rating: 4.9, ratingCount: 41 },
    requestCount: 9,
  },
  {
    id: "3",
    title: "Cast iron skillet, 26cm",
    description: "Seasoned and ready to cook on. Bought a bigger one, this deserves a kitchen.",
    category: "Kitchen",
    condition: "Like new",
    location: "Northgate, 4.6 km away",
    postedAt: "1 day ago",
    image: img("skillet"),
    status: "available",
    donor: { id: "u4", name: "Priya Raman", rating: 5, ratingCount: 12 },
    requestCount: 6,
  },
  {
    id: "4",
    title: "Toddler winter coat, 2-3y",
    description: "Warm padded coat, navy, one small mark on the sleeve. Washed and ready.",
    category: "Kids",
    condition: "Good",
    location: "Riverside, 1.4 km away",
    postedAt: "3 days ago",
    image: img("coat23"),
    status: "reserved",
    donor: { id: "u5", name: "Sam Okoye", rating: 4.6, ratingCount: 8 },
    requestCount: 3,
  },
  {
    id: "5",
    title: "Desk lamp with warm bulb",
    description: "Adjustable arm, works fine, bulb included. Slight scuff on the base.",
    category: "Electronics",
    condition: "Good",
    location: "Old Town, 1.1 km away",
    postedAt: "6 days ago",
    image: img("desklamp"),
    status: "available",
    donor: { id: "u6", name: "Lena Voss", rating: 4.7, ratingCount: 19 },
    requestCount: 2,
  },
  {
    id: "6",
    title: "Terracotta pots, set of 7",
    description: "Various sizes, two have hairline cracks but hold soil fine. Great for herbs.",
    category: "Garden",
    condition: "Well loved",
    location: "Hillfield, 5.9 km away",
    postedAt: "1 week ago",
    image: img("pots7"),
    status: "available",
    donor: { id: "u7", name: "Tomas Lind", rating: 4.4, ratingCount: 15 },
    requestCount: 1,
  },
  {
    id: "7",
    title: "Wool jumpers, women's M (3)",
    description: "Two grey, one green. No holes, gently pilled. Free to a warm home.",
    category: "Clothing",
    condition: "Good",
    location: "Northgate, 3.2 km away",
    postedAt: "4 days ago",
    image: img("jumpers"),
    status: "available",
    donor: { id: "u8", name: "Aisha Karim", rating: 4.9, ratingCount: 33 },
    requestCount: 7,
  },
  {
    id: "8",
    title: "Pine bookshelf, 5 shelves",
    description: "Solid, disassembles flat. You'll need a car or a very patient friend.",
    category: "Furniture",
    condition: "Good",
    location: "Hillfield, 6.4 km away",
    postedAt: "2 weeks ago",
    image: img("bookshelf"),
    status: "given",
    donor: { id: "u9", name: "Georgi Milev", rating: 4.5, ratingCount: 21 },
    requestCount: 11,
  },
];

export const myRequests: RequestRecord[] = [
  {
    id: "r1",
    itemId: "2",
    itemTitle: "Box of paperback novels (32)",
    itemImage: img("books32"),
    counterpart: "Ivan Petrov",
    message: "I run a small reading corner at the community centre — these would be perfect.",
    createdAt: "3 hours ago",
    status: "pending",
  },
  {
    id: "r2",
    itemId: "3",
    itemTitle: "Cast iron skillet, 26cm",
    itemImage: img("skillet"),
    counterpart: "Priya Raman",
    message: "Just moved into a first flat with an empty kitchen. Can collect this weekend.",
    createdAt: "Yesterday",
    status: "accepted",
  },
  {
    id: "r3",
    itemId: "6",
    itemTitle: "Terracotta pots, set of 7",
    itemImage: img("pots7"),
    counterpart: "Tomas Lind",
    message: "Starting a balcony herb garden.",
    createdAt: "Last week",
    status: "completed",
  },
];

export const requestsOnMyItems: RequestRecord[] = [
  {
    id: "i1",
    itemId: "1",
    itemTitle: "Oak reading chair",
    itemImage: img("oakchair"),
    counterpart: "Nadia Brandt",
    message: "Would love this for my mum's flat, she reads every evening. I have a van.",
    createdAt: "1 hour ago",
    status: "pending",
  },
  {
    id: "i2",
    itemId: "1",
    itemTitle: "Oak reading chair",
    itemImage: img("oakchair"),
    counterpart: "Felix Auer",
    message: "Happy to pick up tonight if it's still going.",
    createdAt: "5 hours ago",
    status: "pending",
  },
  {
    id: "i3",
    itemId: "5",
    itemTitle: "Desk lamp with warm bulb",
    itemImage: img("desklamp"),
    counterpart: "Ruth Adeyemi",
    message: "For my daughter's homework desk.",
    createdAt: "2 days ago",
    status: "accepted",
  },
];

export const myDonations = [
  { ...items[0], requestCount: 4 },
  { ...items[4], requestCount: 2 },
  { ...items[7], requestCount: 11 },
];
