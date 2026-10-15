// All data below is SAMPLE/DEMO data for the MVP. Nothing here is live or verified.
export type Category = "Hackathon" | "Workshop" | "Conference" | "Competition" | "Fest";

export interface College {
  id: string;
  name: string;
  short: string;
  lat: number;
  lng: number;
  metro: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  sample?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  category: Category;
  collegeId: string;
  organizer: string;
  start: string; // ISO
  end: string;
  deadline: string;
  fee: number;
  eligibility: string;
  tags: string[];
  description: string;
  quality: number; // 1-5 organizer-reported program quality (sample)
  reviews: Review[];
  prize?: string;
  sourceUrl?: string;
}

export interface Society {
  id: string;
  name: string;
  collegeId: string;
  focus: string[];
  members: number;
  about: string;
}

export interface CollabRequest {
  id: string;
  societyId: string;
  type: "Hackathon" | "Sponsorship" | "Design" | "Marketing" | "Technical";
  title: string;
  details: string;
  createdAt: string;
  mine?: boolean;
}

export const colleges: College[] = [
  { id: "iitd", name: "IIT Delhi", short: "IITD", lat: 28.545, lng: 77.1926, metro: "IIT Delhi (Magenta Line)" },
  { id: "dtu", name: "Delhi Technological University", short: "DTU", lat: 28.7499, lng: 77.1183, metro: "Samaypur Badli (Yellow Line)" },
  {
    id: "nsut",
    name: "Netaji Subhas Univ. of Technology",
    short: "NSUT",
    lat: 28.6096,
    lng: 77.0369,
    metro: "Dwarka Mor (Blue Line)",
  },
  { id: "iiitd", name: "IIIT Delhi", short: "IIITD", lat: 28.5459, lng: 77.2732, metro: "Govind Puri / Okhla NSIC (Violet Line)" },
  { id: "jmi", name: "Jamia Millia Islamia", short: "JMI", lat: 28.5616, lng: 77.2802, metro: "Jamia Millia Islamia (Magenta Line)" },
  { id: "du", name: "University of Delhi (North)", short: "DU", lat: 28.6889, lng: 77.2091, metro: "Vishwavidyalaya (Yellow Line)" },
  { id: "amity", name: "Amity University, Noida", short: "Amity", lat: 28.5442, lng: 77.3332, metro: "Okhla Bird Sanctuary (Magenta Line)" },
  { id: "bpit", name: "Bharati Vidyapeeth (BVCOE)", short: "BVCOE", lat: 28.6764, lng: 77.1197, metro: "Paschim Vihar East (Green Line)" },
];

const d = (days: number, hour = 10) => {
  const t = new Date();
  t.setHours(hour, 0, 0, 0);
  t.setDate(t.getDate() + days);
  return t.toISOString();
};

const r = (author: string, rating: number, text: string): Review => ({
  author,
  rating,
  text,
  sample: true,
});

