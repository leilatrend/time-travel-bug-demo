const UserManager = require('../server/UserManager');

// Test the null pointer fix
const userManager = new UserManager();

console.log('Testing null pointer fix...');

// Test 1: null password
try {
    userManager.hashPassword(null);
    console.log('❌ Test 1 FAILED: Should have thrown error for null password');
} catch (error) {
    console.log('✅ Test 1 PASSED: Correctly handled null password:', error.message);
}

// Test 2: undefined password
try {
    userManager.hashPassword(undefined);
    console.log('❌ Test 2 FAILED: Should have thrown error for undefined password');
} catch (error) {
    console.log('✅ Test 2 PASSED: Correctly handled undefined password:', error.message);
}

// Test 3: empty string password
try {
    userManager.hashPassword('');
    console.log('❌ Test 3 FAILED: Should have thrown error for empty password');
} catch (error) {
    console.log('✅ Test 3 PASSED: Correctly handled empty password:', error.message);
}

// Test 4: valid password
try {
    const hash = userManager.hashPassword('validpassword');
    console.log('✅ Test 4 PASSED: Successfully hashed valid password:', hash);
} catch (error) {
    console.log('❌ Test 4 FAILED: Should have succeeded for valid password:', error.message);
}

// Test 5: Registration with null password
try {
    userManager.registerUser('testuser', null, 'test@example.com');
    console.log('❌ Test 5 FAILED: Should have thrown error for null password in registration');
} catch (error) {
    console.log('✅ Test 5 PASSED: Correctly handled null password in registration:', error.message);
}

console.log('All tests completed!');
