import DatabaseService from '../../lib/database';
import NotificationService from './NotificationService';

class HealthRecommendationService {
  constructor() {
    this.recommendations = [];
    this.userHealthData = null;
    this.isInitialized = false;
    this.recommendationTypes = {
      HYDRATION: 'hydration',
      MEDICATION: 'medication',
      EXERCISE: 'exercise',
      SLEEP: 'sleep',
      APPOINTMENT: 'appointment',
      VITALS: 'vitals',
      NUTRITION: 'nutrition',
      EMERGENCY: 'emergency'
    };
  }

  async initialize(userId) {
    try {
      console.log('🧠 Initializing Health Recommendation Service...');
      this.userId = userId;
      await this.loadUserHealthData();
      this.generateRecommendations();
      this.isInitialized = true;
      console.log('✅ Health Recommendation Service initialized');
    } catch (error) {
      console.error('❌ Error initializing Health Recommendation Service:', error);
    }
  }

  async loadUserHealthData() {
    try {
      // Load user's medications, appointments, health records
      const medications = await DatabaseService.getUserMedications(this.userId);
      const appointments = await DatabaseService.getUserAppointments(this.userId, { upcoming: true });
      
      this.userHealthData = {
        medications: medications.documents || [],
        upcomingAppointments: appointments.documents || [],
        lastHealthCheck: this.getLastHealthCheckDate(),
        medicationSchedule: this.extractMedicationSchedule(medications.documents || []),
        appointmentHistory: await this.getAppointmentHistory(),
        vitalsSummary: await this.getRecentVitals()
      };

      console.log('📊 User health data loaded:', {
        medications: this.userHealthData.medications.length,
        upcomingAppointments: this.userHealthData.upcomingAppointments.length
      });
    } catch (error) {
      console.error('Error loading user health data:', error);
      this.userHealthData = { medications: [], upcomingAppointments: [] };
    }
  }

