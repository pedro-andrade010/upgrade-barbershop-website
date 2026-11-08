'use strict';

/* Form validation and submission for the booking, enquiry and message forms.
   - Client-side validation with error messages next to each field
   - Booking and enquiry forms are sent with AJAX (fetch) to the URL in the form's action attribute
   - The message form compiles an email for the recipient below */

const EMAIL_TO = 'info@upgradebarbershop.co.za';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+27|0)[0-9]{9}$/;       // South African numbers
const NAME_PATTERN = /^[A-Za-z\u00C0-\u00FF' -]+$/;

/* ---------- Date helpers ---------- */
function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toInputDate(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

function parseDate(value) {
  const parts = value.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ---------- Validation rules (each returns an error message, or '' when valid) ---------- */
function messageRule(min, max) {
  return (value) => {
    if (value.length === 0 && min === 0) return '';
    if (value.length < min) return 'Please write at least ' + min + ' characters (you have ' + value.length + ').';
    if (value.length > max) return 'Please keep it under ' + max + ' characters (you have ' + value.length + ').';
    return '';
  };
}

function dateRule(required, allowSunday) {
  return (value) => {
    if (!value) return required ? 'Please choose a date.' : '';
    const date = parseDate(value);
    if (isNaN(date)) return 'Please enter a valid date.';
    if (date < todayStart()) return 'Please choose today or a future date.';
    const limit = todayStart();
    limit.setMonth(limit.getMonth() + 6);
    if (date > limit) return 'Please choose a date within the next 6 months.';
    if (!allowSunday && date.getDay() === 0) return 'We are closed on Sundays. Please choose another day.';
    return '';
  };
}

function bookingTimeRule(value, form) {
  if (!value) return 'Please choose a time.';
  const parts = value.split(':').map(Number);
  const minutes = parts[0] * 60 + parts[1];

  const dateValue = form.elements.namedItem('date').value;
  const date = dateValue ? parseDate(dateValue) : null;
  const isSaturday = date && date.getDay() === 6;
  const lastStart = isSaturday ? 15 * 60 : 17 * 60;

  if (minutes < 9 * 60 || minutes > lastStart) {
    return 'Appointments run from 09:00 to 17:00 (Saturdays 09:00 to 15:00).';
  }
  if (date && date.getTime() === todayStart().getTime()) {
    const now = new Date();
    if (minutes <= now.getHours() * 60 + now.getMinutes()) return 'That time has already passed today.';
  }
  return '';
}

const baseRules = {
  name: (v) => {
    if (v.length < 2 || v.length > 50) return 'Please enter your name (2 to 50 characters).';
    if (!NAME_PATTERN.test(v)) return 'Use letters, spaces, hyphens or apostrophes only.';
    return '';
  },
  email: (v) => (EMAIL_PATTERN.test(v) && v.length <= 100)
    ? '' : 'Please enter a valid email address, e.g. name@example.com.',
  phone: (v) => PHONE_PATTERN.test(v.replace(/[\s-]/g, ''))
    ? '' : 'Enter a valid South African number, e.g. 021 555 1234 or +27 82 123 4567.',
  service: (v) => (v ? '' : 'Please select a service.')
};

const bookingRules = Object.assign({}, baseRules, {
  date: dateRule(true, false),
  time: bookingTimeRule,
  message: messageRule(0, 300)
});

const enquiryRules = Object.assign({}, baseRules, {
  people: (v) => {
    const number = Number(v);
    return (v !== '' && Number.isInteger(number) && number >= 1 && number <= 10)
      ? '' : 'Enter a whole number between 1 and 10.';
  },
  date: dateRule(false, true),
  message: messageRule(10, 500)
});

const messageRules = {
  name: baseRules.name,
  email: baseRules.email,
  phone: baseRules.phone,
  type: (v) => (v ? '' : 'Please select the type of message.'),
  message: messageRule(10, 500)
};

/* ---------- Error handling ---------- */
function setError(field, message) {
  let error = document.getElementById(field.id + '-error');
  if (!error) {
    error = document.createElement('span');
    error.className = 'error';
    error.id = field.id + '-error';
    field.insertAdjacentElement('afterend', error);
    field.setAttribute('aria-describedby', error.id);
  }
  error.textContent = message;
  field.classList.toggle('invalid', message !== '');
  field.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
}

function validateForm(form, rules) {
  let firstInvalid = null;
  Object.keys(rules).forEach((name) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    const message = rules[name](field.value.trim(), form);
    setError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) firstInvalid.focus();
  return firstInvalid === null;
}

// Validate a field when the visitor leaves it, and keep checking while it is invalid
function watchFields(form, rules) {
  Object.keys(rules).forEach((name) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    const check = () => setError(field, rules[name](field.value.trim(), form));
    field.addEventListener('blur', check);
    field.addEventListener('change', check);
    field.addEventListener('input', () => { if (field.classList.contains('invalid')) check(); });
  });
}

function resetForm(form) {
  form.reset();
  form.querySelectorAll('.error').forEach((error) => { error.textContent = ''; });
  form.querySelectorAll('.invalid').forEach((field) => {
    field.classList.remove('invalid');
    field.setAttribute('aria-invalid', 'false');
  });
}

/* ---------- Helpers ---------- */
function getFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (key !== 'website') data[key] = String(value).trim();
  });
  return data;
}

function firstName(fullName) {
  return fullName.split(' ')[0];
}

function detailList(pairs) {
  const list = document.createElement('ul');
  list.className = 'details';
  pairs.forEach((pair) => {
    const item = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = pair[0] + ': ';
    item.append(label, document.createTextNode(pair[1]));
    list.append(item);
  });
  return list;
}

