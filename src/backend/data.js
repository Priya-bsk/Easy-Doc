// backend/data.js

import wixData from 'wix-data';

export function Appointments_beforeInsert(item, context) {
    const { appointmentDate, appointmentTime, doctorName, priority } = item;

    // Query the Appointments collection to check for existing booking conflicts
    return wixData.query("Appointments")
        .eq("appointmentDate", appointmentDate)
        .eq("appointmentTime", appointmentTime)
        .eq("doctorName", doctorName)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                const existingAppointment = results.items[0];
                
                if (priority === 1 && existingAppointment.priority === 2) {
                    // Overwrite the priority 2 appointment with the new priority 1 appointment
                
                } else if (priority === existingAppointment.priority || existingAppointment.priority === 1) {
                    
                    return Promise.reject("Sorry. This time slot is already booked with the selected doctor. Please choose another time slot.");
                }
            }
            // If no conflicting appointments or priority rules allow overwrite, allow the booking to proceed
            return item;
        })
        .catch((error) => {
            console.error("Error checking for double booking: ", error);
            throw new Error("This time slot is already booked with the selected doctor.");
        });
}




/***************
 backend/data.js
 ***************

 'backend/data.js' is a reserved Velo file that enables you to create data hooks.

 A data hook is an event handler (function) that runs code before or after interactions with your site's database collections. 
 For example, you may want to intercept an item before it is added to your collection to tweak the data or to perform a final validation.

 Syntax for functions:

  export function [collection name]_[action](item, context){}

 Example: 

  export function myCollection_beforeInsert(item, context){}

 ---
 More about Data Hooks: 
 https://support.wix.com/en/article/velo-about-data-hooks

 Using Data Hooks: 
 https://support.wix.com/en/article/velo-using-data-hooks

 API Reference: 
 https://www.wix.com/velo/reference/wix-data/hooks

***************/


