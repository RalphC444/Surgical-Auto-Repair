const { google } = require("googleapis");

const SHOP_ADDRESS = "701 N Macquesten Pkwy, Mount Vernon, NY 10552";
const TIMEZONE = "America/New_York";
const APPT_DURATION_HOURS = 1;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const {
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_CALENDAR_ID,
  } = process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return respond(500, {
      error:
        "Google Calendar not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in Netlify environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const {
    dateKey,
    timeValue,
    contactName,
    contactEmail,
    contactPhone,
    serviceRequested,
    issueDescription,
    vehicleYear,
    vehicleMake,
    vehicleModel,
    vehicleTrim,
  } = body;

  if (!dateKey || !timeValue || !contactName) {
    return respond(400, {
      error: "Missing required fields: dateKey, timeValue, contactName",
    });
  }

  const [hourStr, minuteStr] = timeValue.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return respond(400, { error: "timeValue must be HH:MM (24-hour)" });
  }

  const pad = (n) => String(n).padStart(2, "0");
  const startISO = `${dateKey}T${pad(hour)}:${pad(minute)}:00`;
  const endISO = `${dateKey}T${pad(hour + APPT_DURATION_HOURS)}:${pad(minute)}:00`;

  const descriptionLines = [
    `Customer: ${contactName}`,
    `Email: ${contactEmail || "—"}`,
    `Phone: ${contactPhone || "—"}`,
    "",
    `Service: ${serviceRequested || "—"}`,
    issueDescription ? `Issue: ${issueDescription}` : null,
    `Vehicle: ${vehicleYear || "—"} ${vehicleMake || "—"} ${vehicleModel || "—"}${vehicleTrim ? ` (${vehicleTrim})` : ""}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const calendarId = GOOGLE_CALENDAR_ID || "primary";

  try {
    const privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const result = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${contactName} — ${serviceRequested || "Appointment"}`,
        description: descriptionLines,
        location: SHOP_ADDRESS,
        start: { dateTime: startISO, timeZone: TIMEZONE },
        end: { dateTime: endISO, timeZone: TIMEZONE },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 60 },
          ],
        },
      },
    });

    return respond(200, {
      success: true,
      eventId: result.data.id,
      htmlLink: result.data.htmlLink,
    });
  } catch (err) {
    const detail = err?.response?.data?.error || err?.message || String(err);
    console.error("Google Calendar API error:", JSON.stringify(detail, null, 2));
    return respond(500, { error: "Failed to create calendar event", detail });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
