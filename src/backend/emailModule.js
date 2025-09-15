// backend/emailModule.js
/////////////////////////////////////////
//import wixCRM from 'wix-crm-backend';

/*export async function sendEmail({ to, subject, body }) {
    try {
        // Send the email using the recipient's email string directly
        await wixCRM.emailContact(to, subject, body); // Send the email with subject and body separately
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email."); // Handle the error as needed
    }
}*/

////////////////////////////////////////////////////
// backend/emailModule.js
/*import wixCRM from 'wix-crm';

export async function sendEmail({ to, subject, body }) {
    try {
        await wixCRM.emailContact(to, subject, { body });
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error; // Rethrow the error to catch in the calling function if needed
    }
}*/

// backend/emailModule.js

import wixCRM from 'wix-crm-backend';

export function sendEmail(emailDetails) {
    try {
        // Attempt to send the email
        return wixCRM.emailContact(emailDetails.to, emailDetails.subject, emailDetails.body);
    } catch (error) {
        console.error("Error in sendEmail function:", error);
        throw new Error("Failed to send email"); // Propagate the error
    }
}