  generateRecommendations() {
    if (!this.userHealthData) return;

    this.recommendations = [];
    
    // Generate different types of recommendations
    this.generateMedicationRecommendations();
    this.generateHydrationRecommendations();
    this.generateAppointmentRecommendations();
    this.generateExerciseRecommendations();
    this.generateSleepRecommendations();
    this.generateVitalsRecommendations();
    this.generateNutritionRecommendations();
    this.generateEmergencyPreparednessRecommendations();

    // Sort recommendations by priority
    this.recommendations.sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));

    console.log(`🎯 Generated ${this.recommendations.length} health recommendations`);
  }

  generateMedicationRecommendations() {
    const { medications } = this.userHealthData;
    
    if (medications.length === 0) {
      this.addRecommendation({
        type: this.recommendationTypes.MEDICATION,
        title: '💊 Medication Management',
        message: 'Consider adding your medications to the app for better tracking and reminders.',
        priority: 'medium',
        action: 'add_medication',
        description: 'Medication tracking helps ensure you never miss a dose and can provide valuable insights to your healthcare providers.',
        benefits: ['Never miss a dose', 'Track side effects', 'Share data with doctors'],
        urgency: 'normal'
      });
      return;
    }

    // Check for missed reminders or irregular schedules
    medications.forEach(medication => {
      if (this.shouldRecommendMedicationReminder(medication)) {
        this.addRecommendation({
          type: this.recommendationTypes.MEDICATION,
          title: `💊 ${medication.medication_name} Reminder`,
          message: `Set up automatic reminders for your ${medication.medication_name} (${medication.dosage}).`,
          priority: 'high',
          action: 'setup_reminder',
          medicationId: medication.$id,
          description: 'Regular medication reminders help maintain consistent treatment and improve health outcomes.',
          urgency: 'high'
        });
      }

      // Check for upcoming medication refills
      if (this.shouldRecommendRefill(medication)) {
        this.addRecommendation({
          type: this.recommendationTypes.MEDICATION,
          title: `🔄 Refill ${medication.medication_name}`,
          message: 'Your medication supply may be running low. Consider requesting a refill.',
          priority: 'medium',
          action: 'request_refill',
          medicationId: medication.$id,
          urgency: 'medium'
        });
      }
    });
  }

  generateHydrationRecommendations() {
    const currentHour = new Date().getHours();
    
    // Morning hydration reminder
    if (currentHour >= 6 && currentHour <= 10) {
      this.addRecommendation({
        type: this.recommendationTypes.HYDRATION,
        title: '💧 Start Your Day Hydrated',
        message: 'Drink a glass of water to kickstart your metabolism and rehydrate after sleep.',
        priority: 'medium',
        action: 'log_water',
        description: 'Morning hydration helps jumpstart your metabolism and improves cognitive function.',
        tips: ['Drink 16-20 oz upon waking', 'Add lemon for vitamin C', 'Make it a daily habit'],
        urgency: 'normal'
      });
    }

    // Afternoon hydration check
    if (currentHour >= 14 && currentHour <= 16) {
      this.addRecommendation({
        type: this.recommendationTypes.HYDRATION,
        title: '💧 Afternoon Hydration Check',
        message: 'Mid-day is crucial for maintaining energy levels. Have you had enough water?',
        priority: 'medium',
        action: 'check_hydration',
        urgency: 'normal'
      });
    }

    // General hydration recommendation
    this.addRecommendation({
      type: this.recommendationTypes.HYDRATION,
      title: '💧 Daily Hydration Goal',
      message: 'Aim for 8-10 glasses of water daily. Track your intake to stay healthy.',
      priority: 'low',
      action: 'setup_hydration_tracking',
      description: 'Proper hydration supports every bodily function and improves overall health.',
      benefits: ['Better energy levels', 'Improved skin health', 'Better cognitive function'],
      urgency: 'normal'
    });
  }

  generateAppointmentRecommendations() {
    const { upcomingAppointments } = this.userHealthData;

    // Upcoming appointment reminders
    upcomingAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const daysUntil = Math.ceil((appointmentDate - new Date()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 7 && daysUntil > 0) {
        this.addRecommendation({
          type: this.recommendationTypes.APPOINTMENT,
          title: `📅 Upcoming: ${appointment.doctor_name}`,
          message: `You have an appointment with ${appointment.doctor_name} in ${daysUntil} day(s).`,
          priority: 'high',
          action: 'prepare_appointment',
          appointmentId: appointment.$id,
          description: 'Prepare for your appointment by gathering relevant health information.',
          tips: ['Prepare questions', 'Bring medication list', 'Update symptoms log'],
          urgency: daysUntil <= 2 ? 'urgent' : 'high'
        });
      }
    });

    // Recommend regular checkups if no recent appointments
    if (this.shouldRecommendRegularCheckup()) {
      this.addRecommendation({
        type: this.recommendationTypes.APPOINTMENT,
        title: '🏥 Schedule Regular Checkup',
        message: 'It\'s been a while since your last appointment. Consider scheduling a routine checkup.',
        priority: 'medium',
        action: 'schedule_checkup',
        description: 'Regular health checkups help catch potential issues early and maintain optimal health.',
        urgency: 'normal'
      });
    }
  }

  generateExerciseRecommendations() {
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Morning exercise recommendation
    if (currentHour >= 6 && currentHour <= 9) {
      this.addRecommendation({
        type: this.recommendationTypes.EXERCISE,
        title: '🏃‍♂️ Morning Movement',
        message: 'Start your day with 15-30 minutes of physical activity to boost energy.',
        priority: 'medium',
        action: 'start_exercise',
        description: 'Morning exercise improves mood, energy levels, and sets a positive tone for the day.',
        suggestions: ['10-minute walk', 'Stretching routine', 'Light yoga', 'Bodyweight exercises'],
        urgency: 'normal'
      });
    }

    // Weekend activity recommendation
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      this.addRecommendation({
        type: this.recommendationTypes.EXERCISE,
        title: '🎯 Weekend Activity Challenge',
        message: 'Make the most of your weekend with outdoor activities or longer exercise sessions.',
        priority: 'medium',
        action: 'plan_weekend_activity',
        suggestions: ['Nature hike', 'Bike ride', 'Swimming', 'Sports with friends'],
        urgency: 'normal'
      });
    }

    // General exercise recommendation
    this.addRecommendation({
      type: this.recommendationTypes.EXERCISE,
      title: '💪 Daily Activity Goal',
      message: 'Aim for at least 30 minutes of moderate exercise daily for optimal health.',
      priority: 'low',
      action: 'setup_exercise_tracking',
      description: 'Regular exercise reduces disease risk, improves mental health, and increases longevity.',
      benefits: ['Stronger cardiovascular system', 'Better mood', 'Improved sleep quality'],
      urgency: 'normal'
    });
  }

  generateSleepRecommendations() {
    const currentHour = new Date().getHours();

    // Evening wind-down recommendation
    if (currentHour >= 21 && currentHour <= 23) {
      this.addRecommendation({
        type: this.recommendationTypes.SLEEP,
        title: '😴 Prepare for Quality Sleep',
        message: 'Start winding down for better sleep quality. Avoid screens and try relaxation techniques.',
        priority: 'medium',
        action: 'start_sleep_routine',
        description: 'A consistent bedtime routine improves sleep quality and overall health.',
        tips: ['Dim the lights', 'No screens 1 hour before bed', 'Try meditation or reading'],
        urgency: 'normal'
      });
    }

    // Sleep schedule recommendation
    this.addRecommendation({
      type: this.recommendationTypes.SLEEP,
      title: '🌙 Consistent Sleep Schedule',
      message: 'Maintain a regular sleep schedule for 7-9 hours of quality rest each night.',
      priority: 'medium',
      action: 'setup_sleep_tracking',
      description: 'Quality sleep is essential for physical recovery, mental health, and immune function.',
      benefits: ['Better memory', 'Improved immune system', 'Better mood regulation'],
      urgency: 'normal'
    });
  }

  generateVitalsRecommendations() {
    const lastCheckDate = this.getLastHealthCheckDate();
    const daysSinceCheck = lastCheckDate ? 
      Math.floor((new Date() - lastCheckDate) / (1000 * 60 * 60 * 24)) : 30;

    if (daysSinceCheck >= 7) {
      this.addRecommendation({
        type: this.recommendationTypes.VITALS,
        title: '❤️ Check Your Vitals',
        message: `It's been ${daysSinceCheck} days since your last health measurement. Consider checking your vitals.`,
        priority: daysSinceCheck >= 14 ? 'high' : 'medium',
        action: 'measure_vitals',
        description: 'Regular vital sign monitoring helps track your health trends and detect changes early.',
        suggestions: ['Blood pressure', 'Heart rate', 'Weight', 'Temperature'],
        urgency: daysSinceCheck >= 21 ? 'high' : 'normal'
      });
    }

    // BLE device connection recommendation
    this.addRecommendation({
      type: this.recommendationTypes.VITALS,
      title: '📱 Connect Health Devices',
      message: 'Connect Bluetooth health devices for automatic vital sign monitoring.',
      priority: 'low',
      action: 'connect_ble_device',
      description: 'Connected devices make health monitoring effortless and more accurate.',
      urgency: 'normal'
    });
  }

  generateNutritionRecommendations() {
    const currentHour = new Date().getHours();

    // Meal timing recommendations
    if (currentHour >= 7 && currentHour <= 9) {
      this.addRecommendation({
        type: this.recommendationTypes.NUTRITION,
        title: '🍳 Healthy Breakfast',
        message: 'Start your day with a nutritious breakfast rich in protein and fiber.',
        priority: 'medium',
        action: 'log_meal',
        suggestions: ['Oatmeal with fruits', 'Greek yogurt with nuts', 'Eggs with vegetables'],
        urgency: 'normal'
      });
    }

    // General nutrition recommendation
    this.addRecommendation({
      type: this.recommendationTypes.NUTRITION,
      title: '🥗 Balanced Nutrition',
      message: 'Focus on a balanced diet with plenty of fruits, vegetables, and lean proteins.',
      priority: 'low',
      action: 'nutrition_tips',
      description: 'Good nutrition supports immune function, energy levels, and overall health.',
      benefits: ['Better energy', 'Stronger immune system', 'Improved mood'],
      urgency: 'normal'
    });
  }

  generateEmergencyPreparednessRecommendations() {
    this.addRecommendation({
      type: this.recommendationTypes.EMERGENCY,
      title: '🚨 Emergency Contacts',
      message: 'Ensure your emergency contacts and medical information are up to date.',
      priority: 'medium',
      action: 'update_emergency_info',
      description: 'Updated emergency information can be life-saving in critical situations.',
      urgency: 'normal'
    });
  }

  addRecommendation(recommendation) {
    recommendation.id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    recommendation.createdAt = new Date().toISOString();
    recommendation.dismissed = false;
    this.recommendations.push(recommendation);
  }

  getRecommendations(filters = {}) {
    let filtered = [...this.recommendations];

    if (filters.type) {
      filtered = filtered.filter(rec => rec.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(rec => rec.priority === filters.priority);
    }

    if (filters.urgency) {
      filtered = filtered.filter(rec => rec.urgency === filters.urgency);
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered.filter(rec => !rec.dismissed);
  }

  dismissRecommendation(recommendationId) {
    const recommendation = this.recommendations.find(rec => rec.id === recommendationId);
    if (recommendation) {
      recommendation.dismissed = true;
      console.log(`📝 Dismissed recommendation: ${recommendation.title}`);
    }
  }

  async executeRecommendationAction(recommendationId, actionData = {}) {
    const recommendation = this.recommendations.find(rec => rec.id === recommendationId);
    if (!recommendation) return false;

    try {
      switch (recommendation.action) {
        case 'setup_reminder':
          await this.setupMedicationReminder(recommendation, actionData);
          break;
        case 'log_water':
          await this.logWaterIntake(actionData);
          break;
        case 'measure_vitals':
          await this.promptVitalsMeasurement();
          break;
        case 'start_exercise':
          await this.startExerciseSession(actionData);
          break;
        case 'prepare_appointment':
          await this.prepareAppointment(recommendation);
          break;
        default:
          console.log(`Action not implemented: ${recommendation.action}`);
      }

      // Mark as completed
      recommendation.completed = true;
      recommendation.completedAt = new Date().toISOString();
      
      return true;
    } catch (error) {
      console.error('Error executing recommendation action:', error);
      return false;
    }
  }

  async setupMedicationReminder(recommendation, actionData) {
    if (recommendation.medicationId) {
      // Schedule notification for medication
      await NotificationService.scheduleHealthReminder(
        'medication',
        `Time to take your ${actionData.medicationName || 'medication'}`,
        { hour: actionData.hour || 9, minute: actionData.minute || 0 }
      );
      console.log('✅ Medication reminder scheduled');
    }
  }

  async logWaterIntake(actionData) {
    // Log water intake (implement based on your storage system)
    console.log(`💧 Logged ${actionData.amount || 250}ml of water`);
  }

  async promptVitalsMeasurement() {
    // Navigate to vitals measurement screen
    console.log('❤️ Redirecting to vitals measurement');
  }

  async startExerciseSession(actionData) {
    // Start exercise tracking
    console.log(`🏃‍♂️ Starting ${actionData.type || 'general'} exercise session`);
  }

  async prepareAppointment(recommendation) {
    // Prepare appointment checklist
    console.log(`📅 Preparing for appointment (ID: ${recommendation.appointmentId})`);
  }

  // Helper methods
  shouldRecommendMedicationReminder(medication) {
    // Logic to determine if medication reminder should be recommended
    return !medication.reminder_times || medication.reminder_times.length === 0;
  }

  shouldRecommendRefill(medication) {
    // Logic to determine if refill should be recommended
    const endDate = medication.end_date ? new Date(medication.end_date) : null;
    if (!endDate) return false;
    
    const daysUntilEnd = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  }

  shouldRecommendRegularCheckup() {
    // Logic to determine if regular checkup should be recommended
    const lastAppointment = this.userHealthData.appointmentHistory?.[0];
    if (!lastAppointment) return true;
    
    const lastDate = new Date(lastAppointment.appointment_date);
    const monthsSince = (new Date() - lastDate) / (1000 * 60 * 60 * 24 * 30);
    return monthsSince >= 6; // Recommend if 6+ months since last appointment
  }

  getLastHealthCheckDate() {
    // Return last health check date (implement based on your data structure)
    return null; // Placeholder
  }

  extractMedicationSchedule(medications) {
    // Extract medication schedule information
    return medications.map(med => ({
      id: med.$id,
      name: med.medication_name,
      times: med.reminder_times ? JSON.parse(med.reminder_times) : []
    }));
  }

  async getAppointmentHistory() {
    // Get appointment history
    try {
      const response = await DatabaseService.getUserAppointments(this.userId, { limit: 10 });
      return response.documents || [];
    } catch (error) {
      console.error('Error getting appointment history:', error);
      return [];
    }
  }

  async getRecentVitals() {
    // Get recent vitals data (implement based on your vitals storage)
    return {};
  }

  getPriorityScore(recommendation) {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    const urgencyScores = { urgent: 3, high: 2, normal: 1 };
    
    return (priorityScores[recommendation.priority] || 1) + 
           (urgencyScores[recommendation.urgency] || 1);
  }

  // Public API methods
  async refreshRecommendations() {
    if (!this.isInitialized) return;
    
    await this.loadUserHealthData();
    this.generateRecommendations();
    console.log('🔄 Health recommendations refreshed');
  }

  getRecommendationStats() {
    const total = this.recommendations.length;
    const byPriority = this.recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {});
    
    const completed = this.recommendations.filter(rec => rec.completed).length;
    const dismissed = this.recommendations.filter(rec => rec.dismissed).length;
    
    return {
      total,
      active: total - dismissed,
      completed,
      dismissed,
      byPriority
    };
  }
}

export default new HealthRecommendationService();
