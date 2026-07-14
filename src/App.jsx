import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ChatWidget from "./ChatWidget";
import { openStoreCal } from "./storecal";

gsap.registerPlugin(ScrollTrigger);

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=Surgical+Auto+Repair+Mount+Vernon+reviews";
const FACEBOOK_URL = "https://www.facebook.com/SurgicalAutoRepair";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Surgical+Auto+Repair+Inc/@40.9141396,-73.8482317,842m/";
const SHOP_NAME = "Surgical Auto Repair";
const SHOP_PHONE = "(914) 665-3770";
const SHOP_PHONE_HREF = "tel:9146653770";
const SHOP_ADDRESS = "40 N Macquesten Pkwy, Mount Vernon, NY 10550";
const SHOP_MAP_URL =
  "https://www.google.com/maps/place/Surgical+Auto+Repair/@40.9141396,-73.8508066,17z/data=!4m15!1m8!3m7!1s0x89c2f2b60f8f996f:0xc21fb9b84db8709a!2s40+N+MacQuesten+Pkwy,+Mt+Vernon,+NY+10550!3b1!8m2!3d40.9141396!4d-73.8482317!16s%2Fg%2F11bw429pbb!3m5!1s0x89c2f3c837b07da7:0xe5c812c67b1dffee!8m2!3d40.9141396!4d-73.8482317!16s%2Fg%2F11x283dh6t?entry=ttu";
const SHOP_MAP_EMBED_URL =
  "https://maps.google.com/maps?q=40%20N%20Macquesten%20Pkwy%20Mount%20Vernon%20NY%2010550&output=embed";

const SERVICE_AREAS = [
  "Mount Vernon",
  "Fleetwood",
  "Bronxville",
  "Yonkers",
  "New Rochelle",
  "Pelham",
  "Eastchester",
  "Tuckahoe",
];

const LEAD_CARD_TITLE = "Book An Appointment";
const LEAD_CARD_BODY = "";

const VEHICLE_YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 42; i += 1) years.push(current - i);
  return years;
})();

const VEHICLE_MAKE_OPTIONS = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
]
  .sort((a, b) => a.localeCompare(b))
  .concat(["Other"]);


/** In-app booking modal (hash only — no third-party scheduler). */
const BOOKING_MODAL_HREF = "#book";

/** EmailJS (https://www.emailjs.com/) — set in `.env` per EMAILJS.md */
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "";

function isEmailJsConfigured() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

function opensBookingModal(href) {
  return href === BOOKING_MODAL_HREF || href === "#schedule";
}

function isExternalHttpUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function ctaHrefWithBookingDefault(section) {
  return section.ctaLink || BOOKING_MODAL_HREF;
}

function getActivePageFromHash(hash) {
  if (hash === "#services") return "services";
  if (hash === "#reviews") return "reviews";
  if (hash === "#about") return "about";
  return "home";
}

const ABOUT_VALUES = [
  {
    title: "Professional Standards",
    body: "We service all makes and models and only perform work that is actually needed — no upselling, no padding the bill.",
  },
  {
    title: "Every Job Is Personal",
    body: "We treat every customer and every vehicle like family. Honest answers, clear estimates, and work you can count on.",
  },
  {
    title: "We Have You Covered",
    body: "ASE-Certified technicians, a 12,000 MI / 12 MO warranty, and financing options — we stand behind every repair.",
  },
];

function resetScrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function reviewAgeInMonths(label) {
  const normalized = String(label || "").toLowerCase();
  const match = normalized.match(/(\d+)\s*(month|months|year|years)/);
  if (!match) return Number.POSITIVE_INFINITY;
  const value = Number(match[1]);
  return match[2].startsWith("year") ? value * 12 : value;
}

const CUSTOMER_REVIEWS = [
  {
    name: "Kevin Mangum",
    date: "3 months ago",
    rating: 5,
    quote:
      "The level of professionalism and expertise is astonishing! Sandra and Donald are wonderful, fair, personable individuals that go the extra mile for your satisfaction.",
  },
  {
    name: "Cathay M.",
    date: "7 months ago",
    rating: 5,
    quote: "Professional services. The service was great and the people are very professional.",
  },
  {
    name: "Marcus T.",
    date: "8 months ago",
    rating: 5,
    quote: "Great service, very friendly, and would highly recommend. They had my car done faster than expected.",
  },
  {
    name: "Denise R.",
    date: "1 year ago",
    rating: 5,
    quote:
      "The team handled both jobs quickly and professionally. What I really appreciate is that they treat me and my vehicle like family.",
  },
  {
    name: "Jerome W.",
    date: "1 year ago",
    rating: 5,
    quote:
      "Surgical Auto Repair has handled all maintenance on my vehicles for the past 3 years. They are trustworthy, work quickly, and affordable. I highly recommend them to anyone in need of auto repair service!",
  },
  {
    name: "Tamara B.",
    date: "1 year ago",
    rating: 5,
    quote:
      "They are transparent and honest in the cost and repair that needs to be done to your car. Their workers are very professional and very efficient. I would recommend this place to anyone.",
  },
  {
    name: "Andre P.",
    date: "2 years ago",
    rating: 5,
    quote:
      "After going to four different shops with my problem unsolved, I found Surgical Auto Repair. I was very skeptical but I called and made an appointment — this was the best call I ever made.",
  },
  {
    name: "Lisa C.",
    date: "2 years ago",
    rating: 5,
    quote:
      "The staff are very friendly and very knowledgeable. They communicate well and give updates as soon as they get them.",
  },
  {
    name: "Raymond F.",
    date: "2 years ago",
    rating: 5,
    quote:
      "I've been bringing my cars here for years and will never go anywhere else. Honest, fast, and fair — they always explain exactly what needs to be done and why. That kind of trust is hard to find.",
  },
].sort((a, b) => reviewAgeInMonths(a.date) - reviewAgeInMonths(b.date));


const serviceDetails = [
  {
    title: "NY State Inspection",
    startingPrice: "Starting at $37",
    symptoms: ["Inspection due date approaching", "Registration renewal needed", "Warning lights before inspection"],
    included: ["Safety and emissions checks", "Pass/fail results explained", "Guidance on any required repairs"],
  },
  {
    title: "Oil Change Service",
    startingPrice: "Request a Quote",
    symptoms: ["Oil life indicator alert", "Dark or low oil", "Louder engine operation"],
    included: ["Oil and filter replacement", "Fluid top-off", "Multi-point visual inspection"],
  },
  {
    title: "Brake Repair",
    startingPrice: "Request a Quote",
    symptoms: ["Squealing or grinding noises", "Soft brake pedal", "Longer stopping distance"],
    included: ["Brake inspection", "Pad/rotor recommendations", "Road test and safety check"],
  },
  {
    title: "Engine Diagnostics",
    startingPrice: "Request a Quote",
    symptoms: ["Check engine light is on", "Rough idle or stalling", "Loss of power or hesitation"],
    included: ["Computer code scan", "System testing", "Clear repair plan with estimate"],
  },
  {
    title: "Suspension & Steering Repair",
    startingPrice: "Request a Quote",
    symptoms: ["Vehicle pulling to one side", "Bumpy or unstable ride", "Steering feels loose"],
    included: ["Steering and suspension check", "Component wear assessment", "Repair estimate and alignment guidance"],
  },
  {
    title: "Battery & Charging System",
    startingPrice: "Request a Quote",
    symptoms: ["Slow engine crank", "Battery warning light", "Electrical accessories cutting out"],
    included: ["Battery and alternator testing", "Terminal and cable inspection", "Replacement recommendations"],
  },
  {
    title: "Cooling System Service",
    startingPrice: "Request a Quote",
    symptoms: ["Temperature gauge running hot", "Coolant leaks under vehicle", "Heater not working properly"],
    included: ["Cooling pressure test", "Radiator and hose inspection", "Coolant service recommendations"],
  },
  {
    title: "Transmission Service",
    startingPrice: "Request a Quote",
    symptoms: ["Delayed gear engagement", "Hard shifting", "Transmission fluid leak"],
    included: ["Fluid condition inspection", "System performance check", "Service/repair recommendations"],
  },
  {
    title: "A/C & Heating Repair",
    startingPrice: "Request a Quote",
    symptoms: ["Weak airflow", "Warm air from A/C vents", "No cabin heat in cold weather"],
    included: ["HVAC system diagnostics", "Leak and pressure checks", "Repair quote with parts options"],
  },
  {
    title: "Exhaust & Muffler Repair",
    startingPrice: "Request a Quote",
    symptoms: ["Loud exhaust noise", "Rattling under vehicle", "Reduced fuel efficiency"],
    included: ["Exhaust leak diagnostics", "Muffler and pipe inspection", "Repair/replacement options"],
  },
];

/** Service dropdown options aligned with Services page + Other (booking wizard). */
const BOOKING_SERVICE_OPTIONS = [...serviceDetails.map((s) => s.title), "Other"];

