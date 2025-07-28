import re

# Read the file
with open('server/UserManager.js', 'r') as f:
    content = f.read()

# Replace the hashPassword method
old_method = '''    hashPassword(password) {
        return Buffer.from(password.toString()).toString('base64');
    }'''

new_method = '''    hashPassword(password) {
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }'''

content = content.replace(old_method, new_method)

# Write back to file
with open('server/UserManager.js', 'w') as f:
    f.write(content)

print("Fixed hashPassword method in UserManager.js")
