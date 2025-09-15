# Optimising Scheduling Algorithm in Telemedicine

[![Platform](https://img.shields.io/badge/platform-Wix%20Velo-green)](https://www.wix.com/velo)  [![Status](https://img.shields.io/badge/status-Prototype-orange)]()

A telemedicine appointment booking system that integrates **Operating System scheduling algorithms (FCFS & Priority Scheduling)** to manage healthcare appointments efficiently. Built on **Wix Velo + JavaScript**, the system ensures **fair scheduling, emergency handling, and conflict-free slot booking**.

---

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Data Model](#data-model)  
- [Scheduling Logic](#scheduling-logic)  
- [Deployment & Testing](#deployment--testing)
- [Git Integration & Wix CLI](#git-integration--wix-cli)

---

## Overview

Traditional appointment booking systems often fail under high load, especially when **emergency cases** arise. This project adapts **OS-inspired scheduling techniques** to balance **fairness, responsiveness, and reliability** in a telemedicine context.

- **FCFS (First-Come-First-Served)** for regular patients.  
- **Preemptive Priority Scheduling** for emergencies.  
- **Slot Locking** to prevent double-booking during concurrent requests.  
- **Conflict Detection & Notifications** for robust patient experience.  

---

## Features

### 1. First-Come-First-Served (FCFS) Scheduling
- **What it does:** Handles regular appointments strictly in the order received.  
- **Why it matters:** Ensures fairness and prevents queue-jumping.  
- **OS Analogy:** Mirrors **FCFS CPU scheduling**. 


### 2. Preemptive Priority Scheduling
- **What it does:** Assigns higher priority to emergency cases (`priority = 1`).  
- **Why it matters:** Guarantees urgent patients are never delayed by routine cases.  
- **OS Analogy:** Same as **Priority Scheduling with Preemption**.  



### 3. Slot Locking (Multithreading Simulation)
- **What it does:** Temporarily locks slots to prevent race conditions during concurrent bookings.  
- **Why it matters:** Prevents double-booking under high traffic.  
- **OS Analogy:** Equivalent to **Mutex Locks / Semaphores**.  



### 4. Automatic Rescheduling
- **What it does:** Moves displaced (priority-2) appointments to the next available slot or cancels if none exist.  
- **Why it matters:** Reduces patient disruption while prioritizing emergencies.  
- **OS Analogy:** Similar to **Process Preemption + Requeueing**.  



### 5. Real-Time Conflict Detection
- **What it does:** Database hooks check for slot clashes before confirming bookings.  
- **Why it matters:** Maintains integrity under concurrent access.  
- **OS Analogy:** Comparable to **Deadlock Avoidance / Safety Checks**.  



### 6. Patient Notifications
- **What it does:** Sends confirmation emails and reschedule alerts.  
- **Why it matters:** Builds transparency and trust.  
- **OS Analogy:** Functions like **Process Signals / Interrupts**.  



### 7. End-to-End Booking Flow
- **What it does:** Guides patients through: *Specialties → Doctor → Slot → Booking → Confirmation*.  
- **Why it matters:** Streamlines patient journey.  
- **OS Analogy:** Comparable to the **Process Life Cycle**.  

---

## Tech Stack

- **Frontend:** Wix Editor (Specialties → Doctors → Booking → Success pages)  
- **Backend:** Velo by Wix (JavaScript)  
- **Database:** Wix Collections  
- **Notifications:** Wix Email Functions  

---

## Data Model

| Collection         | Key Fields                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Doctors**        | `doctorName`, `specialty`, profile info                                     |
| **Availability**   | `doctorId`, `availableDates`, `timeSlots`                                  |
| **Appointments**   | `doctorId`, `appointmentDate`, `appointmentTime`, `patientName`, `priority` |
| **multi (Locks)**  | `doctorName`, `appointmentDate`, `appointmentTime`, `isLocked`             |

---

## Scheduling Logic

1. **Regular Appointments (FCFS):**  
   - Inserted with `priority = 2`.  
   - Booked if slot is free and not locked.  

2. **Emergency Appointments (Priority = 1):**  
   - Preempts regular appointments.  
   - If emergency slot occupied → booking rejected.  

3. **Slot Locking:**  
   - Locks stored in `multi` collection.  
   - Auto-expire (default: 5 min).  

4. **Conflict Handling:**  
   - Database hooks prevent bypassing client-side checks.  

5. **Rescheduling:**  
   - Displaced patients notified and moved to next available slot. 

---



## Deployment & Testing

1. Enable **Velo** in Wix project.  
2. Create collections: `Doctors`, `DoctorAvailability`, `Appointments`, `multi`.  
3. Add backend **data hooks** for conflict prevention.  
4. Build frontend **booking flow pages**.  
5. Test key scenarios:
   - Two users booking the same slot.  
   - Emergency preempting a regular booking.  
   - Lock expiration and slot release.  

---





## Git Integration & Wix CLI 
### <img align="left" src="https://user-images.githubusercontent.com/89579857/185785022-cab37bf5-26be-4f11-85f0-1fac63c07d3b.png">

This repo is part of Git Integration & Wix CLI, a set of tools that allows you to write, test, and publish code for your Wix site locally on your computer. 

Connect your site to GitHub, develop in your favorite IDE, test your code in real time, and publish your site from the command line.

### Set up this repository in your IDE
This repo is connected to a Wix site. That site tracks this repo's default branch. Any code committed and pushed to that branch from your local IDE appears on the site.

Before getting started, make sure you have the following things installed:
* [Git](https://git-scm.com/download)
* [Node](https://nodejs.org/en/download/), version 14.8 or later.
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://yarnpkg.com/getting-started/install)
* An SSH key [added to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).

To set up your local environment and start coding locally, do the following:

1. Open your terminal and navigate to where you want to store the repo.
1. Clone the repo by running `git clone <your-repository-url>`.
1. Navigate to the repo's directory by running `cd <directory-name>`.
1. Install the repo's dependencies by running `npm install` or `yarn install`.
1. Install the Wix CLI by running `npm install -g @wix/cli` or `yarn global add @wix/cli`.  
   Once you've installed the CLI globally, you can use it with any Wix site's repo.

For more information, see [Setting up Git Integration & Wix CLI](https://support.wix.com/en/article/velo-setting-up-git-integration-wix-cli-beta).

## Write Velo code in your IDE
Once your repo is set up, you can write code in it as you would in any other non-Wix project. The repo's file structure matches the [public](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#public), [backend](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#backend), and [page code](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#page-code) sections in Editor X.

Learn more about [this repo's file structure](https://support.wix.com/en/article/velo-understanding-your-sites-github-repository-beta).

## Test your code with the Local Editor
The Local Editor allows you test changes made to your site in real time. The code in your local IDE is synced with the Local Editor, so you can test your changes before committing them to your repo. You can also change the site design in the Local Editor and sync it with your IDE.

Start the Local Editor by navigating to this repo's directory in your terminal and running `wix dev`.

For more information, see [Working with the Local Editor](https://support.wix.com/en/article/velo-working-with-the-local-editor-beta).

## Preview and publish with the Wix CLI
The Wix CLI is a tool that allows you to work with your site locally from your computer's terminal. You can use it to build a preview version of your site and publish it. You can also use the CLI to install [approved npm packages](https://support.wix.com/en/article/velo-working-with-npm-packages) to your site.

Learn more about [working with the Wix CLI](https://support.wix.com/en/article/velo-working-with-the-wix-cli-beta).

## Invite contributors to work with you
Git Integration & Wix CLI extends Editor X's [concurrent editing](https://support.wix.com/en/article/editor-x-about-concurrent-editing) capabilities. Invite other developers as collaborators on your [site](https://support.wix.com/en/article/inviting-people-to-contribute-to-your-site) and your [GitHub repo](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository). Multiple developers can work on a site's code at once.
