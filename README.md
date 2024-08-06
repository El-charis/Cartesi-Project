# Cartesi Rollups Skill Management Application

This project demonstrates a skill management application using Cartesi Rollups for handling and processing skill offers and requests. The application utilizes Ethereum-related functionality through the `ethers` library to manage skills offered and requested by users.

## Overview

- **Backend Requirements:** The backend must use Cartesi Rollups APIs.
- **Technology Stack:**
  - Node.js
  - npm
  - ethers.js library
  - Cartesi Cli
  - Cartesi Rollups APIs
  - Docker Desktop

## Setup Instructions

1. **Install Node.js:**
   Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

2. **Install Dependencies:**
   Navigate to your project directory and run:
   npm install

3. **Install Docker Desktop:**
    Ensure Docker Desktop is installed and running. You can download it from docker.com.

4. **install Cartesi cli**

5. **Install Cartesi SDK**
    Install Cartesi SDK globally if not already installed:
    npm install -g @cartesi/rollups

 ### Environment Variables:
Set the ROLLUP_HTTP_SERVER_URL environment variable to the URL of your Cartesi Rollups server. You can create a .env file in your project root with the following content:

ROLLUP_HTTP_SERVER_URL=https://your-rollup-server-url

## Build the Rollup:
Use Cartesi SDK to build your rollup:
**cartesi build**

## Run the Rollup:
Start the rollup using Cartesi SDK:
**cartesi run** 

## Endpoints
The DApp interacts with a rollup server and provides the following endpoints:

**POST /finish**
Description: Polls for the status of pending rollup requests.
Request Body:

{
  "status": "accept"
}

**POST /report**
Description: Sends a report to the rollup server.
Request Body:


{
  "payload": "hex_encoded_string"
}

**POST /notice**
Description: Sends a notice to the rollup server.
Request Body:

{
  "payload": "hex_encoded_string"
}

## Handling Requests
advance_state
Description: Handles requests to offer or request skills.
Payload Format:

{
  "action": "offer" or "request",
  "skill": "skill_name"
}
**Responses**:
"accept": Skill action recorded successfully.
"reject": Invalid skill name or action type.
inspect_state
Description: Handles requests to inspect the state of skills.

**Payload Format**:
"offered_skills": Returns a list of all skills offered by users.
"requested_skills": Returns a list of all skills requested by users.
"skills_by_user:<user>": Returns the skills offered and requested by a specific user.

**Responses**:
JSON object containing the relevant skill data.
"route not implemented": If the route is not recognized.
## Testing
**Simulate Requests**
Use tools like Postman or cURL to send HTTP requests to the rollup server endpoints and verify the DApp’s behavior. Make sure to send requests to the correct endpoints with appropriate payloads.

## Notes
Ensure your backend implementation is compatible with Cartesi Rollups APIs.
The application periodically polls the Cartesi Rollups server and processes requests accordingly.

## Troubleshooting
No Pending Rollup Requests: The application retries if there are no pending requests.
Error Handling: Errors during request processing are logged for debugging.
## Contributing
Feel free to contribute to this project by submitting issues or pull requests and check out cartesi docs for more info.
