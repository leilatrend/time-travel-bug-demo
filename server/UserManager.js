class UserManager {
    constructor() {
        this.users = new Map();
        this.currentId = 1;
    }

    validateUser(userData) {
        const errors = [];
        
        if (!userData.username || userData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('Valid email is required');
        }
        
        if (!userData.password || userData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    createUser(userData) {
        const validationErrors = this.validateUser(userData);
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
        }

        const user = {
            id: this.currentId++,
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password),
            createdAt: new Date(),
            isActive: true
        };

        this.users.set(user.id, user);
        return user;
    }

    getUserById(id) {
        return this.users.get(id);
    }

    updateUser(id, updateData) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = { ...user, ...updateData };
        
        // Re-validate if critical fields are being updated
        if (updateData.username || updateData.email || updateData.password) {
            const validationErrors = this.validateUser(updatedUser);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }
            
            if (updateData.password) {
                updatedUser.password = this.hashPassword(updateData.password);
            }
        }

        this.users.set(id, updatedUser);
        return updatedUser;
    }

    deleteUser(id) {
        const deleted = this.users.delete(id);
        if (!deleted) {
            throw new Error('User not found');
        }
        return true;
    }

    getAllUsers() {
        return Array.from(this.users.values());
    }

    searchUsers(criteria) {
        const users = this.getAllUsers();
        return users.filter(user => {
            return Object.keys(criteria).every(key => {
                if (user[key] && criteria[key]) {
                    return user[key].toString().toLowerCase().includes(
                        criteria[key].toString().toLowerCase()
                    );
                }
                return false;
            });
        });
    }
}

module.exports = UserManager;