export const events: EventItem[] = [
  {
    id: "e_past1",
    title: "DTU Vihaan 007 Hackathon",
    category: "Hackathon",
    collegeId: "dtu",
    organizer: "IEEE DTU",
    start: d(-25, 9),
    end: d(-23, 18),
    deadline: d(-30),
    fee: 0,
    eligibility: "UG/PG students, teams of 2–4",
    tags: ["AI", "Web3", "Open Innovation"],
    description: "Annual 36-hour flagship hackathon across Delhi-NCR with 600+ builders. Built an automated disaster relief routing system.",
    quality: 4.8,
    prize: "₹1.5L First Runner Up 🥈",
    reviews: [
      r("Aarav (sample)", 5, "Incredible energy and midnight mentorship."),
      r("Sparsh", 5, "Won 2nd place in Open Innovation track!"),
    ],
  },
  {
    id: "e_past2",
    title: "IIITD Apex Algorithm Duel",
    category: "Competition",
    collegeId: "iiitd",
    organizer: "Foobar CS Society IIITD",
    start: d(-14, 14),
    end: d(-14, 18),
    deadline: d(-18),
    fee: 100,
    eligibility: "Solo or Teams of 2",
    tags: ["Algorithms", "CP", "Systems"],
    description: "High-intensity speed programming contest tackling distributed graph problems under strict memory limits.",
    quality: 4.5,
    prize: "Rank #4 Finalist 🎖️",
    reviews: [
      r("Kabir (sample)", 4, "Challenging graph theory problems."),
    ],
  },
  {
    id: "e_past3",
    title: "HackNSUT Winter Edition",
    category: "Hackathon",
    collegeId: "nsut",
    organizer: "Crosslinks NSUT",
    start: d(-42, 10),
    end: d(-40, 17),
    deadline: d(-48),
    fee: 0,
    eligibility: "Open to all students",
    tags: ["AI", "Civic Tech", "Mobile"],
    description: "48-hour builder marathon focusing on student civic tech and public transport solutions.",
    quality: 4.6,
    prize: "Best UI/UX Award 🏆",
    reviews: [
      r("Priya", 5, "Great mentors and smooth judging process."),
    ],
  },
  {
    id: "e1",
    title: "HackDelhi 36",
    category: "Hackathon",
    collegeId: "iitd",
    organizer: "DevClub IITD",
    start: d(6, 9),
    end: d(7, 18),
    deadline: d(3),
    fee: 0,
    eligibility: "Any UG/PG student, teams of 2–4",
    tags: ["AI", "Web", "Open Innovation"],
    description: "36-hour overnight hackathon with mentors from industry, meals provided.",
    quality: 4.6,
    prize: "₹3L pool",
    reviews: [
      r("Aarav (sample)", 5, "Great mentors and smooth logistics."),
      r("Isha (sample)", 4, "Wi-Fi struggled late night."),
    ],
  },
  {
    id: "e2",
    title: "Intro to Rust Workshop",
    category: "Workshop",
    collegeId: "iiitd",
    organizer: "FOSS IIITD",
    start: d(4, 14),
    end: d(4, 17),
    deadline: d(2),
    fee: 150,
    eligibility: "Open to all students",
    tags: ["Systems", "Rust"],
    description:
      "Hands-on, bring your laptop. Covers ownership, borrowing, and a mini CLI project.",
    quality: 4.2,
    reviews: [r("Kabir (sample)", 4, "Good pace for beginners.")],
  },
  {
    id: "e3",
    title: "Design Sprint Challenge",
    category: "Competition",
    collegeId: "nsut",
    organizer: "Design Society NSUT",
    start: d(6, 11),
    end: d(6, 17),
    deadline: d(4),
    fee: 200,
    eligibility: "UG students, solo or duo",
    tags: ["UI/UX", "Design"],
    description: "Solve a real product brief in 6 hours. Judged by product designers.",
    quality: 4.0,
    prize: "₹50k",
    reviews: [],
  },
  {
    id: "e4",
    title: "Engifest Tech Expo",
    category: "Fest",
    collegeId: "dtu",
    organizer: "DTU Cultural Council",
    start: d(12, 10),
    end: d(14, 21),
    deadline: d(10),
    fee: 300,
    eligibility: "Open, college ID required",
    tags: ["Robotics", "Expo", "Culture"],
    description: "Three-day fest with robotics arena, startup booths and concerts.",
    quality: 4.4,
    reviews: [
      r("Meera (sample)", 5, "Massive crowd, amazing energy."),
      r("Rohan (sample)", 3, "Long entry queues."),
    ],
  },
  {
    id: "e5",
    title: "ML Systems Conference",
    category: "Conference",
    collegeId: "iitd",
    organizer: "ACM IITD",
    start: d(9, 9),
    end: d(9, 18),
    deadline: d(7),
    fee: 500,
    eligibility: "UG/PG, research interest preferred",
    tags: ["AI", "Research"],
    description: "Talks on efficient inference, MLOps and student paper presentations.",
    quality: 4.7,
    reviews: [r("Tanya (sample)", 5, "Talks were top quality.")],
  },
  {
    id: "e6",
    title: "Startup Pitch Night",
    category: "Competition",
    collegeId: "amity",
    organizer: "E-Cell Amity",
    start: d(5, 17),
    end: d(5, 21),
    deadline: d(3),
    fee: 0,
    eligibility: "Student founders, pre-seed",
    tags: ["Entrepreneurship"],
    description: "5-minute pitches to angel investors. Shortlist announced 48h before.",
    quality: 3.8,
    prize: "₹1L grant",
    reviews: [],
  },
  {
    id: "e7",
    title: "CTF: Capture The Flag",
    category: "Competition",
    collegeId: "jmi",
    organizer: "Cyber Society JMI",
    start: d(6, 10),
    end: d(6, 22),
    deadline: d(5),
    fee: 100,
    eligibility: "Teams of up to 3",
    tags: ["Security"],
    description: "Jeopardy-style CTF across web, crypto, pwn and forensics.",
    quality: 4.3,
    reviews: [r("Dev (sample)", 4, "Challenges were well-designed.")],
  },
  {
    id: "e8",
    title: "Figma to Code Bootcamp",
    category: "Workshop",
    collegeId: "bpit",
    organizer: "GDSC BVCOE",
    start: d(15, 11),
    end: d(15, 16),
    deadline: d(13),
    fee: 0,
    eligibility: "Open to all",
    tags: ["Design", "Web"],
    description: "From mockups to responsive React components in one afternoon.",
    quality: 3.9,
    reviews: [],
  },
  {
    id: "e9",
    title: "Smart City Hackathon",
    category: "Hackathon",
    collegeId: "du",
    organizer: "DU Innovation Hub",
    start: d(20, 9),
    end: d(21, 17),
    deadline: d(16),
    fee: 250,
    eligibility: "UG students, teams of 3–5",
    tags: ["IoT", "Civic Tech", "AI"],
    description: "Build solutions for urban mobility and waste management with city datasets.",
    quality: 4.1,
    prize: "₹2L pool",
    reviews: [r("Neha (sample)", 4, "Interesting problem statements.")],
  },
];

