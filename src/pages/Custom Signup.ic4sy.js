import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';

// Event handler for the signup button
export function signupButton_click(event) {
   event.preventDefault(); // Prevent default form submission

   // Retrieve input values
   const email = $w('#emailInput').value;
   const password = $w('#passwordInput').value;
   const name = $w('#nameInput').value;

   // Register the user in Wix's authentication system
   wixUsers.register(email, password, {
      contactInfo: {
         firstName: name,
      }
   })
   .then(() => {
      // Store user information in UserLogin collection
      wixData.insert('UserLogin', {
         name: name,
         email: email,
         password: password // Ideally, hash the password before storing
      })
      .then(() => {
         // Redirect to login page or show success message
         $w('#successText').text = "Signup successful! Redirecting to login...";
         wixLocation.to('/login'); // Change to your login page
      })
      .catch((error) => {
         console.error("Failed to save user data", error);
         $w('#errorText').text = "Error saving data. Please try again.";
      });
   })
   .catch((error) => {
      console.error("Signup failed", error);
      $w('#errorText').text = "Signup failed. Please try again.";
   });
}
