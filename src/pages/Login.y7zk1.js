import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';

$w('#loginButtonn').onClick((event) => {
   // Get the entered email and password values
   const email = $w('#emailInput').value; 
   const password = $w('#passwordInput').value; 

   console.log("Email:", email);
   console.log("Password:", password); 

   // Clear any previous error messages
   $w('#errorText').hide(); 

   // Query the UserLogin database to check for matching credentials
   wixData.query('UserLogin')
      .eq('email', email)          // Check for matching Email (case-sensitive)
      .eq('password', password)     // Check for matching Password (case-sensitive)
      .find()
      .then((results) => {
         console.log("Query Results:", results); // Log the query results
         if (results.items.length > 0) {
            // Login successful, redirect to homepage
			session.setItem("userName", email);
            console.log("Login successful, redirecting to homepage...");
            wixLocation.to('/'); // Redirect to homepage
         } else {
            // Display error message if no match is found
            $w('#errorText').text = "Invalid email or password. Please try again.";
            $w('#errorText').show(); 
         }
      })
      .catch((error) => {
         console.error("Error logging in", error);
         $w('#errorText').text = "An error occurred. Please try again.";
         $w('#errorText').show(); 
      });
})