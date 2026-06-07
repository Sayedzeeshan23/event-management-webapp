// ---------- INITIAL PREDEFINED EVENTS (array of objects) ----------
let events = [
    {
        id: "evt_1",
        name: "Startup Networking Night",
        date: "2026-06-20",
        description: "Connect with founders, investors and innovators in the tech ecosystem."
    },
    {
        id: "evt_2",
        name: "Music & Arts Festival",
        date: "2026-07-05",
        description: "Outdoor concert + local artists showcase, food trucks & fun."
    },
    {
        id: "evt_3",
        name: "AI & Future Conference",
        date: "2025-12-10",
        description: "Deep dive into generative AI, LLMs and real-world applications."
    },
    {
        id: "evt_4",
        name: "Wedding Expo 2026",
        date: "2026-04-18",
        description: "Latest trends, decor, catering and planning workshops."
    }
];

// Helper: generate short unique id for new events
function generateId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// Function to sort events by date (ascending)
function sortEventsByDate(eventArray) {
    return [...eventArray].sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Filter events by search query
let currentSearchQuery = "";

function filterEventsBySearch(eventsArray, query) {
    if (!query.trim()) return eventsArray;
    const lowerQuery = query.trim().toLowerCase();
    return eventsArray.filter(event => 
        event.name.toLowerCase().includes(lowerQuery) || 
        event.date.includes(lowerQuery)
    );
}

// Render events: apply sorting, search filter, and highlight past events
function renderEvents() {
    let sorted = sortEventsByDate(events);
    let filtered = filterEventsBySearch(sorted, currentSearchQuery);
    
    const container = document.getElementById('eventsContainer');
    const countSpan = document.getElementById('eventCountDisplay');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-events">✨ No events match your search. Add a new event! ✨</div>`;
        countSpan.innerText = `0 events`;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cardsHtml = "";
    for (let ev of filtered) {
        const eventDateObj = new Date(ev.date);
        eventDateObj.setHours(0,0,0,0);
        const isPast = eventDateObj < today;
        const cardClass = isPast ? "event-card past-event" : "event-card";
        const formattedDate = new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        cardsHtml += `
            <div class="${cardClass}" data-event-id="${ev.id}">
                <div class="event-title">${escapeHtml(ev.name)}</div>
                <div class="event-date">📆 ${formattedDate}</div>
                <div class="event-desc">📌 ${escapeHtml(ev.description)}</div>
                <button class="delete-btn" data-id="${ev.id}">🗑 Delete Event</button>
            </div>
        `;
    }
    container.innerHTML = cardsHtml;
    countSpan.innerText = `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`;

    // attach delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = btn.getAttribute('data-id');
            deleteEventById(eventId);
        });
    });
}

// Delete event by id
function deleteEventById(id) {
    const newEvents = events.filter(ev => ev.id !== id);
    if (newEvents.length === events.length) return;
    events = newEvents;
    renderEvents();
}

// Add new event
function addNewEvent(name, date, description) {
    const trimmedName = name.trim();
    const trimmedDate = date.trim();
    const trimmedDesc = description.trim();

    if (trimmedName === "" || trimmedDate === "" || trimmedDesc === "") {
        return false;
    }
    if (isNaN(new Date(trimmedDate).getTime())) {
        showWarningMessage("Invalid date format. Please select a valid date.");
        return false;
    }
    const newEvent = {
        id: generateId(),
        name: trimmedName,
        date: trimmedDate,
        description: trimmedDesc
    };
    events.push(newEvent);
    renderEvents();
    return true;
}

// Helper to escape HTML
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Show warning message
let warningTimeout = null;
function showWarningMessage(message) {
    const warningDiv = document.getElementById('formWarning');
    if (!warningDiv) return;
    warningDiv.textContent = message || "⚠️ All fields are required!";
    warningDiv.classList.add('show');
    if (warningTimeout) clearTimeout(warningTimeout);
    warningTimeout = setTimeout(() => {
        warningDiv.classList.remove('show');
    }, 2500);
}

// Reset form fields
function resetFormFields() {
    document.getElementById('eventName').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventDesc').value = '';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    const nameVal = document.getElementById('eventName').value;
    const dateVal = document.getElementById('eventDate').value;
    const descVal = document.getElementById('eventDesc').value;
    
    if (!nameVal || !dateVal || !descVal) {
        showWarningMessage("❌ All fields (Event Name, Date, Description) are required!");
        return;
    }
    const success = addNewEvent(nameVal, dateVal, descVal);
    if (success) {
        resetFormFields();
        const warningDiv = document.getElementById('formWarning');
        warningDiv.textContent = "✅ Event added successfully!";
        warningDiv.classList.add('show');
        setTimeout(() => {
            if(warningDiv) warningDiv.classList.remove('show');
        }, 1800);
    } else {
        showWarningMessage("⚠️ Please fill all fields correctly.");
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderEvents();
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                currentSearchQuery = '';
                renderEvents();
            }
        });
    }
}

// Set footer current year
function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Initialize everything
function init() {
    setCurrentYear();
    renderEvents();
    setupSearch();
    const form = document.getElementById('eventForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);