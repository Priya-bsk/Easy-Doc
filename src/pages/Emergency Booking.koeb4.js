import wixData from 'wix-data';
import { session } from 'wix-storage';
import wixLocation from 'wix-location';
import { send } from "emailjs-com"; 


$w.onReady(function () {

      const email = session.getItem("userName"); // Get the user's email from session
    // Display user info if email is found in session storage
    if (email) {
        wixData.query("UserLogin")
            .eq("email", email) // Find the user by email
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    const user = results.items[0];
                    $w('#nameInput').value = user.name;   // Display user's name
                } else {
                    console.warn("User not found in database.");
                }
            })
            .catch((error) => {
                console.error("Error loading user data:", error);
            });
    } else {
        console.warn("No user is logged in.");
        $w("#errorText").text = "Please login.";
        $w("#errorText").show();
        wixLocation.to(`/login`);
    }
    // Set the current date in the date input field
    // Load specialties into the dropdown
    loadSpecialties();

    // Event listener for the Confirm Button Click
    $w("#confirmButton").onClick(() => {
         $w("#errorMessage").hide();
        bookEmergencyAppointment();

    });
});

// Function to load specialties into the dropdown
async function loadSpecialties() {
    try {
        const result = await wixData.query("Specialties").find();
        const specialties = result.items.map(specialty => specialty.name);
        $w("#specialtyDropdown").options = specialties.map(specialty => {
            return { label: specialty, value: specialty };
        });
        console.log("Specialties loaded successfully:", specialties);
    } catch (error) {
        console.error("Error loading specialties:", error);
    }
}


