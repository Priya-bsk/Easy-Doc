import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { session } from 'wix-storage';
//import { Appointments_beforeInsert } from 'backend/data.js';

$w.onReady(function () {
    const email = session.getItem("userName"); 
    
     $w("#dateDropdown").onChange(() => {
        $w("#errorMessage").hide(); // Hide the error message when date is changed
    });

    // Event handler to reset error message when a new time slot is selected
    $w("#timeSlotDropdown").onChange(() => {
        $w("#errorMessage").hide(); // Hide the error message when time slot is changed
    });

    // Display user info if email is found in session storage
    if (email) {
        wixData.query("UserLogin")
            .eq("email", email) // Find the user by email
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    const user = results.items[0];
                    $w('#nameInput').value = user.name;   // Display user's name
                    $w('#emailInput').value = user.email; // Display user's email
                } else {
                    console.warn("User not found in database.");
                }
            })
            .catch((error) => {
                console.error("Error loading user data:", error);
            });
    } else {
        console.warn("No user is logged in.");
         wixLocation.to(`/login`);

    }
    const urlParams = wixLocation.query;
    const doctorName = urlParams.doctorName;

    if (doctorName) {
        $w("#doctorNameText").text = ` ${doctorName}`;
        fetchDoctorAvailability(doctorName);
    } else {
        console.log("No doctor name parameter found in the URL.");
    }

    $w("#timeSlotDropdown").onChange(handleTimeSlotOrDateChange);
    $w("#dateDropdown").onChange(handleTimeSlotOrDateChange);
});

function fetchDoctorAvailability(doctorName) {
    wixData.query("Doctors")
        .eq("doctorName", doctorName) 
        .find()
        .then((doctorResults) => {
            if (doctorResults.items.length > 0) {
                const doctorId = doctorResults.items[0]._id; 
                console.log("Doctor ID:", doctorId);

                return wixData.query("DoctorAvailability")
                    .eq("doctorId", doctorId)
                    .find();
            } else {
                console.log("No doctor found with that name.");
            }
        })
        .then((availabilityResults) => {
            if (availabilityResults && availabilityResults.items.length > 0) {
                console.log("Availability Results:", availabilityResults.items);

                const availableDates = [];
                const availableTimeSlots = [];

                availabilityResults.items.forEach(item => {
                    if (Array.isArray(item.availableDates)) {
                        availableDates.push(...item.availableDates);
                    }

                    if (Array.isArray(item.timeSlots)) {
                        availableTimeSlots.push(...item.timeSlots); 
                    }
                });

                console.log("Available Dates:", availableDates);
                console.log("Available Time Slots:", availableTimeSlots);

                $w("#dateDropdown").options = availableDates.map(date => ({ label: date, value: date }));
                $w("#timeSlotDropdown").options = availableTimeSlots.map(slot => ({ label: slot, value: slot }));

                console.log("Date Dropdown Options:", $w("#dateDropdown").options);
                console.log("Time Slot Dropdown Options:", $w("#timeSlotDropdown").options);
            } else {
                console.log("No availability found for this doctor.");
                $w("#availabilityMessage").text = "No availability found for this doctor."; 
            }
        })
        .catch((error) => {
            console.error("Error fetching doctor availability: ", error);
        });
}

let previousSelection = null;

function handleTimeSlotOrDateChange() {
    $w("#errorMessage").hide();
    validateTimeSlotSelection();
}

