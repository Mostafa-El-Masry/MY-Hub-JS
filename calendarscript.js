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

// Get the calendar element
const calendar = document.getElementById('calendar');

// Initialize the calendar
generateCalendar();
loadEvents();

function generateCalendar() {
  // Clear the calendar
  calendar.innerHTML = '';

  // Add empty cell in the top-left corner
  calendar.appendChild(document.createElement('div'));

  // Add day headers
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = `${days[d]} ${date.getDate()}`;
    calendar.appendChild(dayHeader);
  }

  // Add time slots
  for (let h = startHour; h <= endHour; h++) {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';

    // Add AM/PM to the time
    const period = h < 12 ? 'AM' : 'PM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    timeCell.textContent = `${formattedHour}:00 ${period}`;
    calendar.appendChild(timeCell);

    for (let d = 0; d < 7; d++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = `slot-${d}-${h}`;
      
      // Add click event to create new events
      slot.addEventListener('click', function(e) {
        if (e.target === this) { // Only if clicking on the slot itself, not an event
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
}

function addEventToSlot(slotId, text, color, id, date, completed) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  const event = document.createElement('div');
  event.className = 'event';
  event.id = id;
  event.style.backgroundColor = color;
  event.draggable = true;
  if (completed) {
    event.style.opacity = '0.6';
    event.style.textDecoration = 'line-through';
  }

  // Event text
  const eventText = document.createElement('div');
  eventText.className = 'event-text';
  eventText.textContent = text;
  eventText.contentEditable = true;
  eventText.addEventListener('blur', saveEvents);

  // Buttons container
  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'event-btn-wrapper';

  // Toggle complete button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.innerHTML = completed ? '✓' : '○';
  toggleBtn.title = 'Toggle Complete';
  toggleBtn.addEventListener('click', function() {
    event.style.opacity = event.style.opacity === '0.6' ? '1' : '0.6';
    event.style.textDecoration = event.style.textDecoration === 'line-through' ? 'none' : 'line-through';
    event.style.backgroundColor = event.style.backgroundColor === '#28a745' ? 'none' : '#28a745 '; // Green for completed
    toggleBtn.innerHTML = toggleBtn.innerHTML === '✓' ? '○' : '✓';
    saveEvents();
  });

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', function() {
    event.remove();
    saveEvents();
  });

  // Drag and drop functionality
  event.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', event.id);
    setTimeout(() => event.style.display = 'none', 0);
  });

  event.addEventListener('dragend', function() {
    event.style.display = 'flex';
  });

  // Append elements
  btnWrapper.appendChild(toggleBtn);
  btnWrapper.appendChild(deleteBtn);
  event.appendChild(eventText);
  event.appendChild(btnWrapper);
  slot.appendChild(event);

  // Save the event
  saveEvents();
}

// Make slots droppable
document.addEventListener('DOMContentLoaded', function() {
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
});

function saveEvents() {
  const events = [];
  document.querySelectorAll('.event').forEach(event => {
    const slot = event.parentElement;
    if (slot && slot.id) {
      const dayHour = slot.id.split('-');
      const day = parseInt(dayHour[1]);
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + day);
      const dateString = date.toISOString().split('T')[0];
      
      events.push({
        id: event.id,
        slotId: slot.id,
        text: event.querySelector('.event-text').textContent,
        color: event.style.backgroundColor,
        date: dateString,
        completed: event.style.textDecoration === 'line-through'
      });
    }
  });
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function loadEvents() {
  const savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  // Get all dates for the current week
  const weekDates = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  savedEvents.forEach(event => {
    if (weekDates.includes(event.date)) {
      addEventToSlot(event.slotId, event.text, event.color, event.id, event.date, event.completed);
    }
  });
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