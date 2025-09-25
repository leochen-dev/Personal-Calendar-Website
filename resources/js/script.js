const events = [];
let editingEventIndex = null; // null = creating new, number = editing existing

function updateLocationOptions(modality) {
  const locationField = document.getElementById("location_field");
  const remoteField = document.getElementById("remote_url_field");

  if (modality === "in-person") {
    locationField.classList.remove("d-none");
    remoteField.classList.add("d-none");
    document.getElementById("event_location").setAttribute("required", "true");
    document.getElementById("event_remote_url").removeAttribute("required");
  } else if (modality === "remote") {
    remoteField.classList.remove("d-none");
    locationField.classList.add("d-none");
    document.getElementById("event_remote_url").setAttribute("required", "true");
    document.getElementById("event_location").removeAttribute("required");
  }
}

function saveEvent() {
  const form = document.getElementById("event_form");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = document.getElementById("event_name").value.trim();
  const category = document.getElementById("event_category").value;
  const weekday = document.getElementById("event_weekday").value;
  const time = document.getElementById("event_time").value;
  const modality = document.getElementById("event_modality").value;

  let location = null;
  let remote_url = null;
  if (modality === "in-person") location = document.getElementById("event_location").value.trim();
  else remote_url = document.getElementById("event_remote_url").value.trim();

  const attendees = document.getElementById("event_attendees").value.split(",")
    .map(a => a.trim())
    .filter(a => a.length > 0);

  const eventDetails = { name, category, weekday, time, modality, location, remote_url, attendees };

  if (editingEventIndex !== null) {
    // Update existing
    events[editingEventIndex] = eventDetails;
    refreshCalendarUI();
  } else {
    // Create new
    events.push(eventDetails);
    addEventToCalendarUI(eventDetails, events.length - 1);
  }

  // Reset
  editingEventIndex = null;
  const modal = bootstrap.Modal.getInstance(document.getElementById('event_modal'));
  form.reset();
  modal.hide();
  updateLocationOptions("in-person");
}

function createEventCard(eventDetails, index) {
  const event_element = document.createElement('div');
  event_element.className = 'card p-2 m-1 shadow-sm cursor-pointer';

  let bgColor;
  switch (eventDetails.category) {
    case 'work': bgColor = 'bg-info'; break;
    case 'academics': bgColor = 'bg-danger'; break;
    case 'personal': bgColor = 'bg-success'; break;
    case 'appointments': bgColor = 'bg-warning'; break;
    default: bgColor = 'bg-secondary'; break;
  }
  event_element.classList.add(bgColor, 'text-white');

  event_element.innerHTML = `
    <div><strong>Event Name:</strong> ${eventDetails.name}</div>
    <div><strong>Event Category:</strong> ${eventDetails.category.charAt(0).toUpperCase() + eventDetails.category.slice(1)}</div>
    <div><strong>Event Time:</strong> ${eventDetails.time}</div>
    <div><strong>Event Modality:</strong> ${eventDetails.modality === 'in-person' ? 'In-Person' : 'Remote'}</div>
    <div><strong>Event Location:</strong> ${
      eventDetails.modality === 'in-person'
        ? eventDetails.location
        : eventDetails.remote_url
    }</div>
    <div><strong>Attendees:</strong> ${eventDetails.attendees.join(', ')}</div>
  `;

  // Add click listener for editing
  event_element.addEventListener("click", () => {
    openEditModal(index);
  });

  return event_element;
}

function addEventToCalendarUI(eventInfo, index) {
  const event_card = createEventCard(eventInfo, index);
  const dayDiv = document.getElementById(eventInfo.weekday);
  dayDiv.appendChild(event_card);
}

function refreshCalendarUI() {
  // Clear all day columns
  document.querySelectorAll("#calendar .col-sm").forEach(col => {
    col.querySelectorAll(".card").forEach(card => card.remove());
  });

  // Re-render all events
  events.forEach((event, index) => {
    addEventToCalendarUI(event, index);
  });
}

function openEditModal(index) {
  const event = events[index];
  editingEventIndex = index;

  document.getElementById("event_name").value = event.name;
  document.getElementById("event_category").value = event.category;
  document.getElementById("event_weekday").value = event.weekday;
  document.getElementById("event_time").value = event.time;
  document.getElementById("event_modality").value = event.modality;
  updateLocationOptions(event.modality);

  if (event.modality === "in-person") {
    document.getElementById("event_location").value = event.location || "";
  } else {
    document.getElementById("event_remote_url").value = event.remote_url || "";
  }

  document.getElementById("event_attendees").value = event.attendees.join(", ");

  const modal = new bootstrap.Modal(document.getElementById("event_modal"));
  modal.show();
}