export const societies: Society[] = [
  {
    id: "s1",
    name: "DevClub IITD",
    collegeId: "iitd",
    focus: ["Technical", "Hackathon"],
    members: 240,
    about: "Builders of campus software and organizers of HackDelhi.",
  },
  {
    id: "s2",
    name: "Design Society NSUT",
    collegeId: "nsut",
    focus: ["Design", "Marketing"],
    members: 120,
    about: "Product, brand and motion design collective.",
  },
  {
    id: "s3",
    name: "E-Cell Amity",
    collegeId: "amity",
    focus: ["Sponsorship", "Marketing"],
    members: 180,
    about: "Entrepreneurship cell with an active alumni investor network.",
  },
  {
    id: "s4",
    name: "Cyber Society JMI",
    collegeId: "jmi",
    focus: ["Technical"],
    members: 90,
    about: "Security research, CTFs and awareness drives.",
  },
  {
    id: "s5",
    name: "GDSC BVCOE",
    collegeId: "bpit",
    focus: ["Technical", "Design"],
    members: 300,
    about: "Google Developer Student Club running workshops every month.",
  },
];

export const seedRequests: CollabRequest[] = [
  {
    id: "c1",
    societyId: "s1",
    type: "Design",
    title: "Need a design partner for HackDelhi branding",
    details: "Looking for a society to co-own posters, swag and stage visuals.",
    createdAt: d(-1),
  },
  {
    id: "c2",
    societyId: "s3",
    type: "Sponsorship",
    title: "Co-sponsor outreach for Pitch Night",
    details: "Share sponsor leads; logos on both events.",
    createdAt: d(-2),
  },
  {
    id: "c3",
    societyId: "s4",
    type: "Hackathon",
    title: "Teammates wanted: security track",
    details: "Two members looking for web devs to join a hackathon team.",
    createdAt: d(-3),
  },
];

export const collegeById = (id: string) => colleges.find((c) => c.id === id)!;
export const eventById = (id: string) => events.find((e) => e.id === id);
export const societyById = (id: string) => societies.find((s) => s.id === id);
