import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import uuid4 from 'uuid4';

const router = express.Router();

// Create room endpoint
router.post('/create-room', async (req, res) => {
  const { roomName } = req.body;

  const managementToken = jwt.sign(
    {
      access_key: process.env.APP_ACCESS_KEY,
      type: 'management',
      version: 2,
      jti: `room-${Date.now()}`, // Adding the jti (JWT ID) claim
    },
    process.env.APP_SECRET,
    { algorithm: 'HS256', expiresIn: '24h' }
  );

  try {
    const response = await axios.post(
      'https://api.100ms.live/v2/rooms',
      {
        name: roomName,
        template_id: process.env.ROOM_TEMPLATE_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data); // Return the room data in the response
  } catch (err) {
    console.error('100ms API error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generate token endpoint
router.post('/get-token', async (req, res) => {
  const { user_id, room_id, role } = req.body;

  function generateToken(room_id, user_id, role) {
    const payload = {
      access_key: process.env.APP_ACCESS_KEY, // Use environment variables
      room_id: room_id,
      user_id: user_id,
      role: role,
      type: 'app', // Application type
      version: 2, // API version
      iat: Math.floor(Date.now() / 1000), // Issued at time
      nbf: Math.floor(Date.now() / 1000), // Not before time
    };

    // Sign the JWT token
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        process.env.APP_SECRET, // Use environment variables
        {
          algorithm: 'HS256', // Signing algorithm
          expiresIn: '24h', // Token expiration time
          jwtid: uuid4(), // Unique JWT ID
        },
        (err, token) => {
          if (err) {
            console.error('Error generating token:', err);
            reject(err); // Reject if there's an error
          } else {
            resolve(token); // Resolve the token if successful
          }
        }
      );
    });
  }

  try {
    // Generate the token for the user
    const token = await generateToken(room_id, user_id, role);

    // Return the generated token to the client
    res.json({ token });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export router at the end of the file
export default router;
