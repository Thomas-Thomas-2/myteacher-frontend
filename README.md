# MyTeacher — Front-end

## Summary
- **Project type**: Web application
- **Status**: MVP
- **Built with**: React, Next.js
- **Purpose**: To help independent teachers to manage their daily business.

## Overview
This repository contains the frontend of the project **MyTeacher**.
This project is an end of training bootcamp project, developed during two weeks by a team of 4 developers.
The front-end provides two user journeys : one for teachers and one for students.

## Main features
- User authentication
- Students management
- Teaching ressources management and sharing
- Planning to manage lessons
- Invoices management
- Chat service

## Tech Stack
- React
- Next.js
- Redux / Redux Toolkit
- CSS Modules
- Others : moment.js, react-big-calendar...

## Prerequisites
Before running the project locally, make sure you also got the back-end code running.
See back-end repository for more information : https://github.com/Thomas-Thomas-2/myteacher-backend.git

## Installation and local launch
Clone the repository and install dependencies:
git clone https://github.com/Thomas-Thomas-2/myteacher-frontend.git
cd myteacher-frontend
npm install OR yarn install
npm run dev OR yarn dev

The application will be available at: http://localhost:3001

## Environnement variables
Create a .env.local .
For local launch, set :
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

## Deployement
This front-end is deployed on Vercel : https://myteacher-frontend-three.vercel.app/

## Demo


## Future improvements
- To improve responsive design ;
- To allow teachers to define availability time slot for lessons booking ;
- To allow students to directly book additional lessons ;
- To implement payment online for students ;
- Creating of recurring events...

