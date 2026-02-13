// Test Role-Based Authentication
// Run this in browser console or as a Node.js script

const testRoleAuth = async () => {
  const baseUrl = 'http://localhost:5001/api/auth';
  
  console.log('🧪 Testing Role-Based Authentication...\n');
  
  // Test Case 1: User trying to login as Manager (should fail)
  console.log('Test 1: User account trying to login as Manager');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com', // Assuming this is a user account
        password: 'password123',
        role: 'manager'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message);
    console.log('Expected: Should fail with 403 status\n');
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test Case 2: Manager trying to login as User (should fail)
  console.log('Test 2: Manager account trying to login as User');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@example.com', // Assuming this is a manager account
        password: 'password123',
        role: 'user'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message);
    console.log('Expected: Should fail with 403 status\n');
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test Case 3: User logging in as User (should succeed)
  console.log('Test 3: User account logging in as User');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message || 'Login successful');
    console.log('Expected: Should succeed with 200 status\n');
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test Case 4: Manager logging in as Manager (should succeed)
  console.log('Test 4: Manager account logging in as Manager');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@example.com',
        password: 'password123',
        role: 'manager'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message || 'Login successful');
    console.log('Expected: Should succeed with 200 status\n');
  } catch (error) {
    console.log('Error:', error.message);
  }
};

// Uncomment to run the test
// testRoleAuth();