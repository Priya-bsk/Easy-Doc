import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindow from 'wix-window'; // Import wixWindow

$w.onReady(function () {
    // Check if user is logged in on page load
    if (wixUsers.currentUser.loggedIn) {
        console.log("User is logged in."); // Log user login status
        $w('#submit').label = "Logout"; // Change button text to Logout if logged in
    } else {
        console.log("User is not logged in."); // Log if user is not logged in
        $w('#submit').label = "Log In"; // Ensure it says Login/Signup when not logged in
    }
});

// Event handler for the Login/Signup button
export function submit_click(event) {
    const email = $w('#email').value; // Your email input field ID
    const password = $w('#password').value; // Your password input field ID

    // Check if the button is currently for logging out
    if ($w('#submit').label === "Logout") {
        // Logout functionality
        wixUsers.logout()
            .then(() => {
                console.log("User logged out successfully."); // Log successful logout
                $w('#submit').label = "Login/Signup"; // Change button text back to Login/Signup
                $w('#email').value = ""; // Clear email input
                $w('#password').value = ""; // Clear password input
                wixWindow.lightbox.close(); // Close the lightbox after logout
            })
            .catch((error) => {
                console.error("Logout failed: ", error);
            });
    } else {
        // Login functionality
        wixData.query("UserLogin") // Ensure this matches your actual collection name
            .eq("email", email)
            .find()
            .then((results) => {
                console.log("Query results: ", results); // Log the query results
                if (results.items.length > 0) {
                    // Email exists, proceed to login
                    console.log("Email found, proceeding with login."); // Log when email is found
                    return wixUsers.login(email, password) // Add return here
                        .then(() => {
                            console.log("Login successful."); // Log successful login
                            $w('#submit').label = "Logout"; // Change button text to Logout only after successful login
                            wixWindow.lightbox.close(); // Close the lightbox on successful login
                        });
                } else {
                    console.log("Email not found."); // Log if email is not found
                    $w('#generalrrMsg').text = "Email not found. Please sign up.";
                    $w('#generalrrMsg').show(); // Show error message if email is not found
                }
            })
            .catch((error) => {
                console.error("Database query failed: ", error);
            });
    }
}

// Attach the event handler
$w('#submit').onClick((event) => {
    submit_click(event);
});
