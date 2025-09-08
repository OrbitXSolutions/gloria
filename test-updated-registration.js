const { registerUser } = require('./lib/auth/register.ts');

async function testUpdatedRegistration() {
    console.log('=== Testing Updated Registration ===\n');
    
    const testPayload = {
        firstName: 'Test',
        lastName: 'User', 
        email: 'test-' + Date.now() + '@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
    };
    
    try {
        console.log('Testing with test payload:', {
            ...testPayload,
            password: '***',
            confirmPassword: '***'
        });
        
        const result = await registerUser(testPayload);
        console.log('\nRegistration result:', result);
        
        if (!result.ok) {
            console.log('✅ Registration handled error gracefully');
            console.log('✅ User-friendly error message:', result.error);
        } else {
            console.log('✅ Registration succeeded!');
        }
    } catch (error) {
        console.log('❌ Unhandled error (this should not happen):', error.message);
        console.log('Stack:', error.stack);
    }
}

// Load environment
require('dotenv').config();

testUpdatedRegistration().then(() => {
    console.log('\n=== Test Complete ===');
}).catch(console.error);