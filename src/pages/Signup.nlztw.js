import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';

$w.onReady(function () {
});

$w('#signupButton').onClick((event) => {
        // Get the entered values
    const name = $w('#nameInput').value;           // Ensure this matches your input field ID
    const email = $w('#emailInput').value;         // Ensure this matches your input field ID
    const password = $w('#passwordInput').value;   // Ensure this matches your input field ID

    console.log("Name:", name);   // Log the entered name
    console.log("Email:", email);  // Log the entered email
    console.log("Password:", password); // Log the entered password

    // Clear any previous error messages
    $w('#errorText').hide(); // Hide error text initially

    // Create an object to store user details
    const userDetails = {
        name: name,
        email: email,
        password: password
    };

    // Check for existing email to prevent duplicates
    wixData.query('UserLogin')
        .eq('email', email)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                // Email already exists, show error message
                $w('#errorText').text = "This email is already registered. Please use another one.";
                $w('#errorText').show(); // Show the error message
            } else {
                // Add new user to the UserLogin database
                wixData.insert('UserLogin', userDetails)
                    .then(() => {
                        console.log("User registered successfully");
						 session.setItem("userName", email);
                        wixLocation.to('/'); // Redirect to homepage after successful signup
                    })
                    .catch((error) => {
                        console.error("Error signing up", error);
                        $w('#errorText').text = "An error occurred. Please try again.";
                        $w('#errorText').show(); // Show the error message
                    });
            }
        })
        .catch((error) => {
            console.error("Error checking for existing email", error);
            $w('#errorText').text = "An error occurred. Please try again.";
            $w('#errorText').show(); // Show the error message
        });


})