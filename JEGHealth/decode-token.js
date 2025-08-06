/**
 * Token decoder utility
 * Run with: node decode-token.js
 */

// Get token from AsyncStorage
const getAndDecodeToken = async () => {
  try {
    // You would need to implement this part to read from AsyncStorage
    console.log("=== Manual JWT Token Decoder ===");
    console.log("To use:");
    console.log("1. Get your token from AsyncStorage");
    console.log("2. Replace YOUR_TOKEN_HERE with your actual token");
    console.log("3. Run: node decode-token.js\n");

    // Replace with your token (for testing)
    const token = "YOUR_TOKEN_HERE";
    if (!token || token === "YOUR_TOKEN_HERE") {
      console.log("No token provided. Replace YOUR_TOKEN_HERE with an actual token.");
      return;
    }

    // Parse the token
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Invalid JWT format");
      return;
    }

    // Decode the payload
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      
      console.log("=== Decoded JWT Payload ===");
      console.log(JSON.stringify(payload, null, 2));

      // Check for ID fields
      console.log("\n=== Possible ID Fields ===");
      const idFields = ["id", "sub", "user_id", "pk", "uid", "uuid", "jti"];
      idFields.forEach(field => {
        if (payload[field]) {
          console.log(`${field}: ${payload[field]}`);
        }
      });

      console.log("\nTo use this ID in your app:");
      console.log("const userId = user?.id || user?.sub || user?.user_id || user?.uid;");
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Run the function
getAndDecodeToken();
