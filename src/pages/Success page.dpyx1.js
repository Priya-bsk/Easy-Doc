import wixLocation from 'wix-location';
import { send } from "emailjs-com"; 

$w.onReady(function () {
    const urlParams = wixLocation.query;
    const doctorName = urlParams.doctorName;
    const appointmentDate = urlParams.appointmentDate;
    const appointmentTime = urlParams.appointmentTime;
    const patientName = urlParams.patientName; // Retrieve the patient name
    const emailId = urlParams.emailId;
    // Display the booking details if available
    if (doctorName && appointmentDate && appointmentTime && patientName) {
        $w("#doctorNameText").text = `${doctorName}`;
        $w("#appointmentDateText").text = `${appointmentDate}`;
        $w("#appointmentTimeText").text = `${appointmentTime}`;
        $w("#patientNameText").text = `${patientName}`; // Display patient name
        $w("#emailText").text = `${emailId}`;

         console.log("Sending email to:",emailId); // Log the email being sent

        // Call the send function from EmailJS
        send("service_jvka0u8", "template_10jnwm3", {
            to_email: emailId,
            to_name : patientName,
            to_time: appointmentTime,
            to_date:appointmentDate,
            to_doctor:doctorName,
        }, "238SBY4PBEitmRnGW") // Your EmailJS public key
        .then(() => {
            console.log("Email sent successfully!"); // Log success message
            
        })
        .catch((error) => {
            console.error("Failed to send email:", error); // Log error if sending fails
            console.log("Attempting to send cancellation email to:", emailId);
        });

    } else {
        $w("#doctorNameText").text = "No booking details available.";
    }
   
});
