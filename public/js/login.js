/*eslint-disable */

import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      // If response is not okay, throw an error
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    console.log('Login successful:', data);

    if (data.status === 'success') {
      showAlert('success', 'Logged in Successsssfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const logout = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
      method: 'GET',
      credentials: 'include' // Include cookies with the request
    });

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); // Parse the JSON from the response

    if (data.status === 'success') {
      // Use === for comparison
      location.reload(true); // Force reload from the server
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};
