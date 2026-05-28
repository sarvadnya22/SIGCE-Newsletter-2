setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password' })
    });
    const data = await res.json();
    console.log('Registration response:', data);
  } catch (err) {
    console.error('Registration failed:', err.message);
  }
}, 5000); 
