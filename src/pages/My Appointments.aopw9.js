import { session } from 'wix-storage';
import wixData from 'wix-data';

$w.onReady(() => {
    const email = session.getItem("userName"); // Retrieve user's email from session storage

    if (email) {
        $w("#appointmentsDataset").setFilter(
            wixData.filter().eq("emailId", email)
        )
        .then(() => {
            console.log("Dataset filtered by email:", email);
        })
        .catch((error) => {
            console.error("Error filtering dataset:", error);
        });
    } else {
        console.warn("Email not found in session storage.");
    }
});
