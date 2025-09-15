import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { session } from 'wix-storage'; // For session management

$w.onReady(function () {
    // Check if the user is logged in
    const userName = session.getItem("userName");

    if (userName) {
        // Show profile icon and hide login/signup buttons
        $w('#profileIcon').show(); // Ensure profile icon is visible
        $w('#myAccount').show();
        $w('#logoutButton').show();
        $w('#loginButton').hide();  // Hide login button
        $w('#signupButtonn').hide(); // Hide signup button

        // Display a welcome message
       
    } else {
        // If not logged in, hide the profile icon
        $w('#profileIcon').hide(); // Hide profile icon
        $w('#logoutButton').hide();
        $w('#loginButton').show();  // Show login button
        $w('#signupButtonn').show(); // Show signup button

        // Optionally, hide welcome message
        
    }

    // When the profile picture is clicked, show user details or perform any action needed
    $w('#profileIcon').onClick(() => {
        // Optionally, redirect to another page or show user details here
        wixLocation.to('/user-account');
        
    });
});

// Logout functionality
export function logoutButton_click(event) {
    session.clear(); // Clear user session data
    wixLocation.to('/'); // Redirect to the homepage after logout
}
$w('#logoutButton').onClick((event) => {
        session.clear(); // Clear user session data
         $w('#profileIcon').hide(); // Hide profile icon
        $w('#logoutButton').hide();
        $w('#loginButton').show();  // Show login button
        $w('#signupButtonn').show(); // Show signup button
    wixLocation.to('/'); // Redirect to the homepage after logout
})