async function bookEmergencyAppointment() {
    const email = session.getItem("userName"); 
    const userName = $w("#nameInput").value;
    const userAge = $w("#ageInput").value;
    const specialtyName = $w("#specialtyDropdown").value;
   
    // Format the date
    const dateInput = $w("#dateInput").value;
    const dateObject = new Date(dateInput); // Convert to Date object
    const date= `${dateObject.getDate().toString().padStart(2, '0')}-${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getFullYear()}`;

    // Format the time (assumed already in HH:mm format)
    const timeInput = $w("#timeInput").value; 
    const requestedTime = timeInput; // Assuming time is already in the correct format

    // Input validation
    if (!userName || !userAge || !specialtyName || !requestedTime) {
        $w("#errorMessage").text = "Please fill in all fields.";
        $w("#errorMessage").show();
        console.log("Input validation failed: All fields must be filled.");
        return;
    }

    console.log("User details:", { userName, userAge, specialtyName, date, requestedTime });

    // Step 1: Fetch the Specialty ID based on the selected name
    let specialtyQuery = await wixData.query("Specialties")
        .eq("name", specialtyName)
        .find();

    if (specialtyQuery.items.length === 0) {
        $w("#errorMessage").text = "Specialty not found.";
        $w("#errorMessage").show();
        console.log("No specialty found for:", specialtyName);
        return;
    }

    const specialtyId = specialtyQuery.items[0]._id;
    console.log("Specialty ID found:", specialtyId);

    // Step 2: Fetch Doctors with the matched Specialty ID
    let doctors = await wixData.query("Doctors")
        .eq("specialty", specialtyId)
        .find();

    if (doctors.items.length === 0) {
        $w("#errorMessage").text = "No doctors available for the selected specialty.";
        $w("#errorMessage").show();
        console.log("No doctors found for specialty ID:", specialtyId);
        return;
    }

    console.log("Doctors found for specialty:", doctors.items);

    // Step 3: Find the Nearest Available Slot
    const nearestSlot = await findNearestAvailableSlotP1(doctors.items, date, requestedTime);

    if (nearestSlot) {
        const { doctorName, doctorId, date, time, availableTimeSlots } = nearestSlot;
        console.log(`Booking appointment with Doctor ${doctorName} at ${time} on ${date}`);
    const existingAppointments = await wixData.query("Appointments")
        .eq("appointmentDate", date) // Make sure this matches the format in the database
        .eq("appointmentTime", nearestSlot.time) // Use the nearest slot's time
        .eq("doctorName", nearestSlot.doctorName) // Check for the same doctor
        .eq("priority", 2) // Check only for priority 2 appointments
        .find();

    console.log("Querying for existing appointments:", {
        date: nearestSlot.date,
        time: nearestSlot.time,
        doctor: nearestSlot.doctorName,
        priority: 2
    });

    if (existingAppointments.items.length > 0) {
        console.log("Existing appointments found:", existingAppointments.items);
    } else {
        console.log("No existing appointments found.");
    }

    // Step 5: Reschedule existing appointments if necessary
    if (existingAppointments.items.length > 0) {
        console.log("Rescheduling existing appointments for priority 2 patients...");
        
         console.log(`Rescheduled appointment for ${nearestSlot.doctorName} to `);
        // Step 5.1: Retrieve the available time slots for the selected doctor
        const doctorAvailability = await wixData.query("DoctorAvailability")
            .eq("doctorId", nearestSlot.doctorId) // Use doctorName as the doctorId reference
            .eq("availableDates", date)
            .find();

        // Ensure the doctor has available time slots on the selected date
        let availableTimeSlots = [];
        if (doctorAvailability.items.length > 0) {
            availableTimeSlots = doctorAvailability.items[0].timeSlots;
        } else {
            console.log("No available time slots found for the selected doctor.");
        }
        for (let appointment of existingAppointments.items) {
            // Find the next available time slot
            const newTimeSlot = await findNextAvailableTimeSlot(nearestSlot.time, availableTimeSlots,date,nearestSlot.doctorName);

            if (newTimeSlot) {
                const oldtime=appointment.appointmentTime;
                appointment.appointmentTime = String(newTimeSlot); 
                await wixData.update("Appointments", appointment);

                // Log the rescheduling
                console.log(`Rescheduled appointment for ${appointment.patientName} to ${newTimeSlot}`);

                

            //console.log("Sending email to:", appointment.email); // Log the email being sent

            // Call the send function from EmailJS
            send("service_thcw512", "template_qxrqkjj", {
                to_email: appointment.emailId,
                to_name : appointment.patientName,
                from_time: oldtime,
                from_date:appointment.appointmentDate,
                to_time:newTimeSlot,
                to_date:appointment.appointmentDate,
                to_doctor:nearestSlot.doctorName,
            }, "SEjpc5WG8kIxzzuqG") // Your EmailJS public key
            .then(() => {
                console.log("Email sent successfully!"); // Log success message
                // Optionally, show a success message to the user
                $w("#successMessage").show(); // Show a success message (if you have one)
            })
            .catch((error) => {
                console.error("Failed to send email:", error); // Log error if sending fails
                console.log("Attempting to send cancellation email to:", appointment.email);

                // Optionally, show an error message to the user
                $w("#errorMessage").show(); // Show an error message (if you have one)
            });

                // Send an email notification to the rescheduled patient
                
                console.log(`Email sent to ${appointment.patientName} about the reschedule.`);
            } else {
                console.log(`No available time slots to reschedule appointment for ${appointment.patientName}.`);

                $w("#errorMessage").text = "No available time slot for rescheduling a priority 2 patient.";
                //$w("#errorMessage").show();
                

            //const email = appointment.email; // Get the email from the input field

            console.log("Sending email to:", appointment.emailId); // Log the email being sent

            // Call the send function from EmailJS
            send("service_thcw512", "template_zoz8mim", {
                to_email: appointment.emailId,
                to_name : appointment.patientName,
                to_time: appointment.appointmentTime,
                to_date:appointment.appointmentDate,
                to_doctor:nearestSlot.doctorName,
            }, "SEjpc5WG8kIxzzuqG") // Your EmailJS public key
            .then(() => {
                console.log("Email sent successfully!"); // Log success message
                // Optionally, show a success message to the user
                //$w("#successMessage").show(); // Show a success message (if you have one)
            })
            .catch((error) => {
                console.error("Failed to send email:", error); // Log error if sending fails
                // Optionally, show an error message to the user
                $w("#errorMessage").show(); // Show an error message (if you have one)
            });
                
                appointment.appointmentTime = "Cancelled"; 
                appointment.appointmentDate = "Cancelled";
                await wixData.update("Appointments", appointment);
                console.log(`Email sent to ${appointment.emailId} about the cancellation.`);
            }
        }
    }

        else{
            console.log("No priority 2 patient in this time. So no rescheduling.");
        }
        try {
            await wixData.insert("Appointments", {
                patientName: userName,
                age: userAge,
                doctorSpecialization: specialtyName,
                appointmentDate: date,
                appointmentTime: time,
                doctorName,
                doctorId,
                priority: 1,
                isEmergency: true,
                emailId: email
            });

            $w("#successMessage").text = "Emergency appointment booked successfully!";
            //$w("#successMessage").show();
            $w("#errorMessage").hide();
            wixLocation.to(`/success-page?doctorName=${doctorName}&appointmentDate=${date}&appointmentTime=${time}&patientName=${userName}&emailId=${email}`);
        } catch (error) {
            console.error("Error booking appointment:", error);
            $w("#errorMessage").text = "Error booking appointment. Please try again.";
            $w("#errorMessage").show();
        }
    } else {
        $w("#errorMessage").text = "Could not find an available slot for the requested time.";
        $w("#errorMessage").show();
    }
    
}


