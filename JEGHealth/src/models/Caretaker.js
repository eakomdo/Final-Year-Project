export class Caretaker {
  constructor({
    id = null,
    fullName,
    email,
    phoneNumber,
    relationship,
    emergencyContact = false,
    address = '',
    dateOfBirth = null,
    notes = '',
    uniqueCode = null,
    status = 'pending', // pending, active, inactive
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id || this.generateId();
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.relationship = relationship;
    this.emergencyContact = emergencyContact;
    this.address = address;
    this.dateOfBirth = dateOfBirth;
    this.notes = notes;
    this.uniqueCode = uniqueCode || this.generateUniqueCode();
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  generateId() {
    return `caretaker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUniqueCode() {
    // Generate 6-digit alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  toJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      relationship: this.relationship,
      emergencyContact: this.emergencyContact,
      address: this.address,
      dateOfBirth: this.dateOfBirth,
      notes: this.notes,
      uniqueCode: this.uniqueCode,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Caretaker(data);
  }
}