/** StoreCal — services are sourced live from the shop's public config. */
const STORECAL_STORE_KEY = "sc_b55a9b883e128fa63a";
const STORECAL_API_BASE = "https://www.storecal.com";

/** Emoji icon per service (keyed by StoreCal service name; wrench fallback). */
const SERVICE_ICONS = {
  "NY State Inspection": "📋",
  "Oil Change Service": "🛢️",
  "Brake Repair": "🛑",
  "Engine Diagnostics": "⚙️",
  "Suspension & Steering Repair": "🚗",
  "Battery & Charging System": "🔋",
  "Cooling System Service": "❄️",
  "Transmission Service": "🔧",
  "A/C & Heating Repair": "🌡️",
  "Exhaust & Muffler Repair": "💨",
};
function serviceIconFor(name) {
  return SERVICE_ICONS[name] || "🔧";
}

// Mirrors StoreCal's live config so cards render instantly and still work if the
// API is unreachable; useStoreCalServices() overrides this once the fetch lands.
const FALLBACK_SERVICES = [
  { _id: "insp", name: "NY State Inspection", description: "Safety and emissions inspection. Pass/fail results explained.", durationMin: 30, price: "$37" },
  { _id: "oil", name: "Oil Change Service", description: "Oil and filter replacement, fluid top-off, and multi-point visual inspection for all makes and models.", durationMin: 30, price: "Request a Quote" },
  { _id: "brake", name: "Brake Repair", description: "Full brake inspection, pad and rotor replacement, road test and safety check.", durationMin: 60, price: "Request a Quote" },
  { _id: "diag", name: "Engine Diagnostics", description: "Check engine light diagnosis, computer code scan, system testing, and clear repair plan with estimate.", durationMin: 45, price: "Request a Quote" },
  { _id: "susp", name: "Suspension & Steering Repair", description: "Steering and suspension check, component wear assessment, alignment guidance.", durationMin: 60, price: "Request a Quote" },
  { _id: "batt", name: "Battery & Charging System", description: "Battery and alternator testing, terminal and cable inspection, replacement recommendations.", durationMin: 30, price: "Request a Quote" },
  { _id: "cool", name: "Cooling System Service", description: "Cooling pressure test, radiator and hose inspection, coolant service.", durationMin: 45, price: "Request a Quote" },
  { _id: "trans", name: "Transmission Service", description: "Fluid condition inspection, system performance check, service and repair recommendations.", durationMin: 60, price: "Request a Quote" },
  { _id: "ac", name: "A/C & Heating Repair", description: "HVAC system diagnostics, leak and pressure checks, repair quote with parts options.", durationMin: 60, price: "Request a Quote" },
  { _id: "exh", name: "Exhaust & Muffler Repair", description: "Exhaust leak diagnostics, muffler and pipe inspection, repair and replacement options.", durationMin: 60, price: "Request a Quote" },
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: SHOP_NAME,
  telephone: SHOP_PHONE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "40 N Macquesten Pkwy",
    addressLocality: "Mount Vernon",
    addressRegion: "NY",
    postalCode: "10550",
    addressCountry: "US",
  },
  areaServed: SERVICE_AREAS.map((area) => ({
    "@type": "City",
    name: area,
  })),
  sameAs: [GOOGLE_REVIEW_URL],
};

function buildTimeSlots(endMinutes) {
  const slots = [];
  for (let t = 8 * 60; t < endMinutes; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const d = new Date(2000, 0, 1, h, m);
    slots.push({
      label: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    });
  }
  return slots;
}

const WEEKDAY_SLOTS = buildTimeSlots(17 * 60 + 30);
const SATURDAY_SLOTS = buildTimeSlots(14 * 60);
const ALL_SLOTS = WEEKDAY_SLOTS;

function slotsForDateKey(dateKey) {
  if (!dateKey) return WEEKDAY_SLOTS;
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function firstDayOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthMatrix(monthAnchor) {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return { year, month, rows };
}

function dateKeyFromParts(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKeyMMDDYYYY(key) {
  const [y, m, d] = key.split("-");
  return `${m}-${d}-${y}`;
}

function isClosedWeekday(year, month, day) {
  return new Date(year, month, day).getDay() === 0;
}

function buildGoogleCalendarUrl({ title, dateKey, timeValue, durationMinutes = 25, description, location }) {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const [h, m] = timeValue.split(":").map(Number);
  const start = new Date(y, mo - 1, d, h, m);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const fmt = (dt) =>
    dt.getFullYear().toString() +
    String(dt.getMonth() + 1).padStart(2, "0") +
    String(dt.getDate()).padStart(2, "0") +
    "T" +
    String(dt.getHours()).padStart(2, "0") +
    String(dt.getMinutes()).padStart(2, "0") +
    "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: description,
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Duplicated .reviews-track inside .reviews-track-wrap; scrolls by exactly one track width.
 * Waits for fonts + two rAFs so scrollWidth matches paint, remeasures on resize when width changes.
 */
function useReviewsMarquee({
  trackWrapRef,
  trackRef,
  cloneTrackRef,
  enabled,
  introStaggerPx,
  introDuration,
  introStagger,
  speedPxPerSec = 72,
  extraDeps = [],
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const trackWrap = trackWrapRef.current;
    const track = trackRef.current;
    const cloneTrack = cloneTrackRef.current;
    if (!trackWrap || !track || !cloneTrack) return undefined;

    const cards = [...track.querySelectorAll(".review-item"), ...cloneTrack.querySelectorAll(".review-item")];

    let marqueeTween = null;
    let resizeTimeout;

    const measureLoopWidth = () =>
      Math.round(Math.max(track.scrollWidth, cloneTrack.scrollWidth));

    let lastLoopWidth = -1;

    const killMarquee = () => {
      if (marqueeTween) {
        marqueeTween.kill();
        marqueeTween = null;
      }
      gsap.killTweensOf(trackWrap);
    };

    const playMarquee = (w) => {
      killMarquee();
      gsap.set(trackWrap, { x: 0 });
      marqueeTween = gsap.to(trackWrap, {
        x: -w,
        duration: w / speedPxPerSec,
        ease: "none",
        repeat: -1,
      });
    };

    const runFull = () => {
      killMarquee();
      gsap.killTweensOf(cards);
      const w = measureLoopWidth();
      if (!w) return;
      lastLoopWidth = w;
      gsap.set(cards, { x: introStaggerPx, opacity: 0 });
      gsap.to(cards, {
        x: 0,
        opacity: 1,
        duration: introDuration,
        ease: "power3.out",
        stagger: introStagger,
      });
      playMarquee(w);
    };

    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = measureLoopWidth();
        if (!w) return;
        if (lastLoopWidth !== -1 && Math.abs(w - lastLoopWidth) < 2) return;
        lastLoopWidth = w;
        playMarquee(w);
      }, 100);
    });

    const schedule = () => {
      const exec = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            runFull();
            ro.observe(track);
          });
        });
      };
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(exec);
      } else {
        exec();
      }
    };

    schedule();

    return () => {
      clearTimeout(resizeTimeout);
      ro.disconnect();
      killMarquee();
      gsap.killTweensOf(cards);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extraDeps carries review identity
  }, [enabled, introStaggerPx, introDuration, introStagger, speedPxPerSec, ...extraDeps]);
}

