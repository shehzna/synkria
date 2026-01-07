import { User } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userService = {
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(500);

    // In a real app, this would update the database
    console.log('Updated user profile:', userId, updates);

    // Return the updated user (mock)
    return {
      id: userId,
      email: updates.email || 'user@example.com',
      name: updates.name || 'User',
      age: updates.age,
      cycleLength: updates.cycleLength,
      avatar: updates.avatar,
      createdAt: new Date(),
    };
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    await delay(800);

    // In a real app, upload to storage and return URL
    // For now, create a local object URL
    return URL.createObjectURL(file);
  },

  async deleteAccount(userId: string): Promise<void> {
    await delay(500);
    console.log('Deleted account:', userId);
  },

  generateDefaultAvatar(name: string): string {
    // Generate initials-based avatar URL using UI Avatars service
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ec4899&color=fff&size=128`;
  },
};
