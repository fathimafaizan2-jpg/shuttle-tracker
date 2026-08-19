// MODULE C: SCHEDULE & WEEKLY TIMETABLE MATRIX
let weeklyTimetables = JSON.parse(localStorage.getItem('shuttle_timetables')) || {
  "Level 4A": { "Sunday": "8:00 PM - 10:00 PM", "Tuesday": "8:00 PM - 10:00 PM", "Friday": "6:00 PM - 9:00 PM" }
};

function renderTimetableCarousel() {
  const container = document.getElementById('timetableCarousel');
  if (!container) return;
  container.innerHTML = '';

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const sched = weeklyTimetables[activeFlightLevel] || {};

  days.forEach(day => {
    const hasSlot = sched[day];
    container.innerHTML += `
      <div class="day-card ${hasSlot ? 'active-slot' : ''}">
        <div class="day-name">${day}</div>
        <div class="time-badge">${hasSlot || 'No Match'}</div>
      </div>
    `;
  });
}

function saveWeeklyScheduleSlot() {
  if (!isAdmin) return;
  const day = document.getElementById('scheduleDayInput').value;
  const timeStr = document.getElementById('scheduleTimeInput').value.trim();

  if (!weeklyTimetables[activeFlightLevel]) weeklyTimetables[activeFlightLevel] = {};
  if (timeStr === "") delete weeklyTimetables[activeFlightLevel][day];
  else weeklyTimetables[activeFlightLevel][day] = timeStr;

  localStorage.setItem('shuttle_timetables', JSON.stringify(weeklyTimetables));
  renderTimetableCarousel();
  alert(`Updated ${day} schedule slot for ${activeFlightLevel}!`);
}
