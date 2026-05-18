type NotificationEvent = "SUBMITTED" | "APPROVED" | "REJECTED" | "CHECK_IN_REMINDER";

interface NotificationData {
  event: NotificationEvent;
  employeeName: string;
  managerName?: string;
  managerEmail?: string;
  employeeEmail?: string;
  planId?: string;
  deepLink: string;
}

/**
 * Sends a rich Adaptive Card to a Microsoft Teams channel via Webhook.
 * @param webhookUrl The Microsoft Teams Incoming Webhook URL
 * @param data The notification details
 */
export async function sendTeamsNotification(webhookUrl: string, data: NotificationData) {
  if (!webhookUrl) return;

  let title = "";
  let color = "";
  let text = "";
  
  switch (data.event) {
    case "SUBMITTED":
      title = "🎯 New Goal Plan Submitted";
      color = "Attention"; // Orange/Yellow
      text = `**${data.employeeName}** has submitted their goals for review.`;
      break;
    case "APPROVED":
      title = "✅ Goal Plan Approved";
      color = "Good"; // Green
      text = `The goal plan for **${data.employeeName}** has been approved.`;
      break;
    case "REJECTED":
      title = "⚠️ Goal Plan Needs Rework";
      color = "Warning"; // Red
      text = `The goal plan for **${data.employeeName}** was returned for rework.`;
      break;
    case "CHECK_IN_REMINDER":
      title = "⏰ Check-in Reminder";
      color = "Accent"; // Blue
      text = `It is time for **${data.employeeName}**'s quarterly check-in.`;
      break;
  }

  // Microsoft Teams Adaptive Card Payload
  const adaptiveCard = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              size: "Large",
              weight: "Bolder",
              text: title,
              color: color
            },
            {
              type: "TextBlock",
              text: text,
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "Employee:", value: data.employeeName },
                { title: "Action Needed:", value: data.event === "SUBMITTED" ? "Manager Review" : "None" }
              ]
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Open in AtomQuest",
              url: data.deepLink
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adaptiveCard),
    });
    
    if (!response.ok) {
      console.error("Failed to send Teams notification", await response.text());
    }
  } catch (error) {
    console.error("Teams notification error:", error);
  }
}

/**
 * Sends an email via Resend API
 * @param apiKey The Resend API Key
 * @param data The notification details
 */
export async function sendEmailNotification(apiKey: string, data: NotificationData) {
  if (!apiKey || !data.managerEmail) return;

  let subject = "";
  let html = "";

  switch (data.event) {
    case "SUBMITTED":
      subject = `Action Required: ${data.employeeName} submitted goals for review`;
      html = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">New Goal Plan Submission</h2>
          <p style="color: #334155; font-size: 16px;">
            Hi ${data.managerName || 'Manager'},<br/><br/>
            <strong>${data.employeeName}</strong> has submitted their goals for the current cycle.
          </p>
          <div style="margin: 30px 0;">
            <a href="${data.deepLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Goals
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px;">This is an automated message from the AtomQuest portal.</p>
        </div>
      `;
      break;
    // We can add the HTML templates for APPROVED, REJECTED, etc. here
    default:
      subject = `AtomQuest Notification: ${data.employeeName}`;
      html = `<p>${data.employeeName} - Event: ${data.event}</p><p><a href="${data.deepLink}">View in portal</a></p>`;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "AtomQuest Portal <onboarding@resend.dev>", // Resend's testing domain
        to: data.managerEmail,
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      console.error("Failed to send email", await response.text());
    }
  } catch (error) {
    console.error("Email notification error:", error);
  }
}
