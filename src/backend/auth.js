import { authentication } from 'wix-users-backend';
import wixData from 'wix-data';

export async function registerUser(name, email, password) {
    try {
        // Register the user
        let user = await authentication.register(email, password, { contactInfo: { name } });

        // Prepare the data for the "User Registration" database
        const userData = {
            name: name,
            email: email,
            userId: user.id, // optional: if you want to store the user's Wix ID
        };

        // Insert the new user into the "User Registration" database
        await wixData.insert('User Registration', userData);
        
        return user;
    } catch (error) {
        return { error: error.message };
    }
}