async function findNextAvailableTimeSlot(selectedTime, availableTimes,date,selectedDoctor) {
    const selectedIndex = availableTimes.indexOf(selectedTime);
    
    if (selectedIndex === -1) {
        console.log("Selected time not found in available times.");
        return null; // No slot found if the selected time is not in available times
    }

    // Loop through available times starting from the next slot after the selected time
    for (let i = selectedIndex + 1; i < availableTimes.length; i++) {
        const nextTimeSlot = availableTimes[i];
        
        // Query the Appointments database to check if this slot is already booked
        const isSlotBooked = await wixData.query("Appointments")
            .eq("appointmentTime", nextTimeSlot)
            .eq("appointmentDate", date)
            .eq("doctorName", selectedDoctor)
            .find();

        if (isSlotBooked.items.length === 0) {
            // If no appointment exists for this slot, it's available
            console.log(`Next available time slot found: ${nextTimeSlot}`);
            return nextTimeSlot;
        } else {
            console.log(`Time slot ${nextTimeSlot} is already booked.`);
        }
        
    }
    
    console.log("No available time slots found after rescheduling.");
    return null; // No available slot found if all subsequent times are booked
}


async function findNearestAvailableSlotP1(doctorsList, date, requestedTime) {
    const allSlots = [];

    let [requestedHours, requestedMinutes] = requestedTime.split(":").map(Number);
    let requestedDateTime = new Date();
    requestedDateTime.setHours(requestedHours, requestedMinutes);

    for (let doctor of doctorsList) {
        const doctorId = doctor._id;
        console.log(`Checking availability for Doctor ${doctor.doctorName}, ${doctorId}...`);

        const availabilityQuery = await wixData.query("DoctorAvailability")
            .eq("doctorId", doctorId)
            .find();

        if (availabilityQuery.items.length === 0) {
            console.log(`No availability data for Doctor ${doctor.doctorName}.`);
            continue;
        }

        const availability = availabilityQuery.items[0];
        const availableDates = availability.availableDates;
        const availableTimeSlots = availability.timeSlots;

        if (availableDates.includes(date)) {
            console.log(`Doctor ${doctor.doctorName} is available on ${date}.`);

            for (let time of availableTimeSlots) {
                let [slotHours, slotMinutes] = time.split(":").map(Number);
                let slotDateTime = new Date();
                slotDateTime.setHours(slotHours, slotMinutes);

                if (slotDateTime > requestedDateTime) {
                    let timeDifference = slotDateTime.getTime() - requestedDateTime.getTime();
                
                 if (timeDifference <= 30 * 60 * 1000) {  // 30 minutes in milliseconds
                        allSlots.push({
                            doctorId,
                            doctorName: doctor.doctorName,
                            date,
                            time,
                            timeDifference
                });
                 }
            }
        }
    }
    }

    allSlots.sort((a, b) => a.timeDifference - b.timeDifference);
    console.log("All potential slots sorted by time difference:");
    console.log(allSlots);
    for (let slot of allSlots) {
        const conflictQuery = await wixData.query("Appointments")
            .eq("doctorName", slot.doctorName)
            .eq("appointmentDate", slot.date)
            .eq("appointmentTime", slot.time)
            .eq("priority", 1)
            .find();

        if (conflictQuery.items.length === 0) {
            console.log(`Nearest available slot found: Doctor ${slot.doctorName} at ${slot.time}`);
             const availabilityQuery = await wixData.query("DoctorAvailability")
                .eq("doctorId", slot.doctorId)
                .find();
                
            if (availabilityQuery.items.length > 0) {
                const availability = availabilityQuery.items[0];
                const availableDocTimeSlots = availability.timeSlots;
                console.log(`Available time slots for Doctor ${slot.doctorName} on ${slot.date}:`, availableDocTimeSlots);
            return { doctorName: slot.doctorName, doctorId: slot.doctorId, date: slot.date, time: slot.time,  availableTimeSlots: availableDocTimeSlots };
        } else {
            console.log(`Conflict found for Doctor ${slot.doctorName} at ${slot.time}, checking next slot...`);
        }
        }
    }

    console.log("No available slots found for the requested time.");
    return null;
}
