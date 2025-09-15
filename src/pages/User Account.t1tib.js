import wixData from 'wix-data';
import { session } from 'wix-storage';

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
                    $w('#emailInput').value = user.email; // Display user's email
                    $w('#passwordInput').value = user.password; // Display user's password (hashed if possible)
                } else {
                    console.warn("User not found in database.");
                }
            })
            .catch((error) => {
                console.error("Error loading user data:", error);
            });
    } else {
        console.warn("No user is logged in.");
    }

    // Save updated user information
    $w('#saveButton').onClick(() => {
        const updatedName = $w('#nameInput').value;
        const updatedEmail = $w('#emailInput').value;
        const updatedPassword = $w('#passwordInput').value;

        // Update user info only if email is in session
        if (email) {
            // Query database for the logged-in user
            wixData.query("UserLogin")
                .eq("email", email)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        const user = results.items[0];
                        user.name = updatedName;      // Update name
                        user.email = updatedEmail;    // Update email
                        user.password = updatedPassword; // Update password

                        // Update the user's information in the database
                        wixData.update("UserLogin", user)
                            .then(() => {
                                console.log("User info updated successfully.");
                                // Optionally show a success message
                                $w('#successText').text = "Information updated successfully!";
                                $w('#successText').show();
                            })
                            .catch((error) => {
                                console.error("Error updating user info:", error);
                                // Optionally show an error message
                                $w('#errorText').text = "Error updating information. Please try again.";
                                $w('#errorText').show();
                            });
                    }
                });
        }
    });
});
