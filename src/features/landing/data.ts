import {
  CalendarCheck,
  ClipboardCheck,
  SearchCheck,
  Wrench,
  Gauge,
  Activity,
  LayoutDashboard,
  Search,
  ShieldCheck,
} from "lucide-react";

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Flow", href: "#flow" },
  { label: "Our Team", href: "#team" },
];

export const aboutChips = [
  "Audit Checklist",
  "Finding Management",
  "CAPA Tracking",
  "Quality Scorecards",
];

export const features = [
  {
    icon: CalendarCheck,
    title: "Audit Plan",
    desc: "Yearly audit schedules with auditors assigned per clause.",
    tags: ["Annual Schedule", "Auditor Assignment"],
  },
  {
    icon: ClipboardCheck,
    title: "Audit Checklist",
    desc: "Digital checklists for field audits, with photo evidence and notes.",
    tags: ["ISO 9001", "ISO 14001", "GMP"],
  },
  {
    icon: SearchCheck,
    title: "Findings",
    desc: "Record and categorize every audit finding so nothing gets lost.",
    tags: ["Major NC", "Minor NC", "OFI"],
  },
  {
    icon: Wrench,
    title: "CAPA",
    desc: "Track corrective and preventive actions through to verified close-out.",
    tags: ["PIC & Deadline", "Close-out"],
  },
  {
    icon: Gauge,
    title: "Compliance Score",
    desc: "See compliance percentage per department at a glance.",
    tags: ["Per Department", "Monthly Trend"],
  },
  {
    icon: Activity,
    title: "SPC Analysis",
    desc: "Monitor critical process parameters with control charts and Cp/Cpk.",
    tags: ["Control Chart", "Cp/Cpk", "Excel"],
  },
  {
    icon: LayoutDashboard,
    title: "Quality Scorecard",
    desc: "One dashboard for finding trends, CAPA completion, and audit coverage.",
    tags: ["PIC & Deadline", "Close-out"],
  },
];

export const flowSteps = [
  {
    icon: CalendarCheck,
    title: "Audit Plan",
    role: "Quality Manager",
    desc: "Schedule audits and assign auditors",
  },
  {
    icon: ClipboardCheck,
    title: "Audit Checklist",
    role: "Auditor Internal",
    desc: "Run the checklist with photo evidence",
  },
  {
    icon: Search,
    title: "Findings",
    role: "Auditor Internal",
    desc: "Classify as Major NC, Minor NC, Observation or OFI.",
  },
  {
    icon: Wrench,
    title: "CAPA",
    role: "Auditee",
    desc: "Fix with a PIC and deadline, then submit evidence",
  },
  {
    icon: ShieldCheck,
    title: "Monitoring",
    role: "Quality Manager",
    desc: "Approve close-out and track the Quality Scorecard",
  },
];

// export const team = [
//   { name: "Arfan", roles: ["Product Owner", "UI/UX Designer"], photo: "/images/team/arfan.png" },
//   { name: "Bila", roles: ["Assistant Scrum Master", "UI/UX Designer"], photo: "/images/team/bila.png" },
//   { name: "Nailong", roles: ["Mobile Developer"], photo: "/images/team/nailong.png" },
//   { name: "Habib", roles: ["Frontend Developer"], photo: "/images/team/habib.png" },
//   { name: "Dika", roles: ["Backend Developer"], photo: "/images/team/dika.png" },
//   { name: "Zaky", roles: ["Backend Developer"], photo: "/images/team/saky.png" },
//   { name: "Ardra", roles: ["Testing"], photo: "/images/team/ardra.png" },
// ];


export const team = [
  { 
    name: "Arfan", 
    roles: ["Product Owner", "UI/UX Designer"], 
    photo: "/images/team/arfan.png",
    email: "arfanit14@gmail.com",
    instagram: "https://www.instagram.com/zeeyadaaah?obrf=MW1tdzJoYm94MmV0Yw==",
    linkedin: "https://www.linkedin.com/in/arfan-adib-52a0371ab?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  { 
    name: "Bila", 
    roles: ["Assistant Scrum Master", "UI/UX Designer"], 
    photo: "/images/team/bila.png",
    email: "nabilasuryn@gmail.com",
    instagram: "https://www.instagram.com/nabilasuryn?dlrf=NXhzaDQ5eGU1d3g5",
    linkedin: "https://www.linkedin.com/in/nabilafirdasuryani"
  },
  { 
    name: "Nailong", 
    roles: ["Mobile Developer"], 
    photo: "/images/team/nailong.png",
    email: "nadina.nur0029@gmail.com",
    instagram: "https://www.instagram.com/nadina_btb?mdxt=NTFzbDVzYnQ2NXZ4",
    linkedin: "https://www.linkedin.com/in/nadinanurfadhilah"
  },
  { 
    name: "Habib", 
    roles: ["Frontend Developer"], 
    photo: "/images/team/habib.png",
    email: "yusufhabibullahs@it.student.pens.ac.id",
    instagram: "https://www.instagram.com/yusufhabs?mdxt=YWZxemVnb2NuYzB1",
    linkedin: "https://id.linkedin.com/in/yusuf-habibullah-undefined-9b75313b6"
  },
  { 
    name: "Dika", 
    roles: ["Backend Developer"], 
    photo: "/images/team/dika.png",
    email: "andikazafka04@gmail.com",
    instagram: "https://www.instagram.com/andikaujfaluzi?cplk=OGdyOThxbzJtZWtt",
    linkedin: "https://www.linkedin.com/in/andika-zafka-004454378?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  { 
    name: "Zaky", 
    roles: ["Backend Developer"], 
    photo: "/images/team/saky.png",
    email: "zakymadilaubarus@gmail.com",
    instagram: "https://www.instagram.com/baruszaky?mdxt=amtxaHBleGs2aQ==",
    linkedin: "https://www.linkedin.com/in/zaky-madilau-barus-4a3957366?trk=contact-info"
  },
  { 
    name: "Ardra", 
    roles: ["Testing"], 
    photo: "/images/team/ardra.png",
    email: "ardrarazansyaikhah@gmail.com",
    instagram: "https://www.instagram.com/ardra.ras?dlrf=b3VzdGhvd2N0djE=",
    linkedin: "https://www.linkedin.com/in/ardrarazaansyaikhah?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
];

