import DataStorage from './DataStorage';
import { Caretaker } from '../models/Caretaker';
import NotificationService from './NotificationService';

class CaretakerService {
  constructor() {
    this.storageKey = 'jeghealth_caretakers';
    this.userStorageKey = 'jeghealth_user_profile';
  }

  async getAllCaretakers() {
    try {
      const data = await DataStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const caretakers = JSON.parse(data);
      return caretakers.map(c => Caretaker.fromJSON(c));
    } catch (error) {
      console.error('Error getting caretakers:', error);
      return [];
    }
  }

  async getCaretakerById(id) {
    try {
      const caretakers = await this.getAllCaretakers();
      return caretakers.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting caretaker by ID:', error);
      return null;
    }
  }

  async addCaretaker(caretakerData) {
    try {
      const caretaker = new Caretaker(caretakerData);
      const caretakers = await this.getAllCaretakers();
      
      // Check for duplicate email or phone
      const existingCaretaker = caretakers.find(
        c => c.email === caretaker.email || c.phoneNumber === caretaker.phoneNumber
      );
      
      if (existingCaretaker) {
        throw new Error('Caretaker with this email or phone number already exists');
      }

      caretakers.push(caretaker);
      await DataStorage.setItem(this.storageKey, JSON.stringify(caretakers));

      // Send notifications
      await this.sendCaretakerNotifications(caretaker);

      return caretaker;
    } catch (error) {
      console.error('Error adding caretaker:', error);
      throw error;
    }
  }

  async updateCaretaker(id, updateData) {
    try {
      const caretakers = await this.getAllCaretakers();
      const index = caretakers.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Caretaker not found');
      }

      caretakers[index] = { ...caretakers[index], ...updateData, updatedAt: new Date() };
      await DataStorage.setItem(this.storageKey, JSON.stringify(caretakers));

      return Caretaker.fromJSON(caretakers[index]);
    } catch (error) {
      console.error('Error updating caretaker:', error);
      throw error;
    }
  }

  async removeCaretaker(id) {
    try {
      const caretakers = await this.getAllCaretakers();
      const filteredCaretakers = caretakers.filter(c => c.id !== id);
      
      if (filteredCaretakers.length === caretakers.length) {
        throw new Error('Caretaker not found');
      }

      await DataStorage.setItem(this.storageKey, JSON.stringify(filteredCaretakers));
      return true;
    } catch (error) {
      console.error('Error removing caretaker:', error);
      throw error;
    }
  }

  async sendCaretakerNotifications(caretaker) {
    try {
      // Get user profile for sending notifications
      const userProfileData = await DataStorage.getItem(this.userStorageKey);
      const userProfile = userProfileData ? JSON.parse(userProfileData) : null;

      if (!userProfile || !userProfile.phoneNumber || !userProfile.email) {
        console.warn('User profile not found or incomplete for notifications');
        return;
      }

      const message = `JEGHealth: New caretaker "${caretaker.fullName}" added. Access code: ${caretaker.uniqueCode}. Keep this code safe for emergency access.`;

      // Send SMS notification
      await NotificationService.sendSMS({
        to: userProfile.phoneNumber,
        message: message
      });

      // Send email notification
      await NotificationService.sendEmail({
        to: userProfile.email,
        subject: 'JEGHealth - New Caretaker Added',
        body: `
          <h2>New Caretaker Added</h2>
          <p>A new caretaker has been added to your JEGHealth account:</p>
          <ul>
            <li><strong>Name:</strong> ${caretaker.fullName}</li>
            <li><strong>Relationship:</strong> ${caretaker.relationship}</li>
            <li><strong>Access Code:</strong> <strong>${caretaker.uniqueCode}</strong></li>
          </ul>
          <p>Please keep this access code safe. It will be required for emergency access to your health data.</p>
          <p>Best regards,<br>JEGHealth Team</p>
        `
      });

      console.log('Caretaker notifications sent successfully');
    } catch (error) {
      console.error('Error sending caretaker notifications:', error);
      // Don't throw error - caretaker should still be saved even if notifications fail
    }
  }

  async getCaretakerByCode(code) {
    try {
      const caretakers = await this.getAllCaretakers();
      return caretakers.find(c => c.uniqueCode === code && c.status === 'active') || null;
    } catch (error) {
      console.error('Error getting caretaker by code:', error);
      return null;
    }
  }
}

export default new CaretakerService();