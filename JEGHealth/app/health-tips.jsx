import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HealthTipsScreen() {
  const router = useRouter();

  // Comprehensive list of health tips with detailed information
  const healthTips = [
    {
      id: 1,
      title: "Stay Hydrated",
      text: "Drink at least 8 glasses of water daily to maintain proper hydration.",
      importance: "Water is essential for nearly every bodily function. Proper hydration helps regulate body temperature, lubricates joints, delivers nutrients to cells, and keeps organs functioning properly.",
      frequency: "Drink 8-10 glasses (about 2 liters) of water daily, spread throughout the day. Increase intake during exercise, hot weather, or illness.",
      signs: {
        good: "Clear or light yellow urine, regular bathroom trips, moist skin, alert mind",
        concerning: "Dark yellow urine, infrequent urination, dry mouth, fatigue, headaches, dizziness"
      },
      icon: "water",
      color: "#90CAF9",
      videoLink: "https://www.youtube.com/watch?v=FwXO_pQ_z98"
    },
    {
      id: 2,
      title: "Daily Exercise",
      text: "Aim for at least 30 minutes of moderate exercise daily for better health.",
      importance: "Regular physical activity strengthens your heart, improves lung function, helps maintain healthy weight, reduces chronic disease risk, and boosts mental health and mood.",
      frequency: "Aim for 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities at least twice weekly.",
      signs: {
        good: "Increased energy, better sleep, improved mood, gradual strength gains, healthy appetite",
        concerning: "Persistent pain, excessive fatigue, irregular heartbeat, difficulty breathing, dizziness"
      },
      icon: "fitness",
      color: "#4ECDC4",
      videoLink: "https://www.youtube.com/watch?v=IODxDxX7oi4"
    },
    {
      id: 3,
      title: "Quality Sleep",
      text: "Get 7-8 hours of quality sleep each night to allow your body to recover.",
      importance: "Sleep is when your body repairs itself, consolidates memories, and restores energy. Proper sleep improves immune function, metabolism, and cognitive performance.",
      frequency: "Adults should get 7-9 hours of uninterrupted sleep nightly. Maintain a consistent sleep schedule, even on weekends.",
      signs: {
        good: "Waking refreshed, consistent energy throughout day, clear thinking, stable mood",
        concerning: "Difficulty falling/staying asleep, daytime drowsiness, irritability, trouble concentrating"
      },
      icon: "moon",
      color: "#2196F3",
      videoLink: "https://www.youtube.com/watch?v=t0kACis_dJE"
    },
    {
      id: 4,
      title: "Balanced Diet",
      text: "Eat a variety of fruits, vegetables, lean proteins, and whole grains.",
      importance: "A nutritionally balanced diet provides the energy and nutrients your body needs to function optimally, supports immune health, and reduces risk of chronic diseases.",
      frequency: "Every meal should include vegetables or fruits (half your plate), lean protein (quarter), and whole grains (quarter). Aim for 5+ servings of fruits/vegetables daily.",
      signs: {
        good: "Stable energy, healthy weight, regular digestion, strong immune system",
        concerning: "Frequent fatigue, digestive problems, slow healing, brittle hair/nails"
      },
      icon: "nutrition",
      color: "#FF9800",
      videoLink: "https://www.youtube.com/watch?v=fqhYBTg73fw"
    },
    {
      id: 5,
      title: "Reduce Stress",
      text: "Practice meditation or deep breathing for 10 minutes daily to manage stress.",
      importance: "Chronic stress can lead to inflammation, weakened immunity, high blood pressure, and mental health issues. Stress management supports overall physical and mental wellbeing.",
      frequency: "Practice mindfulness, meditation, or deep breathing for at least 10-15 minutes daily. Additional sessions as needed during stressful situations.",
      signs: {
        good: "Better emotional regulation, clarity of thought, lower heart rate, improved sleep",
        concerning: "Constant worry, irritability, muscle tension, digestive issues, sleep problems"
      },
      icon: "flower",
      color: "#9C27B0",
      videoLink: "https://www.youtube.com/watch?v=c1Ndym-IsQg"
    },
    {
      id: 6,
      title: "Limit Screen Time",
      text: "Take regular breaks from screens to reduce eye strain and improve focus.",
      importance: "Excessive screen time can cause digital eye strain, sleep disruption (due to blue light exposure), reduced physical activity, and decreased in-person social interactions.",
      frequency: "Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds. Take 5-10 minute screen breaks every hour.",
      signs: {
        good: "Normal sleep patterns, healthy social interactions, sustained attention span",
        concerning: "Dry eyes, headaches, neck pain, disrupted sleep, difficulty focusing"
      },
      icon: "phone-portrait",
      color: "#607D8B",
      videoLink: "https://www.youtube.com/watch?v=HNgDirLLZqI"
    },
    {
      id: 7,
      title: "Regular Check-ups",
      text: "Schedule annual health check-ups to monitor your overall health.",
      importance: "Preventive healthcare allows early detection of potential issues, establishes baseline health data, and helps maintain appropriate vaccination and screening schedules.",
      frequency: "Annual physical exam and dental check-ups. Age-appropriate screenings as recommended by healthcare providers (mammograms, colonoscopies, etc.)",
      signs: {
        good: "Consistent vital signs, normal test results, feeling well between visits",
        concerning: "Unexplained symptoms, major changes in weight/energy/sleep, chronic pain"
      },
      icon: "medical",
      color: "#F44336",
      videoLink: "https://www.youtube.com/watch?v=4VkqtZ6_RUs"
    },
    {
      id: 8,
      title: "Dental Care",
      text: "Brush twice daily and floss once a day for optimal dental health.",
      importance: "Good oral hygiene prevents cavities, gum disease, and tooth loss. Oral health is connected to overall health, including heart disease and diabetes risk.",
      frequency: "Brush teeth for 2 minutes twice daily. Floss once daily. Replace toothbrush every 3-4 months. Professional dental cleaning every 6 months.",
      signs: {
        good: "Pink gums, minimal plaque, fresh breath, no tooth sensitivity",
        concerning: "Bleeding gums, persistent bad breath, tooth pain, receding gums"
      },
      icon: "medical",
      color: "#00BCD4",
      videoLink: "https://www.youtube.com/watch?v=yUpiV2I_IRI"
    },
  ];

  // Apply dynamic styles based on theme - Content/Information Screen (White Theme)
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: 'white', // Clean white background for content screen
    },
    headerContainer: {
      backgroundColor: 'white',
      borderBottomColor: '#E9ECEF', // Light border
    },
    title: {
      color: '#333', // Dark text on white background
    },
    tipCard: {
      backgroundColor: 'white', // White cards
      borderColor: '#E9ECEF', // Light gray borders
    },
    tipTitle: {
      color: '#333', // Dark titles
    },
    tipText: {
      color: '#666', // Medium gray body text
    },
    sectionTitle: {
      color: '#333', // Dark section titles
    },
    sectionText: {
      color: '#666', // Medium gray section text
    },
    videoButton: {
      backgroundColor: '#4ECDC4', // Minimal turquoise accent
    }
  };

  // Open YouTube video
  const openVideo = (url) => {
    Linking.openURL(url);
  };

  // Expanded tip component with detailed information
  const DetailedTipCard = ({ tip }) => {
    const [expanded, setExpanded] = React.useState(false);
    
    return (
      <View style={[styles.tipCard, dynamicStyles.tipCard]}>
        <TouchableOpacity 
          style={styles.tipHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <View style={[styles.iconContainer, { backgroundColor: tip.color }]}>
            <Ionicons name={tip.icon} size={30} color="#fff" />
          </View>
          
          <View style={styles.tipHeaderContent}>
            <Text style={[styles.tipTitle, dynamicStyles.tipTitle]}>
              {tip.title}
            </Text>
            <Text style={[styles.tipText, dynamicStyles.tipText]} numberOfLines={expanded ? 0 : 2}>
              {tip.text}
            </Text>
          </View>
          
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.tipDetails}>
            <View style={styles.tipSection}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Why It&apos;s Important</Text>
              <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{tip.importance}</Text>
            </View>
            
            <View style={styles.tipSection}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recommended Frequency</Text>
              <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{tip.frequency}</Text>
            </View>
            
            <View style={styles.tipSection}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Signs to Watch For</Text>
              <View style={styles.signsContainer}>
                <View style={styles.signBox}>
                  <Text style={[styles.signTitle, { color: "#4ECDC4" }]}>Good Signs</Text>
                  <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{tip.signs.good}</Text>
                </View>
                <View style={styles.signBox}>
                  <Text style={[styles.signTitle, { color: "#F44336" }]}>Concerning Signs</Text>
                  <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{tip.signs.concerning}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.videoButton, dynamicStyles.videoButton]} 
              onPress={() => openVideo(tip.videoLink)}
            >
              <Ionicons name="logo-youtube" size={24} color="#fff" />
              <Text style={styles.videoButtonText}>Watch Video Guide</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.headerContainer, dynamicStyles.headerContainer]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.title]}>Health Tips</Text>
      </View>

      <View style={styles.tipsContainer}>
        {healthTips.map((tip) => (
          <DetailedTipCard key={tip.id} tip={tip} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tipsContainer: {
    padding: 16,
  },
  tipCard: {
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  tipHeaderContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipDetails: {
    padding: 16,
    paddingTop: 0,
  },
  tipSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signsContainer: {
    flexDirection: "column",
    marginTop: 8,
  },
  signBox: {
    marginBottom: 12,
  },
  signTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  videoButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});