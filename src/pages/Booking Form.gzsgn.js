
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(function () {
    // Retrieve the appointment time from session storage
    const appointmentTime = session.getItem("appointmentTime");

    if (appointmentTime) {
        $w("#appointmentInput").value = appointmentTime; // Set the value in the input field
    } else {
        console.error("No appointment time found in session storage.");
    }

    // Set up a submit button to save the details to the database
    $w("#submitButton").onClick(() => {
        // Collect data from input fields
        const patientName = $w("#patientNameInput").value;
        const age = parseInt($w("#ageInput").value, 10); // Parse age as a number
        const email = $w("#emailInput").value;

        // Insert the data into the Appointments database
        wixData.insert("Appointments", {
            patientName: patientName,
            age: age,
            emailId: email,
            appointmentTime: appointmentTime // Use the retrieved appointment time
        })
        .then((result) => {
            console.log("Appointment saved:", result); // Confirm data insertion
            
            // Store patient details in session storage
            session.setItem("patientName", patientName);
            session.setItem("age", age);
            session.setItem("email", email);
            
            wixWindow.lightbox.close(); // Close the lightbox after submission
        })
        .catch((error) => {
            console.error("Error saving appointment:", error);
        });
    });
});






