/*
import wixWindow from 'wix-window';
import { session } from 'wix-storage';

$w.onReady(function () {
    // Connect the book button click event
    $w("#bookButton").onClick(bookButton_click); // Connects the button click event

    // Handle the dropdown change event
    $w("#dropdown1").onChange((event) => {
        const selectedTime = $w("#dropdown1").value; // Get the selected time from the dropdown
        console.log("Selected Time:", selectedTime); // Debugging log

        // Store the selected time in session storage
        session.setItem("appointmentTime", selectedTime);
    });
});

// Function to handle the booking button click
export function bookButton_click(event) {
    const selectedTime = session.getItem("appointmentTime");

    if (selectedTime) {
        // Open the Booking Form lightbox
        wixWindow.openLightbox("BookingForm");
    } else {
        console.log("Please select a time.");
        // Optionally display an error message
    }
}
*/

import wixWindow from 'wix-window';
import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(function () {
    // Connect the book button click event
    $w("#bookButton").onClick(bookButton_click);

    // Handle the dropdown change event
    $w("#dropdown1").onChange((event) => {
        const selectedTime = $w("#dropdown1").value; // Get the selected time from the dropdown
        console.log("Selected Time:", selectedTime); // Debugging log

        // Check if the selected time slot is already booked
        wixData.query("Appointments")
            .eq("appointmentTime", selectedTime) // Check for the selected time
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    // Slot is already booked
                    console.error("The selected time slot is already booked.");
                    $w("#errorInput").value = "The selected time slot is already booked. Please choose a different time.";
                    $w("#errorInput").show(); // Show the error input box
                    session.removeItem("appointmentTime"); // Clear the session if slot is taken
                } else {
                    // Slot is available
                    console.log("The selected time slot is available.");
                    $w("#errorInput").hide(); // Hide error input if the slot is free
                    session.setItem("appointmentTime", selectedTime); // Store the selected time in session storage
                }
            })
            .catch((error) => {
                console.error("Error checking appointment availability:", error);
            });
    });
});

// Function to handle the booking button click
export function bookButton_click(event) {
    const selectedTime = session.getItem("appointmentTime");

    if (selectedTime) {
        // Open the Booking Form lightbox
        wixWindow.openLightbox("BookingForm");
    } else {
        console.log("Please select a time.");
        // Optionally display an error message
        $w("#errorInput").value = "Please select a time before booking.";
        $w("#errorInput").show(); // Show the error input box
    }
}



