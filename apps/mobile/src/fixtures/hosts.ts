import type { ImageSource } from "expo-image";

export type SampleHost = {
  id: string;
  name: string;
  avatar: ImageSource | number;
  yearsHosting: number;
  superhost: boolean;
  bio: string;
  location: string;
  languages: string;
  response: string;
  interests: readonly string[];
  hostingApproach: string;
  occupation: string;
  background: string;
  credentials: readonly { title: string; description: string }[];
};

// Temporary UI profiles. All identities, badges and response claims are fictional.
// The same bundled illustrative portrait is reused; it does not identify these hosts.
const avatar = require("../../assets/images/demo/host.jpg");

export const sampleHosts = {
  maria: {
    occupation: "Guesthouse host and garden enthusiast",
    background: "Studied hospitality management and spent several years welcoming guests to family-run coastal stays before hosting the villa.",
    credentials: [
      { title: "Hospitality training", description: "Sample background in guest care, preparing rooms and planning comfortable arrivals." },
      { title: "Coastal hosting experience", description: "Four years of illustrative experience helping families plan relaxed stays in La Union." },
    ],
    id: "sample-host-maria", name: "Maria", avatar, yearsHosting: 4, superhost: true,
    location: "San Juan, La Union", languages: "English and Filipino",
    response: "Usually responds within an hour",
    bio: "I love slow mornings by the coast and sharing the little places that make La Union feel like home. Our villa is a space for families and friends to spend time together.",
    interests: ["Beach walks", "Local food", "Gardening"],
    hostingApproach: "Before arrival, I share a welcome guide with favourite cafés and practical tips. I give guests their space and am happy to help with questions about the stay.",
  },
  alex: {
    occupation: "Cabin host and freelance designer",
    background: "A design graduate who enjoys creating warm, practical interiors and sharing Tagaytay’s quieter outdoor spaces.",
    credentials: [
      { title: "Guest-service experience", description: "Sample experience preparing welcome guides and supporting independent cabin check-ins." },
      { title: "Cabin hosting", description: "Three years of illustrative experience looking after two Tagaytay retreats." },
    ],
    id: "sample-host-alex", name: "Alex", avatar, yearsHosting: 3, superhost: true,
    location: "Tagaytay, Cavite", languages: "English and Filipino",
    response: "Usually responds within an hour",
    bio: "Cool mornings, a warm cup of coffee and a good book are my idea of a weekend well spent. I enjoy creating cosy cabin stays in Tagaytay.",
    interests: ["Coffee", "Reading", "Nature walks"],
    hostingApproach: "I share clear arrival instructions and recommendations for nearby food stops, then leave you to enjoy the quiet. Ask me about easy walks around the area.",
  },
  sofia: {
    occupation: "Beach-house host and home cook",
    background: "Studied tourism and helped manage family holiday accommodation before welcoming groups to the beach house.",
    credentials: [
      { title: "Tourism background", description: "Sample training in visitor services and planning clear guest information." },
      { title: "Family-stay experience", description: "Five years of illustrative experience preparing a home for family gatherings." },
    ],
    id: "sample-host-sofia", name: "Sofia", avatar, yearsHosting: 5, superhost: true,
    location: "Laiya, Batangas", languages: "English and Filipino",
    response: "Usually responds within a few hours",
    bio: "Some of my favourite memories are family weekends in Batangas. I host a bright, welcoming beach house with room to cook, catch up and relax together.",
    interests: ["Cooking", "Swimming", "Family gatherings"],
    hostingApproach: "I send a house guide before your trip, including kitchen essentials and arrival tips. Let me know if you have questions while planning your family stay.",
  },
  elena: {
    occupation: "Local craft maker and woodland host",
    background: "An arts graduate with a background in community markets and a love of Baguio’s creative neighbourhoods.",
    credentials: [
      { title: "Local visitor support", description: "Sample experience sharing market guides and suggestions for exploring Baguio." },
      { title: "Guest welcome training", description: "Illustrative training in preparing a welcoming space and communicating arrival details." },
    ],
    id: "sample-host-elena", name: "Elena", avatar, yearsHosting: 2, superhost: true,
    location: "Baguio, Benguet", languages: "English, Filipino and Ilocano",
    response: "Usually responds within a few hours",
    bio: "I enjoy Baguio’s pine-scented air, creative markets and cosy cafés. My woodland hideaway is a place to pause and enjoy the cooler weather.",
    interests: ["Gardening", "Local crafts", "Hiking"],
    hostingApproach: "I prepare simple directions and suggestions for exploring the city at a gentle pace. I am happy to recommend markets and places for a warm breakfast.",
  },
  nico: {
    occupation: "Architectural designer and city host",
    background: "Studied architectural design and enjoys making small city spaces comfortable for short stays.",
    credentials: [
      { title: "Space-planning background", description: "Sample design experience arranging practical living spaces for city travellers." },
      { title: "Independent check-in support", description: "Illustrative experience writing arrival guides and helping guests settle into the neighbourhood." },
    ],
    id: "sample-host-nico", name: "Nico", avatar, yearsHosting: 3, superhost: true,
    location: "Makati, Metro Manila", languages: "English and Filipino",
    response: "Usually responds within an hour",
    bio: "I love exploring the neighbourhood on foot, from weekend markets to independent coffee shops. My sunlit loft is a comfortable base for a short city break.",
    interests: ["Architecture", "Coffee", "Weekend markets"],
    hostingApproach: "I share a straightforward check-in guide and a list of nearby essentials. You can settle in independently and ask for neighbourhood suggestions when you need them.",
  },
  luna: {
    occupation: "Garden-villa host and surf enthusiast",
    background: "A communications graduate who worked in guest services before settling into island hosting in General Luna.",
    credentials: [
      { title: "Guest-service background", description: "Sample experience answering travel questions and preparing helpful welcome information." },
      { title: "Island hosting experience", description: "Two years of illustrative experience welcoming visitors to the garden villa." },
    ],
    id: "sample-host-luna", name: "Luna", avatar, yearsHosting: 2, superhost: true,
    location: "General Luna, Siargao", languages: "English, Filipino and Cebuano",
    response: "Usually responds within a few hours",
    bio: "Island life has taught me to slow down and make time for the outdoors. I enjoy sharing a peaceful garden villa with travellers discovering Siargao.",
    interests: ["Surfing", "Gardening", "Island food"],
    hostingApproach: "I send arrival tips and a few favourite local spots before your stay. I respect your privacy and can help with questions about the house and neighbourhood.",
  },
  paolo: {
    occupation: "Outdoor photographer and treehouse host",
    background: "Studied visual communication and spends weekends photographing the hills and trails around Tanay.",
    credentials: [
      { title: "Outdoor guest orientation", description: "Sample experience explaining treehouse access, stairs and the rustic setting before arrival." },
      { title: "Local trail knowledge", description: "Illustrative familiarity with nearby walks; this is not a professional guiding qualification." },
    ],
    id: "sample-host-paolo", name: "Paolo", avatar, yearsHosting: 1, superhost: false,
    location: "Tanay, Rizal", languages: "English and Filipino",
    response: "Usually responds within a day",
    bio: "I spend my weekends outdoors and enjoy finding simple ways to reconnect with nature. Hosting our hillside treehouse lets me share a quieter corner of Tanay.",
    interests: ["Hiking", "Photography", "Birdwatching"],
    hostingApproach: "I share access details and practical advice for a rustic stay before arrival. Please ask about the stairs and outdoor setting when deciding whether the treehouse suits your trip.",
  },
  clara: {
    occupation: "Coffee grower and farm-stay host",
    background: "Learned coffee growing and brewing through family farm work and enjoys introducing guests to everyday countryside life.",
    credentials: [
      { title: "Coffee workshop experience", description: "Sample experience demonstrating small-batch brewing and sharing coffee-growing stories." },
      { title: "Farm guest orientation", description: "Illustrative experience preparing visitors for the outdoor setting and daily farm routines." },
    ],
    id: "sample-host-clara", name: "Clara", avatar, yearsHosting: 2, superhost: false,
    location: "Balamban, Cebu", languages: "English, Filipino and Cebuano",
    response: "Usually responds within a day",
    bio: "Coffee, fresh air and everyday farm life are close to my heart. I enjoy welcoming curious guests to our countryside stay and sharing how we brew our favourite cup.",
    interests: ["Coffee brewing", "Farming", "Cooking"],
    hostingApproach: "I share what to pack for a countryside visit and explain the sample workshop schedule in the welcome guide. Ask me about the space and what a typical farm morning looks like.",
  },
} satisfies Record<string, SampleHost>;

// Explicit assignments keep each listing's host consistent across the UI.
export const samplePropertyHosts: Readonly<Record<string, SampleHost>> = {
  "sample-la-union-villa": sampleHosts.maria,
  "sample-tagaytay-cabin": sampleHosts.alex,
  "sample-batangas-house": sampleHosts.sofia,
  "sample-lakeside-cabin": sampleHosts.alex,
  "sample-baguio-pine": sampleHosts.elena,
  "sample-makati-loft": sampleHosts.nico,
  "sample-siargao-villa": sampleHosts.luna,
  "sample-rizal-treehouse": sampleHosts.paolo,
  "sample-cebu-farm": sampleHosts.clara,
};
