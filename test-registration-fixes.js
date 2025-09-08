// Test registration with simulated network failure
const { registerUser } = require('./lib/auth/register.ts');

// Mock fetch to simulate network failure
const originalFetch = global.fetch;

async function testRegistrationWithNetworkFailure() {
    console.log('=== Testing Registration with Network Issues ===\n');
    
    // Test with network failure
    global.fetch = async () => {
        throw new Error('fetch failed');
    };
    
    const testPayload = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
    };
    
    try {
        const result = await registerUser(testPayload);
        console.log('Registration result:', result);
        
        if (!result.ok) {
            console.log('✅ Registration properly handled network failure');
            console.log('✅ Error message:', result.error);
        } else {
            console.log('❌ Registration should have failed with network issue');
        }
    } catch (error) {
        console.log('❌ Unhandled error:', error.message);
    }
    
    // Restore original fetch
    global.fetch = originalFetch;
    
    console.log('\n=== Test Complete ===');
}

if (require.main === module) {
    testRegistrationWithNetworkFailure().catch(console.error);
}