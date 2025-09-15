import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(function () {
    // Retrieve the email from session storage
    const userEmail = session.getItem("userName");

    // Check if user is logged in
    if (userEmail) {
        // Query the UserLogin database to fetch user details
        wixData.query('UserLogin')
            .eq('email', userEmail) // Search by the email stored in the session
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    const user = results.items[0]; // The user record

                    // Display the user's information
                    $w('#nameText').text = `Name: ${user.name}`;
                    $w('#emailText').text = `Email: ${user.email}`;
                } else {
                    console.error("No user found with this email.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user details", error);
            });
    } else {
        // Optionally, redirect to login page if no user is logged in
        wixLocation.to('/login');
    }
});