function validateTimeSlotSelection() {
    const selectedDate = $w("#dateDropdown").value;
    const selectedTimeSlot = $w("#timeSlotDropdown").value;
    const doctorName = $w("#doctorNameText").text.trim();

    if (!selectedDate || !selectedTimeSlot || !doctorName) {
        $w("#errorMessage").hide(); 
        return;
    }

    
    if (previousSelection) {
        wixData.update("multi", {
            ...previousSelection,
            isLocked: false
        }).catch((error) => console.error("Error unlocking previous slot:", error));
        previousSelection = null;
    }

    
    wixData.query("multi")
        .eq("doctorname", doctorName)
        .eq("appointmentdate", selectedDate)
        .eq("appointmenttime", selectedTimeSlot)
        .eq("isLocked", true)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w("#errorMessage").text = "This time slot is currently being selected by another user. Please choose a different slot.";
                $w("#errorMessage").show();
            } else {
                
                const lockDetails = {
                    doctorname: doctorName,
                    appointmentdate: selectedDate,
                    appointmenttime: selectedTimeSlot,
                    isLocked: true
                };

                wixData.insert("multi", lockDetails)
                    .then((insertedLock) => {
                        console.log("Slot locked successfully for selection.");
                        previousSelection = insertedLock;
                    })
                    .catch((error) => {
                        console.error("Error locking slot:", error);
                    });
            }
        })
        .catch((error) => {
            console.error("Error querying Appointments:", error);
        });
}

$w("#bookNowButton").onClick(() => {
    $w("#errorText").hide();
    const urlParams = wixLocation.query;
    const doctorName = urlParams.doctorName;
    const patientName = $w("#nameInput").value;
    const patientAge = $w("#ageInput").value;
    const emailId = $w("#emailInput").value;
    const selectedDate = $w("#dateDropdown").value;
    const selectedTimeSlot = $w("#timeSlotDropdown").value;

    
    const bookingDetails = {
        doctorName: doctorName,
        patientName: patientName,
        age: patientAge,
        emailId: emailId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        priority: 2,
        isEmergency:false
        
    };
   
    wixData.query("multi")
        .eq("doctorname", doctorName)
        .eq("appointmentdate", selectedDate)
        .eq("appointmenttime", selectedTimeSlot)
        .eq("isLocked", true)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                
                wixData.insert("Appointments", bookingDetails) 
                    .then(() => {
                        
                        return wixData.remove("multi", results.items[0]._id);
                    })
                    .then(() => {
                        console.log("Appointment booked and lock removed.");
                        wixLocation.to(`/success-page?doctorName=${doctorName}&appointmentDate=${selectedDate}&appointmentTime=${selectedTimeSlot}&patientName=${patientName}&emailId=${emailId}`);
                        console.log("Booking successful!");
                        
                    })
                    .catch((error) => {
                        console.error("Booking or lock removal error:", error);
                        if (error.message.includes("Sorry. This time slot is already booked with the selected doctor. Please choose another time slot.")) {
                        $w("#errorMessage").text = error.message;
                        $w("#errorMessage").show();
                        } else {
                            console.error("Unexpected error:", error);
                            $w("#errorText").text = "Sorry. This time slot is already booked with the selected doctor.  Please choose another time slot.";
                            $w("#errorText").show();
                        }
                                });
            } 
            else {
                
                $w("#errorMessage").text = "This time slot is already booked by another user.  Please choose another time slot.";
                $w("#errorMessage").show();
            }
        })
        .catch((error) => {
            console.error("Error querying multi:", error);
        });

});






























// frontend code (Page Code)
/*
// Insert booking into the Appointments collection
    wixData.insert("Appointments", bookingDetails)
        .then(() => {
            wixLocation.to(`/success-page?doctorName=${doctorName}&appointmentDate=${selectedDate}&appointmentTime=${selectedTimeSlot}&patientName=${patientName}&emailId=${emailId}`);
            console.log("Booking successful!");
        })
        .catch((error) => {
             if (error.message.includes("Sorry. This time slot is already booked with the selected doctor. Please choose another time slot.")) {
                $w("#errorMessage").text = error.message;
                $w("#errorMessage").show();
            } else {
                console.error("Unexpected error:", error);
                $w("#errorText").text = "Sorry. This time slot is already booked with the selected doctor. Please choose another time slot.";
                $w("#errorText").show();
            }
        });


*/