// AJAX: send the form data to the URL in the form's action attribute without reloading the page
async function sendForm(form, data) {
  const response = await fetch(form.action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Request failed with status ' + response.status);
  return response.json();
}

function setupForm(id, rules, handler) {
  const form = document.getElementById(id);
  if (!form) return null;

  form.noValidate = true; // our JavaScript shows the messages (HTML5 validation still works without JavaScript)
  watchFields(form, rules);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = form.querySelector('.form-status');
    status.textContent = '';
    status.className = 'form-status';

    if (form.elements.namedItem('website').value) return; // hidden spam trap was filled in

    if (!validateForm(form, rules)) {
      status.textContent = 'Please fix the highlighted fields and try again.';
      status.classList.add('error-text');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'SENDING...';

    try {
      await handler(form, getFormData(form), status);
    } catch (error) {
      status.textContent = 'Sorry, we could not send your form. Please check your connection and try again.';
      status.classList.add('error-text');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });

  return form;
}

/* ---------- Booking form (contact.html) ---------- */
async function handleBooking(form, data) {
  await sendForm(form, data);

  const service = findService(data.service);
  const content = document.createElement('div');
  const intro = document.createElement('p');
  intro.textContent = 'Thank you, ' + firstName(data.name) + '. We have received your booking request and will confirm it by email.';
  content.append(intro, detailList([
    ['Service', service ? service.name + ' (R' + service.price + ')' : data.service],
    ['Date', formatDate(data.date)],
    ['Time', data.time],
    ['Email', data.email],
    ['Phone', data.phone]
  ]));

  UB.openModal('Booking request received', content);
  resetForm(form);
}

/* ---------- Enquiry form (enquiry.html) ---------- */
function describeAvailability(dateValue) {
  const openingHours = 'We are open Monday to Friday 09:00 - 18:00 and Saturday 09:00 - 16:00.';
  if (!dateValue) return 'No date chosen. ' + openingHours;

  const day = parseDate(dateValue).getDay();
  const label = formatDate(dateValue);
  if (day === 0) return 'We are closed on ' + label + '. Our next opening day is Monday from 09:00.';
  if (day === 6) return 'We are open on ' + label + ' from 09:00 to 16:00.';
  return 'We are open on ' + label + ' from 09:00 to 18:00.';
}

async function handleEnquiry(form, data, status) {
  await sendForm(form, data);

  const service = findService(data.service);
  const people = Number(data.people);
  const box = document.getElementById('enquiry-response');
  box.replaceChildren();

  const response = document.createElement('div');
  response.className = 'response';

  const title = document.createElement('h2');
  title.textContent = 'Thank you, ' + firstName(data.name);

  const intro = document.createElement('p');
  intro.textContent = 'We have received your enquiry. Here is the information you asked for:';

  const details = detailList([
    ['Service', service.name],
    ['Price per person', 'R' + service.price],
    ['Number of people', String(people)],
    ['Estimated total', 'R' + (service.price * people)],
    ['Estimated time', 'about ' + service.duration + ' minutes per person'],
    ['Availability', describeAvailability(data.date)]
  ]);

  const reply = document.createElement('p');
  reply.textContent = 'We will answer your question by email at ' + data.email + '.';

  const book = document.createElement('a');
  book.className = 'button';
  book.textContent = 'BOOK THIS SERVICE';
  book.href = 'contact.html?service=' + encodeURIComponent(service.name) + '#booking';

  response.append(title, intro, details, reply, book);
  box.append(response);
  response.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  status.textContent = 'Your enquiry was sent.';
  status.classList.add('success-text');
  resetForm(form);
}

/* ---------- Message form (contact.html): compile an email ---------- */
function handleMessage(form, data, status) {
  const subject = '[' + data.type + '] Message from ' + data.name;
  const body = [
    'Hello Upgrade Barbershop,',
    '',
    data.message,
    '',
    '--',
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Phone: ' + data.phone,
    'Message type: ' + data.type
  ].join('\r\n');

  const mailto = 'mailto:' + EMAIL_TO +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);

  const preview = document.getElementById('message-preview');
  preview.replaceChildren();

  const title = document.createElement('h3');
  title.textContent = 'Your email is ready';

  const recipient = document.createElement('p');
  recipient.textContent = 'To: ' + EMAIL_TO;

  const subjectLine = document.createElement('p');
  subjectLine.textContent = 'Subject: ' + subject;

  const text = document.createElement('pre');
  text.textContent = body;

  const send = document.createElement('a');
  send.className = 'button';
  send.textContent = 'SEND EMAIL';
  send.href = mailto;

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'This opens your email app with the message filled in. Check it and press send there.';

  preview.append(title, recipient, subjectLine, text, send, note);
  preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  status.textContent = 'Your email is ready below.';
  status.classList.add('success-text');
}

/* ---------- Start ---------- */
const today = toInputDate(new Date());

const bookingForm = setupForm('booking-form', bookingRules, handleBooking);
if (bookingForm) {
  const date = bookingForm.elements.namedItem('date');
  const time = bookingForm.elements.namedItem('time');
  date.min = today;
  // The time rule depends on the date (Saturday closes earlier)
  date.addEventListener('change', () => {
    if (time.value) setError(time, bookingTimeRule(time.value, bookingForm));
  });

  // Pre-select the service when the visitor arrives from a BOOK button (?service=...)
  const preset = new URLSearchParams(window.location.search).get('service');
  const select = bookingForm.elements.namedItem('service');
  if (preset && Array.from(select.options).some((option) => option.value === preset)) {
    select.value = preset;
  }
}

const enquiryForm = setupForm('enquiry-form', enquiryRules, handleEnquiry);
if (enquiryForm) enquiryForm.elements.namedItem('date').min = today;

setupForm('message-form', messageRules, handleMessage);