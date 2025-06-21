const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startHour = 9;
const endHour = 20; // 9 AM to 8 PM
let eventCount = 0;
let currentWeekStart = new Date(); // Start from today

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// Set to the start of the week (Saturday)
const dayOfWeek = currentWeekStart.getDay();
const daysSinceSaturday = (dayOfWeek + 1) % 7;
currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceSaturday);

const calendar = document.getElementById('calendar');

generateCalendar();
loadEvents();

function getWeekKey(dateObj) {
  const d = new Date(dateObj);
  const dayOfWeek = d.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  d.setDate(d.getDate() - daysSinceSaturday);
  return d.toISOString().split('T')[0];
}

function getDayKey(dateObj) {
  // Returns a string like "calendarEvents-2024-06-21"
  const d = new Date(dateObj);
  const yyyy_mm_dd = d.toISOString().split('T')[0];
  return `calendarEvents-${yyyy_mm_dd}`;
}

function getAllEventsStorage() {
  return JSON.parse(localStorage.getItem('calendarEvents') || '{}');
}

function generateCalendar() {
  calendar.innerHTML = '';

  // Empty top-left cell
  calendar.appendChild(document.createElement('div'));

  // Day headers
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = `${days[d]} ${date.getDate()}`;
    calendar.appendChild(dayHeader);
  }

  // Time slots
  for (let h = startHour; h <= endHour; h++) {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';

    const period = h < 12 ? 'AM' : 'PM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    timeCell.textContent = `${formattedHour}:00 ${period}`;
    calendar.appendChild(timeCell);

    for (let d = 0; d < 7; d++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = `slot-${d}-${h}`;
      slot.addEventListener('click', function(e) {
        if (e.target === this) {
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + d);
          const dateString = date.toISOString().split('T')[0];

          const eventText = prompt('Enter event:');
          if (eventText) {
            const color = getRandomColor();
            const eventId = `event-${eventCount++}`;
            addEventToSlot(slot.id, eventText, color, eventId, dateString, false);
          }
        }
      });
      calendar.appendChild(slot);
    }
  }

  // Re-attach drag/drop listeners for new slots
  document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragover', function(e) {
      e.preventDefault();
    });

    slot.addEventListener('drop', function(e) {
      e.preventDefault();
      const eventId = e.dataTransfer.getData('text/plain');
      const event = document.getElementById(eventId);
      if (event) {
        this.appendChild(event);
        saveEvents();
      }
    });
  });
}

function addEventToSlot(slotId, text, color, id, date, completed) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  // Prevent duplicate
  if (document.getElementById(id)) return;

  const event = document.createElement('div');
  event.className = 'event';
  event.id = id;
  event.style.backgroundColor = color;
  event.draggable = true;
  if (completed) {
    event.style.opacity = '0.6';
    event.style.textDecoration = 'line-through';
  }

  const eventText = document.createElement('div');
  eventText.className = 'event-text';
  eventText.textContent = text;
  eventText.contentEditable = true;
  eventText.addEventListener('blur', saveEvents);

  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'event-btn-wrapper';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.innerHTML = completed ? '✓' : '○';
  toggleBtn.title = 'Toggle Complete';
  toggleBtn.addEventListener('click', function() {
    event.style.opacity = event.style.opacity === '0.6' ? '1' : '0.6';
    event.style.textDecoration = event.style.textDecoration === 'line-through' ? 'none' : 'line-through';
    toggleBtn.innerHTML = toggleBtn.innerHTML === '✓' ? '○' : '✓';
    saveEvents();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', function() {
    event.remove();
    saveEvents();
  });

  event.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', event.id);
    setTimeout(() => event.style.display = 'none', 0);
  });

  event.addEventListener('dragend', function() {
    event.style.display = 'flex';
  });

  btnWrapper.appendChild(toggleBtn);
  btnWrapper.appendChild(deleteBtn);
  event.appendChild(eventText);
  event.appendChild(btnWrapper);
  slot.appendChild(event);

  saveEvents();
}

function saveEvents() {
  // Clear all day keys for this week first
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    localStorage.removeItem(getDayKey(date));
  }

  // Gather and store events per day
  const eventsByDay = {};
  document.querySelectorAll('.event').forEach(event => {
    const slot = event.parentElement;
    if (slot && slot.id) {
      const dayHour = slot.id.split('-');
      const day = parseInt(dayHour[1]);
      const hour = parseInt(dayHour[2]);
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + day);
      const dateString = date.toISOString().split('T')[0];
      const key = getDayKey(date);

      if (!eventsByDay[key]) eventsByDay[key] = [];
      eventsByDay[key].push({
        id: event.id,
        slotId: slot.id,
        text: event.querySelector('.event-text').textContent,
        color: event.style.backgroundColor, // <-- color is saved here
        date: dateString,
        hour,
        completed: event.style.textDecoration === 'line-through'
      });
    }
  });

  // Save each day's events
  Object.keys(eventsByDay).forEach(key => {
    localStorage.setItem(key, JSON.stringify(eventsByDay[key]));
  });
}

function loadEvents() {
  // For each day in the week, load its events
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    const key = getDayKey(date);
    const dayEvents = JSON.parse(localStorage.getItem(key) || '[]');
    dayEvents.forEach(event => {
      addEventToSlot(event.slotId, event.text, event.color, event.id, event.date, event.completed);
    });
  }
}

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20);
  const lightness = 60 + Math.floor(Math.random() * 25);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function previousWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  generateCalendar();
  loadEvents();
}

function nextWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  generateCalendar();
  loadEvents();
}

function snapToToday() {
  currentWeekStart = new Date();
  const dayOfWeek = currentWeekStart.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceSaturday);
  generateCalendar();
  loadEvents();
}