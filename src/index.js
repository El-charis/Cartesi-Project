// Import the ethers library for handling Ethereum-related functionality
const { ethers } = require("ethers");

// Get the rollup server URL from environment variables
const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

// Convert a hex string to a UTF-8 string
function hex2str(hex) {
  return ethers.utils.toUtf8String(hex);
}

// Convert a UTF-8 string to a hex string
function str2hex(payload) {
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(payload));
}

// Validate if a skill is a non-empty string
function isValidSkill(skill) {
  return typeof skill === 'string' && skill.trim() !== '';
}

// Objects to store the skills offered and requested by users
let skillOffers = {}; // Object to track skills offered by users
let skillRequests = {}; // Object to track skills requested by users

// Handle incoming advance requests (offering or requesting skills)
async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const metadata = data["metadata"];
  const sender = metadata['msg_sender']; // Get the sender's address
  const payload = data["payload"];
  
  let { action, skill } = JSON.parse(hex2str(payload)); // Parse the payload as JSON
  
  // Validate the skill name
  if (!isValidSkill(skill)) {
    // Report invalid skill name to the rollup server
    const report_req = await fetch(`${rollup_server}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: str2hex("Invalid skill name") }),
    });
    return "reject";
  }
  
  // Update skillOffers or skillRequests based on the action type
  if (action === "offer") {
    if (!skillOffers[sender]) {
      skillOffers[sender] = [];
    }
    if (!skillOffers[sender].includes(skill)) {
      skillOffers[sender].push(skill);
    }
  } else if (action === "request") {
    if (!skillRequests[sender]) {
      skillRequests[sender] = [];
    }
    if (!skillRequests[sender].includes(skill)) {
      skillRequests[sender].push(skill);
    }
  } else {
    // Report invalid action type to the rollup server
    const report_req = await fetch(`${rollup_server}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: str2hex("Invalid action type") }),
    });
    return "reject";
  }
  
  // Notify the rollup server that the skill action was recorded
  const notice_req = await fetch(`${rollup_server}/notice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex("Skill action recorded") }),
  });
  return "accept";
}

// Handle incoming inspect requests (querying skill information)
async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  const payload = data["payload"];
  
  const route = hex2str(payload); // Decode the payload
  let responseObject = {};
  
  // Handle different routes for inspecting skill data
  if (route === "offered_skills") {
    responseObject = JSON.stringify(skillOffers); // List of skills offered by users
  } else if (route === "requested_skills") {
    responseObject = JSON.stringify(skillRequests); // List of skills requested by users
  } else if (route.startsWith("skills_by_user:")) {
    const user = route.split(":")[1]; // Extract the username from the route
    if (skillOffers[user] || skillRequests[user]) {
      responseObject = JSON.stringify({
        offered: skillOffers[user] || [], // Skills offered by the user
        requested: skillRequests[user] || [] // Skills requested by the user
      });
    } else {
      responseObject = JSON.stringify({ error: "User not found" });
    }
  } else {
    responseObject = "route not implemented"; // Handle unknown routes
  }
  
  // Report the inspection results to the rollup server
  const report_req = await fetch(`${rollup_server}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(responseObject) }),
  });
  
  return "accept";
}

// Handlers for different request types
var handlers = {
  advance_state: handle_advance, // Handle advance state requests
  inspect_state: handle_inspect, // Handle inspect state requests
};

var finish = { status: "accept" };

// Main loop to poll the rollup server for requests
(async () => {
  while (true) {
    try {
      // Poll the rollup server for the finish status
      const finish_req = await fetch(`${rollup_server}/finish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "accept" }),
      });

      console.log("Received finish status " + finish_req.status);

      if (finish_req.status === 202) {
        // No pending rollup requests, retry after a delay
        console.log("No pending rollup request, trying again");
      } else {
        // Process the rollup request
        const rollup_req = await finish_req.json();
        const handler = handlers[rollup_req["request_type"]];
        if (handler) {
          finish["status"] = await handler(rollup_req["data"]);
        } else {
          console.error("Unknown request type:", rollup_req["request_type"]);
          finish["status"] = "reject";
        }
      }
    } catch (error) {
      // Handle errors during request processing
      console.error("Error processing request:", error);
      finish["status"] = "reject";
    }
    // Wait for 5 seconds before the next polling
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
  }
})();
