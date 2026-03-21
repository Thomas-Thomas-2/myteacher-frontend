# MyTeacher — Frontend

## Summary
- **Project type**: Web application
- **Status**: MVP
- **Built with**: React, Next.js
- **Purpose**: To help independent teachers to manage their daily business.

## Overview
This repository contains the frontend of the project **MyTeacher**. <br>
This project is a bootcamp final project developed in two weeks by a team of four developers. <br>
The front-end provides two user journeys : one for teachers and one for students.

## Main features
- User authentication
- Students management
- Teaching ressources management and sharing
- Planning to manage lessons
- Invoices management
- Real-time chat service

## Tech Stack
- React
- Next.js
- Redux / Redux Toolkit
- CSS Modules
- Others : moment.js, react-big-calendar.

## Prerequisites
Before running the project locally, make sure the backend is installed and running. <br>
See backend repository for more information : https://github.com/Thomas-Thomas-2/myteacher-backend.git

## Installation and local launch
Clone the repository and install dependencies: <br>
git clone https://github.com/Thomas-Thomas-2/myteacher-frontend.git <br>
cd myteacher-frontend <br>
npm install <br>
npm run dev <br>

## Environment variables
Create a .env.local at the root of the project. <br>
For local launch, set : <br>
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

## Deployement
This frontend is deployed on Vercel : https://myteacher-frontend-three.vercel.app/

## Demo
Watch the demonstration : <br>
[![Watch the demonstration](./public/Capture_Accueil.png)](https://player.cloudinary.com/embed/?cloud_name=dedeskvc6&public_id=MyTeacher_1_ip6zmh)

## Future improvements
- To improve responsive design ;
- To allow teachers to define availability time slot for lessons booking ;
- To allow students to directly book additional lessons ;
- To implement payment online for students ;
- Creating recurring events...

