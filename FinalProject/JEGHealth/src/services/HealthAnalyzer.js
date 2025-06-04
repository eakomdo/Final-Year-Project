class HealthAnalyzer {
  // Analyze ECG data for potential heart issues
  analyzeECG(ecgData) {
    try {
      const results = {
        issues: [],
        riskLevel: 'normal',
        requiresAttention: false
      };
      
      // Heart rate analysis (simplified)
      const heartRate = this._extractHeartRate(ecgData);
      
      if (heartRate < 50) {
        results.issues.push({
          type: 'bradycardia',
          description: 'Unusually slow heart rate detected',
          value: heartRate,
          threshold: 50
        });
        results.riskLevel = 'moderate';
        results.requiresAttention = true;
      } else if (heartRate > 100) {
        results.issues.push({
          type: 'tachycardia',
          description: 'Unusually fast heart rate detected',
          value: heartRate,
          threshold: 100
        });
        results.riskLevel = 'moderate';
        results.requiresAttention = true;
      }
      
      // Heart rhythm analysis (arrhythmia detection)
      const rhythmIssues = this._analyzeHeartRhythm(ecgData);
      if (rhythmIssues) {
        results.issues.push(rhythmIssues);
        if (rhythmIssues.severity === 'high') {
          results.riskLevel = 'high';
          results.requiresAttention = true;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error analyzing ECG data:', error);
      return { error: 'Failed to analyze ECG data', issues: [] };
    }
  }
  
  // Analyze blood pressure data
  analyzeBloodPressure(systolic, diastolic) {
    const results = {
      issues: [],
      riskLevel: 'normal',
      requiresAttention: false
    };
    
    // Hypertension classification (based on standard guidelines)
    if (systolic >= 180 || diastolic >= 120) {
      results.issues.push({
        type: 'hypertensive_crisis',
        description: 'Hypertensive crisis - Seek emergency care',
        value: `${systolic}/${diastolic}`,
        severity: 'critical'
      });
      results.riskLevel = 'critical';
      results.requiresAttention = true;
    } else if (systolic >= 140 || diastolic >= 90) {
      results.issues.push({
        type: 'hypertension_stage2',
        description: 'Stage 2 Hypertension',
        value: `${systolic}/${diastolic}`,
        severity: 'high'
      });
      results.riskLevel = 'high';
      results.requiresAttention = true;
    } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      results.issues.push({
        type: 'hypertension_stage1',
        description: 'Stage 1 Hypertension',
        value: `${systolic}/${diastolic}`,
        severity: 'moderate'
      });
      results.riskLevel = 'moderate';
      results.requiresAttention = false;
    } else if ((systolic >= 120 && systolic < 130) && diastolic < 80) {
      results.issues.push({
        type: 'elevated',
        description: 'Elevated blood pressure',
        value: `${systolic}/${diastolic}`,
        severity: 'low'
      });
      results.riskLevel = 'low';
    }
    
    // Check for hypotension (low blood pressure)
    if (systolic < 90 || diastolic < 60) {
      results.issues.push({
        type: 'hypotension',
        description: 'Low blood pressure',
        value: `${systolic}/${diastolic}`,
        severity: 'moderate'
      });
      results.riskLevel = 'moderate';
      results.requiresAttention = true;
    }
    
    return results;
  }
  
  // Analyze oxygen saturation (SpO2)
  analyzeOxygenSaturation(spO2) {
    const results = {
      issues: [],
      riskLevel: 'normal',
      requiresAttention: false
    };
    
    if (spO2 < 90) {
      results.issues.push({
        type: 'severe_hypoxemia',
        description: 'Severe low blood oxygen levels',
        value: spO2,
        threshold: 90,
        severity: 'critical'
      });
      results.riskLevel = 'critical';
      results.requiresAttention = true;
    } else if (spO2 < 95) {
      results.issues.push({
        type: 'mild_hypoxemia',
        description: 'Mild low blood oxygen levels',
        value: spO2,
        threshold: 95,
        severity: 'moderate'
      });
      results.riskLevel = 'moderate';
      results.requiresAttention = true;
    }
    
    return results;
  }
  
  // Analyze heart rate data
  analyzeHeartRate(heartRate, age) {
    const results = {
      issues: [],
      riskLevel: 'normal',
      requiresAttention: false
    };
    
    // Calculate max heart rate based on age
    const maxHeartRate = 220 - age;
    const restingThresholdHigh = 100;
    const restingThresholdLow = 50;
    
    if (heartRate > restingThresholdHigh) {
      results.issues.push({
        type: 'tachycardia',
        description: 'Unusually fast heart rate detected',
        value: heartRate,
        threshold: restingThresholdHigh,
        severity: 'moderate'
      });
      results.riskLevel = 'moderate';
      results.requiresAttention = true;
      
      // Check for extreme tachycardia
      if (heartRate > 150) {
        results.issues[0].severity = 'high';
        results.riskLevel = 'high';
      }
    } else if (heartRate < restingThresholdLow) {
      results.issues.push({
        type: 'bradycardia',
        description: 'Unusually slow heart rate detected',
        value: heartRate,
        threshold: restingThresholdLow,
        severity: 'moderate'
      });
      results.riskLevel = 'moderate';
      results.requiresAttention = true;
      
      // Check for extreme bradycardia
      if (heartRate < 40) {
        results.issues[0].severity = 'high';
        results.riskLevel = 'high';
      }
    }
    
    return results;
  }
  
  // Combine multiple readings for comprehensive analysis
  analyzeCardiovascularRisk(userData, readings) {
    try {
      const riskFactors = [];
      let riskScore = 0;
      
      // Check blood pressure trends
      const bpReadings = readings.filter(r => r.type === 'bloodPressure');
      if (bpReadings.length > 0) {
        const highBpCount = bpReadings.filter(r => r.data.systolic >= 140 || r.data.diastolic >= 90).length;
        const bpRiskPercent = (highBpCount / bpReadings.length) * 100;
        
        if (bpRiskPercent > 50) {
          riskFactors.push({
            factor: 'hypertension',
            description: 'High blood pressure detected in over 50% of readings',
            severity: 'high'
          });
          riskScore += 3;
        } else if (bpRiskPercent > 25) {
          riskFactors.push({
            factor: 'hypertension',
            description: 'High blood pressure detected occasionally',
            severity: 'moderate'
          });
          riskScore += 1;
        }
      }
      
      // Check heart rate variability
      const hrReadings = readings.filter(r => r.type === 'heartRate' || r.type === 'ecg');
      if (hrReadings.length > 3) {
        const hrValues = hrReadings.map(r => r.data.heartRate || r.data.hr);
        const hrVariability = this._calculateVariability(hrValues);
        
        if (hrVariability < 10) {
          riskFactors.push({
            factor: 'low_hrv',
            description: 'Low heart rate variability indicates potential autonomic dysfunction',
            severity: 'moderate'
          });
          riskScore += 2;
        }
      }
      
      // Check oxygen saturation trends
      const spO2Readings = readings.filter(r => r.type === 'pulseOx');
      if (spO2Readings.length > 0) {
        const lowSpO2Count = spO2Readings.filter(r => r.data.spO2 < 95).length;
        if (lowSpO2Count > 0) {
          riskFactors.push({
            factor: 'hypoxemia',
            description: 'Low blood oxygen levels detected',
            severity: lowSpO2Count > 2 ? 'high' : 'moderate'
          });
          riskScore += lowSpO2Count > 2 ? 3 : 1;
        }
      }
      
      // Factor in user demographics and medical history
      if (userData) {
        if (userData.age > 65) {
          riskScore += 1;
        }
        
        if (userData.smoker) {
          riskFactors.push({
            factor: 'smoking',
            description: 'Smoking increases cardiovascular risk',
            severity: 'high'
          });
          riskScore += 2;
        }
        
        if (userData.diabetic) {
          riskFactors.push({
            factor: 'diabetes',
            description: 'Diabetes increases cardiovascular risk',
            severity: 'high'
          });
          riskScore += 2;
        }
        
        if (userData.familyHistory) {
          riskFactors.push({
            factor: 'genetic',
            description: 'Family history of cardiovascular disease',
            severity: 'moderate'
          });
          riskScore += 1;
        }
      }
      
      // Calculate overall risk level
      let riskLevel = 'low';
      if (riskScore >= 5) {
        riskLevel = 'high';
      } else if (riskScore >= 2) {
        riskLevel = 'moderate';
      }
      
      return {
        riskLevel,
        riskScore,
        riskFactors,
        recommendConsultation: riskScore >= 4
      };
    } catch (error) {
      console.error('Error analyzing cardiovascular risk:', error);
      return { error: 'Failed to analyze cardiovascular risk' };
    }
  }
  
  // Helper method to extract heart rate from ECG data
  _extractHeartRate(ecgData) {
    // For this example, we'll just use the heart rate value
    // directly from the data
    return ecgData.hr || 0;
  }
  
  // Helper method to analyze heart rhythm
  _analyzeHeartRhythm(ecgData) {
    // This would typically involve complex algorithms
    // Simplified for demonstration purposes
    const values = ecgData.values || [];
    
    // Detect irregular intervals (simplified)
    if (values.length > 100) {
      const peaks = this._findECGPeaks(values);
      const intervals = this._calculateRRIntervals(peaks);
      const irregularity = this._calculateIrregularity(intervals);
      
      if (irregularity > 0.2) {
        return {
          type: 'arrhythmia',
          description: 'Irregular heart rhythm detected',
          severity: irregularity > 0.3 ? 'high' : 'moderate'
        };
      }
    }
    
    return null;
  }
  
  // Simplified peak detection for ECG
  _findECGPeaks(values) {
    const peaks = [];
    const threshold = this._calculateThreshold(values);
    
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > threshold && values[i] > values[i-1] && values[i] > values[i+1]) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }
  
  // Calculate adaptive threshold
  _calculateThreshold(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length) * 1.5; // Simple adaptive threshold
  }
  
  // Calculate R-R intervals
  _calculateRRIntervals(peaks) {
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i-1]);
    }
    return intervals;
  }
  
  // Calculate irregularity score
  _calculateIrregularity(intervals) {
    if (intervals.length < 2) return 0;
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const squareDiffs = intervals.map(val => {
      const diff = val - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff) / mean; // Coefficient of variation
  }
  
  // Calculate variability
  _calculateVariability(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(val => {
      const diff = val - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff); // Standard deviation
  }
}

export default new HealthAnalyzer();