function MechanicLeadWizard({ title, body, variant = "page", onSubmitted }) {
  const leadFormRef = useRef(null);
  const calendarColRef = useRef(null);
  const leadTimesRef = useRef(null);
  const timesPrevKeyRef = useRef(null);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);
  const [step, setStep] = useState(1);
  const [monthAnchor, setMonthAnchor] = useState(() => firstDayOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [calCollapsed, setCalCollapsed] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slotAvailability, setSlotAvailability] = useState({});
  const [fullyBookedDays, setFullyBookedDays] = useState(new Set());
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleTrim, setVehicleTrim] = useState("");
  const [serviceRequested, setServiceRequested] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const today = startOfToday();
  const todayKey = dateKeyFromParts(today.getFullYear(), today.getMonth(), today.getDate());

  const todayHasSlots = useMemo(() => {
    const now = new Date();
    const cutoff = now.getHours() * 60 + now.getMinutes() + 30;
    return slotsForDateKey(todayKey).some((slot) => {
      const [h, m] = slot.value.split(":").map(Number);
      return h * 60 + m > cutoff;
    });
  }, [todayKey]);

  const anchorStart = firstDayOfMonth(monthAnchor);
  const currentMonthStart = firstDayOfMonth(new Date());
  const canGoPrev = anchorStart > currentMonthStart;

  const { year, month, rows } = monthMatrix(monthAnchor);

  const composedEmailBody = useMemo(() => {
    const timeLabel = selectedTime
      ? ALL_SLOTS.find((s) => s.value === selectedTime)?.label || selectedTime
      : "";
    return [
      `${SHOP_NAME} — appointment request`,
      "",
      `Appointment Date: ${selectedDateKey ? formatDateKeyMMDDYYYY(selectedDateKey) : "—"}`,
      `Appointment Time: ${timeLabel || "—"}`,
      `Service: ${serviceRequested || "—"}`,
      `Issue: ${issueDescription.trim() || "—"}`,
      `Vehicle: ${vehicleYear || "—"} ${vehicleMake || "—"} ${vehicleModel || "—"}${vehicleTrim ? ` (${vehicleTrim})` : ""}`,
      "",
      `Name: ${contactName || "—"}`,
      `Email: ${contactEmail || "—"}`,
      `Phone: ${contactPhone || "—"}`,
    ].join("\n");
  }, [
    selectedDateKey,
    selectedTime,
    serviceRequested,
    issueDescription,
    vehicleYear,
    vehicleMake,
    vehicleModel,
    vehicleTrim,
    contactName,
    contactEmail,
    contactPhone,
  ]);

  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  }, []);

  useLayoutEffect(() => {
    if (step !== 1) return;
    const root = calendarColRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const head = root.querySelector(".lead-cal__head");
      const weekdays = root.querySelector(".lead-cal__weekdays");
      const rows = root.querySelectorAll(".lead-cal__row");
      const tz = root.querySelector(".lead-schedule__tz");

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      if (head) {
        tl.fromTo(head, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.38 });
      }
      if (weekdays) {
        tl.fromTo(weekdays, { opacity: 0 }, { opacity: 1, duration: 0.22 }, "-=0.18");
      }
      if (rows.length) {
        tl.fromTo(
          rows,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.055 },
          "-=0.12"
        );
      }
      if (tz) {
        tl.fromTo(tz, { opacity: 0 }, { opacity: 1, duration: 0.28 }, "-=0.2");
      }
    }, root);

    return () => ctx.revert();
  }, [step]);

  useLayoutEffect(() => {
    if (step !== 1) {
      timesPrevKeyRef.current = null;
      return;
    }
    if (!selectedDateKey) {
      timesPrevKeyRef.current = null;
      return;
    }

    const el = leadTimesRef.current;
    if (!el) return;

    const hadPriorDate = timesPrevKeyRef.current !== null;
    timesPrevKeyRef.current = selectedDateKey;
    if (hadPriorDate) return;

    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: 100, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.58, ease: "power3.out" }
      );
    }, el);

    return () => ctx.revert();
  }, [step, selectedDateKey]);

  const handleLeadSubmit = async (event) => {
    event.preventDefault();
    if (!isEmailJsConfigured()) {
      setSubmitError("Email is not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your environment.");
      setSubmitStatus("error");
      return;
    }
    if (!leadFormRef.current) return;

    setSubmitError(null);
    setSubmitStatus("sending");
    try {
      const reserveRes = await fetch("/api/record-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey: selectedDateKey, timeValue: selectedTime }),
      });

      if (reserveRes.status === 409) {
        const err409 = await reserveRes.json().catch(() => ({}));
        setSlotAvailability((prev) => ({
          ...prev,
          [selectedTime]: { booked: 2, remaining: 0 },
        }));
        setSelectedTime(null);
        setSubmitError(err409.error || "This time slot was just booked. Please pick another time.");
        setSubmitStatus("error");
        setStep(1);
        return;
      }

      if (!reserveRes.ok) {
        const errBody = await reserveRes.json().catch(() => ({}));
        throw new Error(errBody.error || `Booking failed (${reserveRes.status}). Please try again.`);
      }

      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, leadFormRef.current, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      setSubmitStatus("sent");

      setSlotAvailability((prev) => {
        const cur = prev[selectedTime]?.booked || 0;
        return { ...prev, [selectedTime]: { booked: cur + 1, remaining: Math.max(0, 2 - cur - 1) } };
      });

      // Calendar event creation — non-blocking but logs result for debugging.
      // If it fails, the booking + email still succeed; check browser console
      // and Netlify function logs for the underlying Google API error.
      fetch("/api/create-calendar-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey: selectedDateKey,
          timeValue: selectedTime,
          contactName,
          contactEmail,
          contactPhone,
          serviceRequested,
          issueDescription,
          vehicleYear,
          vehicleMake,
          vehicleModel,
          vehicleTrim,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.success) {
            console.warn("[calendar] failed:", res.status, data);
          } else {
            console.log("[calendar] event created:", data.eventId, data.htmlLink);
          }
        })
        .catch((err) => console.warn("[calendar] network error:", err));
    } catch (err) {
      const msg =
        (typeof err?.text === "string" && err.text) ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Something went wrong. Please try again or call the shop.";
      setSubmitError(msg);
      setSubmitStatus("error");
    }
  };

  const selectedDateLabel =
    selectedDateKey &&
    parseDateKey(selectedDateKey).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const step1Complete = Boolean(selectedDateKey && selectedTime);
  const step2Complete =
    serviceRequested.trim().length > 0 &&
    vehicleMake.trim().length > 0 &&
    vehicleModel.trim().length > 0 &&
    vehicleYear.trim().length > 0;
  const step3Complete =
    contactName.trim().length > 0 &&
    contactEmail.trim().length > 0 &&
    contactPhone.trim().length > 0;

  useEffect(() => {
    if (!selectedDateKey || step !== 1) return;
    let cancelled = false;
    fetch(`/api/get-slot-availability?date=${selectedDateKey}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        if (data?.slots) {
          setSlotAvailability(data.slots);
          if (selectedTime) {
            const info = data.slots[selectedTime];
            if (info && info.booked >= 2) setSelectedTime(null);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setSlotAvailability({});
      });
    return () => { cancelled = true; };
  }, [selectedDateKey, step]);

  useEffect(() => {
    let cancelled = false;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const keys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (isClosedWeekday(year, month, d)) continue;
      const dt = new Date(year, month, d);
      if (dt < today) continue;
      keys.push(dateKeyFromParts(year, month, d));
    }
    if (!keys.length) return;

    Promise.all(
      keys.map((k) =>
        fetch(`/api/get-slot-availability?date=${k}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const booked = new Set();
      results.forEach((data, i) => {
        if (!data?.slots) return;
        const key = keys[i];
        const isToday = key === todayKey;
        const daySlots = slotsForDateKey(key);
        let availableCount = 0;
        for (const slot of daySlots) {
          if (isToday) {
            const now = new Date();
            const cutoff = now.getHours() * 60 + now.getMinutes() + 30;
            const [h, m] = slot.value.split(":").map(Number);
            if (h * 60 + m <= cutoff) continue;
          }
          const info = data.slots[slot.value];
          if (!info || info.booked < 2) availableCount++;
        }
        if (availableCount === 0) booked.add(key);
      });
      setFullyBookedDays(booked);
    });
    return () => { cancelled = true; };
  }, [year, month]);

  const selectDay = (day) => {
    if (day == null) return;
    if (isClosedWeekday(year, month, day)) return;
    const candidate = new Date(year, month, day);
    candidate.setHours(0, 0, 0, 0);
    if (candidate < today) return;
    const key = dateKeyFromParts(year, month, day);
    if (key === todayKey && !todayHasSlots) return;
    if (fullyBookedDays.has(key)) return;
    setSelectedDateKey(key);
    setSelectedTime(null);
    if (window.innerWidth < 768) setCalCollapsed(true);
  };

  return (
    <div
      className={`marketing-card marketing-card--text marketing-card--lead${
        variant === "modal" ? " marketing-card--lead-modal" : ""
      }`}
    >
      <h3
        className="marketing-card__title"
        id={variant === "modal" ? "booking-wizard-title" : undefined}
      >
        {title}
      </h3>
      {body && <p className="marketing-card__body">{body}</p>}

      <div className="lead-wizard" aria-label="Schedule contact steps">
        <div className="lead-wizard__step-row">
          {step > 1 && (
            <button
              type="button"
              className="lead-wizard__step-back"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <p className="lead-wizard__step-label">
            {step === 1 &&
              (variant === "modal" ? "Select a date & time" : "1 — Pick a date & time")}
            {step === 2 && (variant === "modal" ? "Service & vehicle" : "2 — Service & vehicle")}
            {step === 3 && (variant === "modal" ? "Contact details" : "3 — Contact details")}
          </p>
          <ol className="lead-wizard__rail" aria-hidden="true">
            <li className={step >= 1 ? "lead-wizard__rail-dot is-active" : "lead-wizard__rail-dot"} />
            <li className={step >= 2 ? "lead-wizard__rail-dot is-active" : "lead-wizard__rail-dot"} />
            <li className={step >= 3 ? "lead-wizard__rail-dot is-active" : "lead-wizard__rail-dot"} />
          </ol>
        </div>

        <form
          ref={leadFormRef}
          className="lead-form lead-form--wizard"
          name="mechanic-lead"
          onSubmit={handleLeadSubmit}
        >
          {/* Field names should match your EmailJS template variables (e.g. {{user_name}}, {{message}}). */}
          <input
            type="hidden"
            name="title"
            value={`${selectedDateKey ? formatDateKeyMMDDYYYY(selectedDateKey) : "—"}, ${
              selectedTime
                ? ALL_SLOTS.find((s) => s.value === selectedTime)?.label || selectedTime
                : "—"
            } - ${contactName.trim() || ""}`}
            readOnly
          />
          <input
            type="hidden"
            name="appointment_date"
            value={selectedDateKey ? (() => { const [y,m,d] = selectedDateKey.split("-"); return `${Number(m)}/${Number(d)}/${String(y).slice(2)}`; })() : ""}
            readOnly
          />
          <input
            type="hidden"
            name="appointment_time"
            value={selectedTime ? ALL_SLOTS.find((s) => s.value === selectedTime)?.label || selectedTime : ""}
            readOnly
          />
          <input type="hidden" name="vehicle_make" value={vehicleMake} readOnly />
          <input type="hidden" name="vehicle_model" value={vehicleModel} readOnly />
          <input type="hidden" name="vehicle_year" value={vehicleYear} readOnly />
          <input type="hidden" name="vehicle_trim" value={vehicleTrim} readOnly />
          <input type="hidden" name="service_requested" value={serviceRequested} readOnly />
          <input type="hidden" name="issue_description" value={issueDescription} readOnly />
          <input type="hidden" name="customer_phone" value={contactPhone} readOnly />
          <input type="hidden" name="logo_url" value={`${window.location.origin}/images/surgical-logo.webp`} readOnly />
          <textarea name="message" readOnly className="lead-form__hidden" value={composedEmailBody} rows={1} />

          {step === 1 && (
            <div className="lead-wizard__panel lead-wizard__panel--schedule">
              <div className="lead-schedule">
                <div
                  className={`lead-schedule__layout${
                    selectedDateKey ? " lead-schedule__layout--with-times" : ""
                  }`}
                >
                  <div className="lead-schedule__calendar" ref={calendarColRef}>
                    {selectedDateKey && calCollapsed && (
                      <button
                        type="button"
                        className="lead-cal-toggle"
                        onClick={() => setCalCollapsed(false)}
                      >
                        <span className="lead-cal-toggle__label">
                          {selectedDateLabel} <span className="lead-cal-toggle__change">Change date</span>
                        </span>
                        <span className="lead-cal-toggle__icon" aria-hidden="true">▼</span>
                      </button>
                    )}
                    <div className={`lead-cal${calCollapsed && selectedDateKey ? " lead-cal--collapsed" : ""}`}>
                      <div className="lead-cal__head">
                        <button
                          type="button"
                          className="lead-cal__nav"
                          disabled={!canGoPrev}
                          onClick={() =>
                            setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                          }
                          aria-label="Previous month"
                        >
                          ‹
                        </button>
                        <span className="lead-cal__title">
                          {monthAnchor.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          type="button"
                          className="lead-cal__nav"
                          onClick={() =>
                            setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                          }
                          aria-label="Next month"
                        >
                          ›
                        </button>
                      </div>
                      <div className="lead-cal__weekdays">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                          <span key={`wd-${i}`}>{d}</span>
                        ))}
                      </div>
                      <div className="lead-cal__grid" role="grid" aria-label="Choose a day">
                        {rows.map((week, wi) => (
                          <div key={wi} className="lead-cal__row" role="row">
                            {week.map((day, di) => {
                              if (day == null) {
                                return (
                                  <div key={`e-${wi}-${di}`} className="lead-cal__cell lead-cal__cell--empty" />
                                );
                              }
                              const key = dateKeyFromParts(year, month, day);
                              const isToday = key === todayKey;
                              const disabled =
                                isClosedWeekday(year, month, day) ||
                                new Date(year, month, day) < today ||
                                (isToday && !todayHasSlots) ||
                                fullyBookedDays.has(key);
                              const isSelected = selectedDateKey === key;
                              const isAvailable = !disabled && !isSelected;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  role="gridcell"
                                  disabled={disabled}
                                  className={`lead-cal__day${isSelected ? " is-selected" : ""}${
                                    isAvailable ? " is-available" : ""
                                  }${isToday ? " is-today" : ""}`}
                                  title={isToday ? "Today" : undefined}
                                  onClick={() => selectDay(day)}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="lead-schedule__tz">Times shown in Eastern Time — US & Canada</p>
                  </div>

                  {selectedDateKey ? (
                    <div className="lead-times" ref={leadTimesRef} aria-live="polite">
                      <p className="lead-times__heading">{selectedDateLabel}</p>
                      <p className="lead-times__hint">{selectedDateKey && parseDateKey(selectedDateKey).getDay() === 6 ? "Saturday 8 AM – 2 PM" : "Mon–Fri 8 AM – 5:30 PM"} · pick a start time</p>
                      <div className="lead-times__slots" aria-label="Available start times">
                        {slotsForDateKey(selectedDateKey).map((slot) => {
                          const isOn = selectedTime === slot.value;
                          const isSelectedToday = selectedDateKey === todayKey;
                          let isPast = false;
                          if (isSelectedToday) {
                            const now = new Date();
                            const cutoff = now.getHours() * 60 + now.getMinutes() + 30;
                            const [slotH, slotM] = slot.value.split(":").map(Number);
                            isPast = slotH * 60 + slotM <= cutoff;
                          }
                          if (isPast) return null;
                          const avail = slotAvailability[slot.value];
                          const booked = avail?.booked || 0;
                          const isFull = booked >= 2;
                          const lastSpot = booked === 1;
                          if (isFull) return null;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              aria-pressed={isOn}
                              className={`lead-times__slot${isOn ? " is-selected" : ""}${lastSpot ? " is-limited" : ""}`}
                              onClick={() => setSelectedTime(slot.value)}
                            >
                              {slot.label}
                              {lastSpot && <span className="lead-times__badge lead-times__badge--last">1 spot left</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="lead-wizard__panel lead-wizard__panel--vehicle">
              <label className="lead-wizard__field--full">
              <p className="lead-wizard__section-label">What do you need help with?</p>
                <span>Select a service<span className="required-star">*</span></span>
                <select
                  value={serviceRequested}
                  onChange={(e) => setServiceRequested(e.target.value)}
                  required
                >
                  <option value="">Select a service</option>
                  {BOOKING_SERVICE_OPTIONS.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="lead-wizard__field--full">
                <span>Describe the issue (optional)</span>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                  autoComplete="off"
                  placeholder="What symptoms, noises, or concerns should we know about?"
                />
              </label>
              <p className="lead-wizard__section-label">Enter details about your car:</p>
              <div className="lead-wizard__vehicle-grid">
                <label>
                  <span>Year<span className="required-star">*</span></span>
                  <select
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    required
                  >
                    <option value="">Select year</option>
                    {VEHICLE_YEAR_OPTIONS.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Make<span className="required-star">*</span></span>
                  <select
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    required
                  >
                    <option value="">Select make</option>
                    {VEHICLE_MAKE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Model<span className="required-star">*</span></span>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. Accord"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && submitStatus === "sent" ? (
            <div className="lead-wizard__panel lead-wizard__panel--confirmation">
              <div className="lead-wizard__confirmation">
                <svg className="lead-wizard__confirmation-icon" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
                  <path d="M14 25l7 7 13-13" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="lead-form__status lead-form__status--ok" role="status">
                  Request sent! We will be in touch soon.
                </p>
                <p className="lead-wizard__recap">
                  <strong>Requested time:</strong>{" "}
                  {parseDateKey(selectedDateKey).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })} · {ALL_SLOTS.find((s) => s.value === selectedTime)?.label || selectedTime}
                  <br />
                  <strong>Service:</strong> {serviceRequested || "—"}
                  <br />
                  <strong>Vehicle:</strong> {vehicleYear} {vehicleMake} {vehicleModel}
                  {vehicleTrim ? ` · ${vehicleTrim}` : ""}
                </p>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="lead-wizard__panel">
              <label>
                <span>Name<span className="required-star">*</span></span>
                <input
                  type="text"
                  name="user_name"
                  autoComplete="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Email<span className="required-star">*</span></span>
                <input
                  type="email"
                  name="user_email"
                  autoComplete="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Phone<span className="required-star">*</span></span>
                <input
                  type="tel"
                  name="user_phone"
                  autoComplete="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </label>
              <p className="lead-wizard__recap">
                <strong>Requested time:</strong>{" "}
                {selectedDateKey && selectedTime
                  ? `${parseDateKey(selectedDateKey).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })} · ${ALL_SLOTS.find((s) => s.value === selectedTime)?.label || selectedTime}`
                  : "—"}
                <br />
                <strong>Service:</strong> {serviceRequested || "—"}
                <br />
                <strong>Issue:</strong> {issueDescription.trim() || "—"}
                <br />
                <strong>Vehicle:</strong> {vehicleYear} {vehicleMake} {vehicleModel}
                {vehicleTrim ? ` · ${vehicleTrim}` : ""}
              </p>
            </div>
          ) : null}

          <div className="lead-wizard__footer">
            {submitStatus === "sent" ? (
              <>
                <a
                  href={buildGoogleCalendarUrl({
                    title: `${serviceRequested || "Appointment"} — ${SHOP_NAME}`,
                    dateKey: selectedDateKey,
                    timeValue: selectedTime,
                    description: [
                      `Service: ${serviceRequested}`,
                      issueDescription.trim() ? `Issue: ${issueDescription.trim()}` : "",
                      `Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}${vehicleTrim ? ` (${vehicleTrim})` : ""}`,
                      "",
                      `Contact: ${contactName} · ${contactEmail} · ${contactPhone}`,
                    ].filter(Boolean).join("\n"),
                    location: SHOP_ADDRESS,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="marketing-card__cta marketing-card__cta--secondary lead-wizard__next"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Add to your calendar
                </a>
                <button
                  type="button"
                  className="marketing-card__cta marketing-card__cta--dark lead-wizard__next"
                  onClick={() => onSubmitted?.()}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                {step === 3 && submitError && (
                  <p className="lead-form__status lead-form__status--error lead-wizard__footer-error" role="alert">
                    {submitError}
                  </p>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    className="marketing-card__cta marketing-card__cta--dark lead-wizard__next"
                    disabled={(step === 1 && !step1Complete) || (step === 2 && !step2Complete)}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="marketing-card__cta marketing-card__cta--dark lead-wizard__next"
                    disabled={!step3Complete || submitStatus === "sending"}
                  >
                    {submitStatus === "sending" ? "Sending…" : "Submit request"}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function CardMedia({ section }) {
  if (section.mediaType === "video") {
    return (
      <video
        className="marketing-card__bg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={section.mediaSrc} type="video/mp4" />
      </video>
    );
  }

  return <img src={section.mediaSrc} alt="Automotive service preview" className="marketing-card__bg" />;
}

function ReviewsTicker({ reviews, googleRating = "4.8/5", onOpenReviewsPage }) {
  const trackRef = useRef(null);
  const cloneRef = useRef(null);
  const wrapRef = useRef(null);

  useReviewsMarquee({
    trackWrapRef: wrapRef,
    trackRef: trackRef,
    cloneTrackRef: cloneRef,
    enabled: Boolean(reviews?.length),
    introStaggerPx: 36,
    introDuration: 1,
    introStagger: 0.05,
    speedPxPerSec: 72,
    extraDeps: [reviews],
  });

  return (
    <section className="reviews-ticker" aria-label="Customer reviews ticker">
      <div className="reviews-list" aria-label="Customer reviews">
        <div className="reviews-list__top">
          <p className="reviews-list__score" aria-label={`${googleRating} stars`}>
            Reviews {googleRating} {"★★★★★"}
          </p>
          <div className="reviews-list__actions">
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer" className="reviews-list__cta">
              Leave a Google Review
            </a>
            <button type="button" className="reviews-list__view-all" onClick={onOpenReviewsPage}>
              View all reviews
            </button>
          </div>
        </div>
        <div className="reviews-stream">
          <div className="reviews-track-wrap" ref={wrapRef}>
            <div className="reviews-track" ref={trackRef}>
              {reviews.map((review) => (
                <article key={`${review.name}-${review.date}`} className="review-item">
                  <div className="review-item__top">
                    <strong>{review.name}</strong>
                    <span>{review.date}</span>
                  </div>
                  <p className="review-item__rating" aria-label="5 out of 5 stars">{"★★★★★"}</p>
                  <p className="review-item__quote">"{review.quote}"</p>
                </article>
              ))}
            </div>
            <div className="reviews-track" ref={cloneRef} aria-hidden="true">
              {reviews.map((review) => (
                <article key={`${review.name}-${review.date}-clone`} className="review-item">
                  <div className="review-item__top">
                    <strong>{review.name}</strong>
                    <span>{review.date}</span>
                  </div>
                  <p className="review-item__rating" aria-label="5 out of 5 stars">{"★★★★★"}</p>
                  <p className="review-item__quote">"{review.quote}"</p>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="reviews-list__mobile-actions">
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer" className="reviews-list__cta">
            Leave a Google Review
          </a>
          <button type="button" className="reviews-list__view-all" onClick={onOpenReviewsPage}>
            View all reviews
          </button>
        </div>
      </div>
    </section>
  );
}


function BookingModal({ isOpen, onClose, wizardKey }) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-wizard-title">
      <div className="booking-modal__backdrop" onClick={onClose} />
      <div className="booking-modal__panel">
        <button type="button" className="booking-modal__close" onClick={onClose}>
          Close
        </button>
        <div className="booking-modal__scroll">
          <MechanicLeadWizard
            key={wizardKey}
            title={LEAD_CARD_TITLE}
            body={LEAD_CARD_BODY}
            variant="modal"
            onSubmitted={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ onGoHome, onOpenBooking, onOpenReviewsPage, services }) {
  const servicesReviewsTrackRef = useRef(null);
  const servicesReviewsTrackCloneRef = useRef(null);
  const servicesReviewsTrackWrapRef = useRef(null);

  useReviewsMarquee({
    trackWrapRef: servicesReviewsTrackWrapRef,
    trackRef: servicesReviewsTrackRef,
    cloneTrackRef: servicesReviewsTrackCloneRef,
    enabled: true,
    introStaggerPx: 24,
    introDuration: 0.8,
    introStagger: 0.04,
    speedPxPerSec: 72,
    extraDeps: [],
  });

  return (
    <section className="services-page-view" aria-labelledby="services-page-title">
      <button type="button" className="services-page-view__back" onClick={onGoHome}>
        <svg className="services-page-view__back-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6L6 12L12 18" />
          <path d="M6 12H19" />
        </svg>
        <span>Back</span>
      </button>
      <div className="services-page-view__top">
        <div>
          <p className="services-page-view__eyebrow">Our Services</p>
          <h1 id="services-page-title" className="services-page-view__title">
            Complete auto repair and maintenance services
          </h1>
          <p className="services-page-view__intro">
            We specialize in diagnosing and repairing a variety of automotive issues, including
            engine problems, electrical faults, and brake system concerns.
          </p>
        </div>
      </div>
      <section className="services-page-view__details" aria-label="Services and pricing">
        <p className="services-page-view__eyebrow">Service Details</p>
        <h2 className="services-page-view__details-title">Our services &amp; pricing</h2>
        <div className="v3-grid v3-grid--services">
          {(services || FALLBACK_SERVICES).map((service) => (
            <ServiceCard key={service._id || service.name} service={service} />
          ))}
        </div>
      </section>
      <section className="services-page-view__book-section" aria-label="Book your appointment">
        <div className="services-page-view__book-top">
          <div>
            <p className="services-page-view__book-eyebrow">Ready to get your vehicle fixed right?</p>
            <h2 className="services-page-view__book-title">Book your appointment in under a minute.</h2>
            <p className="services-page-view__book-copy">
              Choose a time that works for you and our team will take care of the rest.
            </p>
          </div>
          <div className="services-page-view__book-total">
            <strong>★★★★★ 4.8/5</strong>
            <span>363+ verified reviews</span>
          </div>
        </div>
        <div className="services-page-view__book-reviews" aria-label="Featured customer reviews">
          <div className="reviews-stream">
            <div className="reviews-track-wrap" ref={servicesReviewsTrackWrapRef}>
              <div className="reviews-track" ref={servicesReviewsTrackRef}>
                {CUSTOMER_REVIEWS.map((review) => (
                  <article key={`${review.name}-${review.date}-services`} className="review-item">
                    <div className="review-item__top">
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>
                    <p className="review-item__rating" aria-label="5 out of 5 stars">
                      {"★★★★★"}
                    </p>
                    <p className="review-item__quote">"{review.quote}"</p>
                  </article>
                ))}
              </div>
              <div className="reviews-track" ref={servicesReviewsTrackCloneRef} aria-hidden="true">
                {CUSTOMER_REVIEWS.map((review) => (
                  <article key={`${review.name}-${review.date}-services-clone`} className="review-item">
                    <div className="review-item__top">
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>
                    <p className="review-item__rating" aria-label="5 out of 5 stars">
                      {"★★★★★"}
                    </p>
                    <p className="review-item__quote">"{review.quote}"</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="services-page-view__book-actions">
          <button type="button" className="marketing-card__cta marketing-card__cta--dark" onClick={onOpenBooking}>
            Book Appointment
          </button>
          <button type="button" className="services-page-view__book-view-all" onClick={onOpenReviewsPage}>
            View all reviews
          </button>
        </div>
      </section>
      <section className="services-page-view__local" aria-label="Location and neighborhoods served">
        <div className="services-page-view__local-top">
          <div>
            <p className="services-page-view__eyebrow">Local Service Area</p>
            <h2 className="services-page-view__details-title">Serving drivers across lower Westchester</h2>
            <p className="services-page-view__intro">
              Visit us in Mount Vernon or schedule an appointment if you are in one of our nearby neighborhoods.
            </p>
          </div>
        </div>
        <div className="services-page-view__local-grid">
          <div className="services-page-view__map-wrap">
            <iframe
              title="Surgical Auto Repair map"
              src={SHOP_MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="services-page-view__areas">
            <p className="services-page-view__detail-label">Neighborhoods we serve</p>
            <ul>
              {SERVICE_AREAS.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <p className="services-page-view__areas-more">And more!</p>
          </div>
        </div>
      </section>
    </section>
  );
}

function ReviewsPage({ onGoHome, onOpenBooking }) {
  return (
    <section className="reviews-page-view" aria-labelledby="reviews-page-title">
      <div className="reviews-page-view__back-row">
        <button type="button" className="services-page-view__back" onClick={onGoHome}>
          <svg className="services-page-view__back-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 6L6 12L12 18" />
            <path d="M6 12H19" />
          </svg>
          <span>Back</span>
        </button>
      </div>
      <div className="reviews-page-view__top">
        <div className="reviews-page-view__intro-block">
          <p className="services-page-view__eyebrow">Customer Reviews</p>
          <h1 id="reviews-page-title" className="services-page-view__title">
            What our customers are saying
          </h1>
          <p className="services-page-view__intro">
            Trusted feedback from local drivers who rely on Surgical Auto Repair for honest, high-quality service.
          </p>
        </div>
        <div className="reviews-page-view__meta-card">
          <p className="reviews-page-view__score" aria-label="4.8 out of 5 stars from over 363 reviews">
            <strong>{"★★★★★ 4.8/5"}</strong>
            <span>363+ verified reviews</span>
          </p>
          <div className="reviews-page-view__actions">
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer" className="reviews-list__cta">
              Leave a Google Review
            </a>
          </div>
        </div>
      </div>
      <div className="reviews-page-view__grid" aria-label="All customer reviews">
        {CUSTOMER_REVIEWS.map((review) => (
          <article key={`${review.name}-${review.date}-full`} className="reviews-page-view__card">
            <div className="review-item__top">
              <strong>{review.name}</strong>
              <span>{review.date}</span>
            </div>
            <p className="review-item__rating" aria-label="5 out of 5 stars">
              {"★★★★★"}
            </p>
            <p className="review-item__quote">"{review.quote}"</p>
          </article>
        ))}
      </div>
      <div className="reviews-page-view__book-row">
        <button type="button" className="marketing-card__cta marketing-card__cta--dark" onClick={onOpenBooking}>
          Book Appointment
        </button>
      </div>
    </section>
  );
}

function AboutPage({ onGoHome, onOpenBooking }) {
  return (
    <section className="services-page-view about-page-view" aria-labelledby="about-page-title">
      <button type="button" className="services-page-view__back" onClick={onGoHome}>
        <svg className="services-page-view__back-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6L6 12L12 18" />
          <path d="M6 12H19" />
        </svg>
        <span>Back</span>
      </button>

      <div className="about-page-view__hero">
        <img
          src="/images/sa-family.webp"
          alt="Surgical Auto Repair family"
          className="about-page-view__hero-img"
        />
        <div className="about-page-view__hero-overlay">
          <p className="about-page-view__hero-eyebrow">About Us</p>
          <h1 id="about-page-title" className="about-page-view__hero-title">
            Surgical precision. Honest service. Mount Vernon&apos;s trusted shop since 1995.
          </h1>
        </div>
      </div>

      <section className="services-page-view__details about-page-view__values" aria-label="Why choose us">
        <p className="services-page-view__eyebrow">Why Choose Us</p>
        <h2 className="services-page-view__details-title">A shop built on trust and quality workmanship</h2>
        <div className="services-page-view__details-grid about-page-view__values-grid">
          {ABOUT_VALUES.map((value) => (
            <article key={value.title} className="services-page-view__detail-card">
              <div className="services-page-view__detail-head">
                <h3>{value.title}</h3>
              </div>
              <p className="marketing-card__body">{value.body}</p>
            </article>
          ))}
        </div>
        <hr className="about-page-view__divider" />
        <div className="about-page-view__intro-text">
          <p>
            If you are looking for a local auto repair shop you can trust, consider Surgical Auto
            Repair. Since 1995, we have been providing our friends and neighbors throughout Mount
            Vernon with dependable, trustworthy auto repairs.
          </p>
          <p>
            Looking for an affordable alternative to the high prices at your local dealership?
            Supported by a team of ASE-Certified technicians who receive ongoing training, we offer
            you dealership-quality knowledge and experience — without dealership pricing.
          </p>
        </div>
      </section>

      <section className="services-page-view__local" aria-label="Visit us">
        <div className="services-page-view__local-top">
          <div>
            <p className="services-page-view__eyebrow">Visit Us</p>
            <h2 className="services-page-view__details-title">Call us or book your appointment</h2>
            <p className="services-page-view__intro" style={{ maxWidth: "none" }}>
              {SHOP_ADDRESS}
              <br />
              Mon – Fri: 8 AM – 6 PM · Closed Saturday &amp; Sunday
              <br />
              <a href={SHOP_PHONE_HREF}>{SHOP_PHONE}</a>
            </p>
          </div>
        </div>
        <div className="services-page-view__map-wrap">
          <iframe
            title="Surgical Auto Repair map"
            src={SHOP_MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <div className="reviews-page-view__book-row">
        <button type="button" className="marketing-card__cta marketing-card__cta--dark" onClick={onOpenBooking}>
          Book Appointment
        </button>
      </div>
    </section>
  );
}

function CardsFooter({ className = "", compact = false }) {
  return (
    <section className={`cards-footer ${className}`.trim()} aria-label="Cards footer">
      <div className="cards-footer__row">
        <div className="cards-footer__lead">
          <p className="cards-footer__brand">{SHOP_NAME}</p>
          {!compact && (
            <>
              <p className="cards-footer__body">{SHOP_ADDRESS} • <a href={SHOP_PHONE_HREF}>{SHOP_PHONE}</a></p>
            </>
          )}
        </div>
        <div className="cards-footer__meta">
          <div className="cards-footer__socials" aria-label="Contact links">
            <a href={SHOP_PHONE_HREF} aria-label="Phone" className="social-icon">
              <span className="social-icon__emoji" aria-hidden="true">
                📞
              </span>
              <span className="social-icon__label">Call</span>
            </a>
            <a
              href={SHOP_MAP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Address"
              className="social-icon"
            >
              <span className="social-icon__emoji" aria-hidden="true">
                📍
              </span>
              <span className="social-icon__label">Directions</span>
            </a>
          </div>
          <p className="cards-footer__legal">All rights reserved. 2026.</p>
        </div>
      </div>
    </section>
  );
}


// Live services from the StoreCal API (name, description, duration, price).
// Starts from FALLBACK_SERVICES so cards render immediately and degrade
// gracefully if the API is unreachable.
function useStoreCalServices() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  useEffect(() => {
    let alive = true;
    fetch(`${STORECAL_API_BASE}/api/shop-config?key=${STORECAL_STORE_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d && Array.isArray(d.services) && d.services.length) {
          setServices(d.services);
        }
      })
      .catch(() => {}); // keep the fallback list on any network/parse error
    return () => {
      alive = false;
    };
  }, []);
  return services;
}

// Unified service card used by both the home preview and the services page.
// Clean icon card + duration · price + a Book button that opens the StoreCal
// widget preselected to this service.
function ServiceCard({ service }) {
  const hasMeta = service.durationMin || service.price;
  // The whole card is the control: click (or Enter/Space) opens the StoreCal
  // widget preselected to this service, dropping the visitor on the date/time
  // step (no service-picker step to repeat).
  const book = () => openStoreCal(service.name);
  return (
    <article
      className="v3-card v3-card--service"
      role="button"
      tabIndex={0}
      aria-label={`Book ${service.name}`}
      onClick={book}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          book();
        }
      }}
    >
      <span className="v3-card__icon" aria-hidden="true">{serviceIconFor(service.name)}</span>
      <h3>{service.name}</h3>
      {service.description && <p>{service.description}</p>}
      {hasMeta && (
        <p className="v3-card__meta">
          <span className="v3-card__dur">{service.durationMin ? `${service.durationMin} min` : ""}</span>
          {service.price && <span className="v3-card__price">{service.price}</span>}
        </p>
      )}
      <span className="v3-card__book" aria-hidden="true">
        Book<span className="v3-card__book-arrow">&nbsp;→</span>
      </span>
    </article>
  );
}

function HomeModern({ onOpenBooking, onOpenServicesPage, onOpenReviewsPage, onOpenAboutPage, services }) {
  const featuredServices = (services || FALLBACK_SERVICES).slice(0, 6);

  return (
    <div className="v3">
      <section className="v3-hero">
        <div className="v3-hero__text">
          <p className="v3-pill">📍 Mount Vernon, NY · Family-run since 1995</p>
          <h1 className="v3-hero__title">
            Auto repair you can <span>actually</span> trust.
          </h1>
          <p className="v3-hero__lede">
            Preventative maintenance to major repairs — done right the first time by ASE-certified
            technicians who treat you like a neighbor, not a number.
          </p>
          <div className="v3-hero__cta">
            <button type="button" className="v3-btn v3-btn--primary" onClick={onOpenBooking}>
              Book Appointment
            </button>
            <a href={SHOP_PHONE_HREF} className="v3-btn v3-btn--ghost">📞 {SHOP_PHONE}</a>
          </div>
          <div className="v3-hero__trust">
            <div><strong>4.8★</strong><span>363+ Google reviews</span></div>
            <div className="v3-hero__divider" aria-hidden="true" />
            <div><strong>30+ yrs</strong><span>Serving Westchester</span></div>
          </div>
        </div>
        <div className="v3-hero__media">
          <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/videos/hero-layout3.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <ReviewsTicker reviews={CUSTOMER_REVIEWS} googleRating="4.8/5" onOpenReviewsPage={onOpenReviewsPage} />

      <div className="v3-bar">
        <span><strong>Hours</strong> Mon–Fri 8 AM – 6 PM</span>
        <span><strong>Closed</strong> Sat &amp; Sun</span>
        <span><strong>Find us</strong> {SHOP_ADDRESS}</span>
      </div>

      <section className="v3-section">
        <div className="v3-head">
          <p className="v3-kicker">Our Services</p>
          <h2 className="v3-h2">Everything your car needs, under one roof</h2>
        </div>
        <div className="v3-grid">
          {featuredServices.map((s) => (
            <ServiceCard key={s._id || s.name} service={s} />
          ))}
        </div>
        <div className="v3-center">
          <button type="button" className="v3-btn v3-btn--outline" onClick={() => onOpenServicesPage("link")}>
            View all services
          </button>
        </div>
      </section>

      <section className="v3-feature">
        <div className="v3-feature__media">
          <img src="/images/sa-under-hood.webp" alt="Technician performing major engine repair" />
        </div>
        <div className="v3-feature__body">
          <p className="v3-kicker">Quality Workmanship</p>
          <h2 className="v3-h2">Major repairs, handled with surgical precision.</h2>
          <p className="v3-feature__copy">
            Engine, transmission, brakes, suspension — we focus on long-term fixes, not quick
            patches. Every repair is backed by our 12,000 MI / 12 MO warranty.
          </p>
          <ul className="v3-feature__checks">
            <li>No surprise charges — options explained up front</li>
            <li>Factory-grade diagnostics &amp; tooling</li>
            <li>Repairs that last, guaranteed in writing</li>
          </ul>
          <button type="button" className="v3-btn v3-btn--primary" onClick={onOpenAboutPage}>About the shop</button>
        </div>
      </section>

      <section className="v3-trust">
        <div className="v3-trust__inner">
          <p className="v3-kicker">Why drivers choose us</p>
          <h2 className="v3-h2">A shop built on trust</h2>
          <p className="v3-trust__sub">30 years in Mount Vernon. Honest diagnostics, no upsells, guaranteed work.</p>
          <div className="v3-trust__pillars">
            <div className="v3-trust__pillar">
              <span className="v3-trust__pillar-icon">🛡️</span>
              <h3>No surprise charges</h3>
              <p>We explain every option and price up front — no hidden fees, ever.</p>
            </div>
            <div className="v3-trust__pillar">
              <span className="v3-trust__pillar-icon">✅</span>
              <h3>12k mi / 12 mo warranty</h3>
              <p>Every repair is backed in writing. If it's not right, we make it right.</p>
            </div>
            <div className="v3-trust__pillar">
              <span className="v3-trust__pillar-icon">🎓</span>
              <h3>ASE-certified techs</h3>
              <p>Dealership-grade knowledge and tooling without the dealership pricing.</p>
            </div>
            <div className="v3-trust__pillar">
              <span className="v3-trust__pillar-icon">💳</span>
              <h3>Financing available</h3>
              <p>Acima lease-to-own and CFNA credit — apply in minutes and drive away today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v3-financing" aria-label="Financing options">
        <div className="v3-financing__inner">
          <p className="v3-kicker">Flexible payment options</p>
          <h2 className="v3-h2">Financing available — drive away today.</h2>
          <p className="v3-financing__sub">We offer flexible financing so you can get the repairs you need without the wait. Apply in minutes and get back on the road.</p>
          <div className="v3-financing__cards">
            <div className="v3-financing__card">
              <span className="v3-financing__icon">🔑</span>
              <h3>Acima Lease-to-Own</h3>
              <p>Lease-to-own financing with flexible payment plans. No credit needed — apply in minutes and get approved fast.</p>
            </div>
            <div className="v3-financing__card">
              <span className="v3-financing__icon">💳</span>
              <h3>CFNA Credit Card</h3>
              <p>Backed by Bridgestone — use your CFNA card on tires, auto maintenance, and more. Apply online and get back on the road.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v3-contact">
        <div className="v3-contact__card">
          <h2 className="v3-h2">Find us in Mount Vernon</h2>
          <p className="v3-contact__line">{SHOP_ADDRESS}</p>
          <p className="v3-contact__line"><a href={SHOP_PHONE_HREF}>{SHOP_PHONE}</a></p>
          <p className="v3-contact__line">Mon – Fri: 8 AM – 6 PM · Closed weekends</p>
          <p className="v3-contact__label">Neighborhoods we serve</p>
          <ul className="v3-areas">
            {SERVICE_AREAS.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <button type="button" className="v3-btn v3-btn--primary" onClick={onOpenBooking}>
            Book Appointment
          </button>
        </div>
        <div className="v3-contact__map">
          <iframe
            title="Surgical Auto Repair map"
            src={SHOP_MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <CardsFooter className="cards-footer--v3" />
    </div>
  );
}

export default function App() {
  const appRef = useRef(null);
  const servicesEntrySourceRef = useRef(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalKey, setBookingModalKey] = useState(0);
  const [enableServicesMobileDetailsPreview, setEnableServicesMobileDetailsPreview] = useState(false);
  const [activePage, setActivePage] = useState(
    typeof window !== "undefined" ? getActivePageFromHash(window.location.hash) : "home"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeLayout = 3;
  const services = useStoreCalServices();

  // All "Book Appointment" CTAs across the site route through here. Booking is
  // handled by the StoreCal widget (embed.js in index.html); the buttons keep
  // their original native styling.
  const openBookingModal = () => {
    openStoreCal();
  };
  const closeBookingModal = () => setIsBookingModalOpen(false);
  useEffect(() => {
    resetScrollToTop();
    requestAnimationFrame(resetScrollToTop);
  }, [activePage]);

  // Close mobile menu whenever page changes
  useEffect(() => { setMobileMenuOpen(false); }, [activePage]);

  const openServicesPage = (source = "link") => {
    servicesEntrySourceRef.current = source;
    setEnableServicesMobileDetailsPreview(source === "nav");
    window.location.hash = "services";
    setActivePage("services");
  };
  const openReviewsPage = () => {
    window.location.hash = "reviews";
    setActivePage("reviews");
  };
  const openHomePage = () => {
    window.location.hash = "";
    setActivePage("home");
  };
  const openAboutPage = () => {
    window.location.hash = "about";
    setActivePage("about");
  };

  useEffect(() => {
    const onHashChange = () => {
      const page = getActivePageFromHash(window.location.hash);
      setActivePage(page);
      if (page === "services") {
        const source = servicesEntrySourceRef.current;
        setEnableServicesMobileDetailsPreview(source === "nav");
      } else {
        setEnableServicesMobileDetailsPreview(false);
      }
      servicesEntrySourceRef.current = null;
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!appRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".site-header",
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" }
      );
    }, appRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!appRef.current) return;

    const ctx = gsap.context(() => {

      if (activePage === "services") {
        gsap.fromTo(
          ".services-page-view:not(.about-page-view)",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".services-page-view:not(.about-page-view) .services-page-view__back",
          { x: -10, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.85, delay: 0.26, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".services-page-view__top, .services-page-view__details > .services-page-view__eyebrow, .services-page-view__details-title",
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, delay: 0.3, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".services-page-view__detail-card",
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.82,
            delay: 0.36,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
        gsap.fromTo(
          ".services-page-view__book-section",
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.62, ease: "power3.out", clearProps: "transform,opacity" }
        );
        return;
      }

      if (activePage === "reviews") {
        gsap.fromTo(
          ".reviews-page-view",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".reviews-page-view .services-page-view__back",
          { x: -10, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.85, delay: 0.26, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".reviews-page-view__intro-block, .reviews-page-view__meta-card",
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, delay: 0.3, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".reviews-page-view__card",
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.82,
            delay: 0.36,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
        return;
      }

      if (activePage === "about") {
        gsap.fromTo(
          ".about-page-view",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".about-page-view .services-page-view__back",
          { x: -10, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.85, delay: 0.26, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".about-page-view__hero",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.95, delay: 0.34, ease: "power3.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(
          ".about-page-view__values, .about-page-view__intro-text",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.5, stagger: 0.15, ease: "power3.out", clearProps: "transform,opacity" }
        );
        return;
      }

      gsap.fromTo(
        ".panel--primary, .hours-preview--desktop, .cards-footer--desktop",
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );

      const rightColumnCards = gsap.utils.toArray(".scroll-column .card-slot");
      rightColumnCards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      gsap.fromTo(
        ".cards-footer--mobile",
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.35,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );
    }, appRef);

    return () => ctx.revert();
  }, [activePage]);

  return (
    <div ref={appRef}>
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      <header className="site-header">
        {/* ── Top info bar ── */}
        <div className="header-info">
          <div className="header-info__inner">
            <a href="#" className="logo" onClick={(e) => { e.preventDefault(); openHomePage(); setMobileMenuOpen(false); }}>
              <img src="/images/surgical-logo.webp" alt="Surgical Auto Repair logo" className="logo__img" />
            </a>
            <div className="header-info__details">
              <a href={SHOP_PHONE_HREF} className="header-info__item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01L6.62 10.79z"/></svg>
                {SHOP_PHONE}
              </a>
              <a href={SHOP_MAP_URL} target="_blank" rel="noreferrer" className="header-info__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                40 N MacQuesten Pkwy, Mount Vernon, NY
              </a>
              <span className="header-info__item header-info__item--hours">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
                Mon – Fri &nbsp;8:00 AM – 6:00 PM
              </span>
            </div>
            <button type="button" className="header-cta" onClick={openBookingModal}>
              Book Appointment
            </button>
            <button
              type="button"
              className="hamburger-btn"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Red nav bar ── */}
        <nav className="header-nav" aria-label="Main navigation">
          <div className="header-nav__inner">
            <div className="header-nav__links">
              <a href="#" className={`header-nav__link${activePage === "home" ? " header-nav__link--active" : ""}`} onClick={(e) => { e.preventDefault(); openHomePage(); }}>Home</a>
              <a href="#services" className={`header-nav__link${activePage === "services" ? " header-nav__link--active" : ""}`} onClick={(e) => { e.preventDefault(); openServicesPage("nav"); }}>Services</a>
              <a href="#reviews" className={`header-nav__link${activePage === "reviews" ? " header-nav__link--active" : ""}`} onClick={(e) => { e.preventDefault(); openReviewsPage(); }}>Reviews</a>
              <a href="#about" className={`header-nav__link${activePage === "about" ? " header-nav__link--active" : ""}`} onClick={(e) => { e.preventDefault(); openAboutPage(); }}>About</a>
            </div>
            <div className="header-nav__socials">
              <a href="https://www.surecritic.com/reviews/surgical-auto-repair" target="_blank" rel="noreferrer" className="header-nav__social" aria-label="SureCritic Reviews">
                <svg width="18" height="20" viewBox="0 0 89 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="44.4341" cy="17.0059" r="11.9152" fill="currentColor"/>
                  <path d="M38.2799 52.7509C33.2342 45.2272 25.0832 32.9875 22.7041 29.1099C22.2617 28.3888 22.2568 27.5222 22.7062 26.8054C23.2363 25.9598 24.0304 24.8636 24.8792 24.294C25.8246 23.6595 27.3101 23.3614 28.4081 23.2225C29.3063 23.1088 30.1742 23.5042 30.761 24.1936L44.5338 40.375C48.3626 36.688 53.1786 29.0555 60.4447 23.7835C69.432 17.2625 84.0982 12.5522 86.5657 12.5522C87.5155 12.5522 88.0963 12.9069 88.437 13.3602C89.0314 14.1512 88.3507 15.1398 87.5164 15.6719C74.3609 24.0619 53.432 47.1833 52.8282 47.6941C52.5236 47.9519 51.6249 49.3714 50.9329 50.6551C50.3235 51.7858 49.2153 52.7523 47.9473 52.957L41.2467 54.0387C40.0905 54.2254 38.9322 53.7236 38.2799 52.7509Z" fill="currentColor"/>
                  <path opacity="0.55" d="M50.5883 58.2169C55.634 65.7406 63.785 77.9803 66.164 81.8579C66.6065 82.579 66.6114 83.4455 66.162 84.1624C65.6319 85.0079 64.8377 86.1042 63.9889 86.6738C63.0435 87.3082 61.558 87.6063 60.46 87.7453C59.5619 87.859 58.694 87.4636 58.1072 86.7742L44.3343 70.5928C40.5055 74.2798 35.6896 81.9122 28.4235 87.1843C19.4361 93.7053 4.76994 98.4155 2.30248 98.4155C1.35262 98.4155 0.77182 98.0609 0.431168 97.6076C-0.163277 96.8166 0.517464 95.828 1.35172 95.2959C14.5073 86.9059 35.4362 63.7845 36.04 63.2736C36.3446 63.0159 37.2433 61.5964 37.9352 60.3127C38.5447 59.182 39.6529 58.2154 40.9209 58.0107L47.6215 56.929C48.7777 56.7424 49.936 57.2442 50.5883 58.2169Z" fill="currentColor"/>
                  <path opacity="0.55" d="M71.6678 0C77.1904 0.000264141 81.6678 4.47737 81.6678 10V10.21L72.6678 14.707V10C72.6678 9.44793 72.2199 9.00026 71.6678 9H56.2821C53.9971 4.80412 49.5484 1.95619 44.4344 1.95605C39.3203 1.95605 34.8709 4.80397 32.5858 9H14.8719C14.3199 9.0002 13.872 9.44789 13.8719 10V66.7959C13.8724 67.3477 14.3201 67.7957 14.8719 67.7959H26.6268L17.4735 76.7959H14.8719L14.3573 76.7822C9.07408 76.5142 4.8724 72.1456 4.87195 66.7959V10C4.87201 4.47733 9.34931 0.000198173 14.8719 0H71.6678ZM81.6678 66.7959C81.6674 72.3182 77.1902 76.7947 71.6678 76.7949L71.6669 76.7959H67.8241L61.1132 67.7959H71.6678C72.2196 67.7956 72.6674 67.3476 72.6678 66.7959V31.0244L81.6678 23.5605V66.7959Z" fill="currentColor"/>
                </svg>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="header-nav__social" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg>
              </a>
            </div>
          </div>
        </nav>

        {/* ── Mobile dropdown ── */}
        {mobileMenuOpen && (
          <div className="mobile-nav" role="menu">
            <a href="#" className="mobile-nav__link" role="menuitem" onClick={(e) => { e.preventDefault(); openHomePage(); setMobileMenuOpen(false); }}>Home</a>
            <a href="#services" className="mobile-nav__link" role="menuitem" onClick={(e) => { e.preventDefault(); openServicesPage("nav"); setMobileMenuOpen(false); }}>Services</a>
            <a href="#reviews" className="mobile-nav__link" role="menuitem" onClick={(e) => { e.preventDefault(); openReviewsPage(); setMobileMenuOpen(false); }}>Reviews</a>
            <a href="#about" className="mobile-nav__link" role="menuitem" onClick={(e) => { e.preventDefault(); openAboutPage(); setMobileMenuOpen(false); }}>About</a>
            <a href={SHOP_PHONE_HREF} className="mobile-nav__link">{SHOP_PHONE}</a>
          </div>
        )}
      </header>
      {activePage === "services" ? (
        <main className="subpage-wrap home-theme--v3">
          <ServicesPage
            onGoHome={openHomePage}
            onOpenBooking={openBookingModal}
            onOpenReviewsPage={openReviewsPage}
            services={services}
          />
        </main>
      ) : activePage === "reviews" ? (
        <main className="subpage-wrap home-theme--v3">
          <ReviewsPage onGoHome={openHomePage} onOpenBooking={openBookingModal} />
        </main>
      ) : activePage === "about" ? (
        <main className="subpage-wrap home-theme--v3">
          <AboutPage onGoHome={openHomePage} onOpenBooking={openBookingModal} />
        </main>
      ) : (
        <main className="layout layout--full">
          <HomeModern
            onOpenBooking={openBookingModal}
            onOpenServicesPage={openServicesPage}
            onOpenReviewsPage={openReviewsPage}
            onOpenAboutPage={openAboutPage}
            services={services}
          />
        </main>
      )}
      <BookingModal isOpen={isBookingModalOpen} onClose={closeBookingModal} wizardKey={bookingModalKey} />
      <ChatWidget bookingModalOpen={isBookingModalOpen} />
    </div>
  );
}
