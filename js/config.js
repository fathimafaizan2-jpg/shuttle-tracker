// GLOBAL DATA, STATE & MULTI-LANGUAGE DICTIONARY
const state = {
  role: "PLAYER",
  page: "home",
  attendance: "COMING",
  lang: "EN",
  currentUser: JSON.parse(localStorage.getItem('shuttle_user')) || null,
  activeFlightLevel: "Flight 4A"
};

const flights = ["Premier", "Flight 1", "Flight 2", "Flight 3", "Flight 4A", "Flight 4B"];

let flightInventories = JSON.parse(localStorage.getItem('shuttle_flight_inventories')) || {
  "Premier": { tubePacks: 4, tubePrice: 7.000, corksUsed: 8 },
  "Flight 1": { tubePacks: 3, tubePrice: 6.500, corksUsed: 5 },
  "Flight 2": { tubePacks: 3, tubePrice: 6.000, corksUsed: 4 },
  "Flight 3": { tubePacks: 2, tubePrice: 6.000, corksUsed: 3 },
  "Flight 4A": { tubePacks: 2, tubePrice: 6.000, corksUsed: 2 },
  "Flight 4B": { tubePacks: 2, tubePrice: 6.000, corksUsed: 10 }
};

let schedule = JSON.parse(localStorage.getItem('shuttle_schedule')) || [
  ["Saturday",  "Flight 2", "Flight 1", "Premier",  "Premier"],
  ["Sunday",    "Flight 4A", "Flight 4B", "Flight 3", "Flight 3"],
  ["Monday",    "Flight 1", "Flight 2", "Premier",  "Premier"],
  ["Tuesday",   "Flight 3", "Flight 3", "Flight 4A", "Flight 4B"],
  ["Wednesday", "Premier", "Premier", "Flight 2", "Flight 1"],
  ["Thursday",  "Flight 4A", "Flight 4B", "Flight 3", "Flight 3"]
];

const translations = {
  EN: {
    title: "Shuttle Tracker",
    subTitle: "Indian Club Badminton Section",
    home: "Home",
    timetable: "My Timetable",
    attendance: "Attendance",
    wallet: "Wallet & Payments",
    history: "My History",
    ihavepaid: "I Have Paid",
    autolocked: "Auto-Locked",
    exportCsv: "Export CSV",
    exportPdf: "Print / PDF"
  },
  ML: {
    title: "ഷട്ടിൽ ട്രാക്കർ",
    subTitle: "ഇന്ത്യൻ ക്ലബ് ബാഡ്മിന്റൺ വിഭാഗം",
    home: "ഹോം",
    timetable: "ടൈംടേബിൾ",
    attendance: "ഹാജർ",
    wallet: "വാലറ്റ് & പേയ്‌മെന്റുകൾ",
    history: "ചരിത്രം",
    ihavepaid: "ഞാൻ പണം നൽകി",
    autolocked: "ഓട്ടോ-ലോക്ക് ചെയ്തു",
    exportCsv: "എക്‌സ്‌പോർട്ട് CSV",
    exportPdf: "പ്രിന്റ് / PDF"
  },
  HI: {
    title: "शटल ट्रैकर",
    subTitle: "इंडियन क्लब बैडमिंटन सेक्शन",
    home: "होम",
    timetable: "समय सारणी",
    attendance: "उपस्थिति",
    wallet: "वॉलेट और भुगतान",
    history: "इतिहास",
    ihavepaid: "मैंने भुगतान किया है",
    autolocked: "ऑटो-लॉक",
    exportCsv: "निर्यात CSV",
    exportPdf: "प्रिंट / PDF"
  },
  TA: {
    title: "ஷட்டில் ట్రాக்கர்",
    subTitle: "இந்தியன் கிளப் பேட்மிண்டன் பிரிவு",
    home: "முகப்பு",
    timetable: "அட்டவணை",
    attendance: "வருகை",
    wallet: "வாலட் & கட்டணங்கள்",
    history: "வரலாறு",
    ihavepaid: "நான் பணம் செலுத்திவிட்டேன்",
    autolocked: "தானியங்கி பூட்டு",
    exportCsv: "ஏற்றுமதி CSV",
    exportPdf: "அச்சிடு / PDF"
  }
};
