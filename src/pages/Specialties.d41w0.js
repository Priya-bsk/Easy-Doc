import wixLocation from 'wix-location';

$w.onReady(function () {
    // Set up click event for each item in the Repeater
    $w('#repeaterSpecialties').onItemReady(($item, itemData) => {
        // Display the specialty name
        $item('#specialtyNameText').text = itemData.name;

        // Handle the View Doctors button click
        $item('#viewDoctorsButton').onClick(() => {
            // Redirect to the Doctors Page with a specialty parameter in the URL
            wixLocation.to(`/doctors-page?specialty=${itemData.name}`);
        });
    });
});

