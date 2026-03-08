# AI-Powered Smart Patient Triage Platform

This platform provides an AI-driven triage system for healthcare centers. It includes a React/TypeScript frontend and a Node.js/Express/MongoDB backend with real-time updates via Socket.io.

## Project Structure

- `/ai-triage-monitor-main`: Frontend React application.
- `/backend`: Node.js Express server.

## Features

- **AI Triage**: Real-time analysis of symptoms and vitals.
- **Role-based Access**: Specific dashboards for Patient, Doctor, Staff, and Admin.
- **Real-time Updates**: Instant notifications for appointments and triage results.
- **Database**: MongoDB for persistent storage.

## How to Run

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `PORT`.
4. `npm run dev`

### Frontend
1. `cd ai-triage-monitor-main`
2. `npm install`
3. `npm run dev`

## Deployment

Ensure `MONGO_URI` and `JWT_SECRET` are set in your production environment.
