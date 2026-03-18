import axios from "axios";

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcpTyuGU1pQTfAfIRKE103gu79vjJNgEOVdSsjvChZPVtQuQeU38vzcVZcgO6Xr-Fi/exec';

export const handler = async (event: any) => {
  console.log("Incoming request:", event.httpMethod, event.path);
  
  // Extract the path after /api/ or /.netlify/functions/api/
  let path = event.path;
  if (path.startsWith("/.netlify/functions/api")) {
    path = path.replace("/.netlify/functions/api", "");
  } else if (path.startsWith("/api")) {
    path = path.replace("/api", "");
  }
  
  // Normalize path (remove leading/trailing slashes)
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  console.log("Normalized path:", normalizedPath);
  
  try {
    // Handle Search (GET /api/students)
    if (event.httpMethod === "GET" && normalizedPath === "students") {
      const query = event.queryStringParameters?.q || "";
      console.log("Searching for:", query);
      const response = await axios.get(`${APPS_SCRIPT_URL}?q=${encodeURIComponent(query)}`);
      
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
        body: JSON.stringify(response.data),
      };
    }
    
    // Handle Submit (POST /api/submit)
    if (event.httpMethod === "POST" && normalizedPath === "submit") {
      console.log("Submitting data:", event.body);
      const response = await axios.post(APPS_SCRIPT_URL, event.body, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(response.data),
      };
    }

    console.log("Path not found:", normalizedPath);
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Path not found: " + normalizedPath }),
    };
    
  } catch (error: any) {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
