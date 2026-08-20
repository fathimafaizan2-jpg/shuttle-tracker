// GLOBAL CONFIGURATION, STATE & MULTILINGUAL DICTIONARY
const state = {
  role: "PLAYER",
  page: "home",
  attendance: "COMING",
  lang: localStorage.getItem("indianClubLanguage") || "en",
  currentUser: null,
  activeFlightLevel: "Flight 1",
  sessionAutoLocked: false
};

const flights = ["Premier", "Flight 1", "Flight 2", "Flight 3", "Flight 4A", "Flight 4B"];

const translations = {
  en: { home: "Home", timetable: "My Timetable", attendance: "Attendance", wallet: "Wallet & Payments", profile: "Update Credentials" },
  ml: { home: "ഹോം", timetable: "എന്റെ ടൈംടേബിൾ", attendance: "ഹാജർ", wallet: "വാലറ്റ് & പേയ്മെന്റ്സ്", profile: "ക്രെഡൻഷ്യൽസ് പുതുക്കുക" },
  hi: { home: "होम", timetable: "मेरा टाइमटेबल", attendance: "उपस्थिति", wallet: "वॉलेट और भुगतान", profile: "क्रेडेंशियल अपडेट" },
  ta: { home: "முகப்பு", timetable: "அட்டவணை", attendance: "வருகை", wallet: "வாலட் & கட்டணங்கள்", profile: "சுயவிவரம்" }
};

function applyLanguage(language) {
  const t = translations[language] || translations.en;
  document.querySelectorAll(".nav[data-page]").forEach(button => {
    if (t[button.dataset.page]) button.textContent = t[button.dataset.page];
  });
  localStorage.setItem("indianClubLanguage", language);
}
