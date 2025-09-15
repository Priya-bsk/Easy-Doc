import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    // Get the specialty from the URL parameter
    const specialtyName = wixLocation.query.specialty;

    if (specialtyName) {
        // Query Specialities collection to find the matching specialty ID
        wixData.query("Specialties")
            .eq("name", specialtyName)
            .find()
            .then((specialtyResults) => {
                if (specialtyResults.items.length > 0) {
                    const specialtyId = specialtyResults.items[0]._id;
                    console.log("Specialty ID found:", specialtyId);

                    // Use specialty ID to query Doctors collection
                    return wixData.query("Doctors")
                        .eq("specialty", specialtyId)
                        .find();
                } else {
                    console.log("No matching specialty found.");
                    return Promise.reject("Specialty not found");
                }
            })
            .then((doctorResults) => {
                if (doctorResults.items.length > 0) {
                    $w("#repeaterDoctors").data = doctorResults.items;

                    // Set up the onItemReady event for the Repeater
                    $w("#repeaterDoctors").onItemReady(($item, itemData) => {
                        console.log("Doctor name being set:", itemData.doctorName);
                        // Display the doctor's name
                        $item("#doctorsNameText").text = itemData.doctorName;
                        $item("#bio").text = itemData.bio
                        // Redirect to the booking page with the doctor's name in the URL
                        $item("#bookNowButton").onClick(() => {
                            wixLocation.to(`/booking-page?doctorName=${itemData.doctorName}`);
                        });
                    });
                } else {
                    console.log("No doctors found for this specialty.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    } else {
        console.log("No specialty selected.");
    }
});



