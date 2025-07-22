import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

// Detailed tip data - would typically come from an API or larger data store
const tipDetails = {
  "Stay Hydrated": {
    importance: "Water is essential for nearly every bodily function. Proper hydration helps regulate body temperature, lubricates joints, delivers nutrients to cells, and keeps organs functioning properly.",
    frequency: "Drink 8-10 glasses (about 2 liters) of water daily, spread throughout the day. Increase intake during exercise, hot weather, or illness.",
    signs: {
      good: "Clear or light yellow urine, regular bathroom trips, moist skin, alert mind",
      concerning: "Dark yellow urine, infrequent urination, dry mouth, fatigue, headaches, dizziness"
    },
    videoLink: "https://www.youtube.com/watch?v=FwXO_pQ_z98"
  },
  "Daily Exercise": {
    importance: "Regular physical activity strengthens your heart, improves lung function, helps maintain healthy weight, reduces chronic disease risk, and boosts mental health and mood.",
    frequency: "Aim for 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities at least twice weekly.",
    signs: {
      good: "Increased energy, better sleep, improved mood, gradual strength gains, healthy appetite",
      concerning: "Persistent pain, excessive fatigue, irregular heartbeat, difficulty breathing, dizziness"
    },
    videoLink: "https://www.youtube.com/watch?v=IODxDxX7oi4"
  },
  "Quality Sleep": {
    importance: "Sleep is when your body repairs itself, consolidates memories, and restores energy. Proper sleep improves immune function, metabolism, and cognitive performance.",
    frequency: "Adults should get 7-9 hours of uninterrupted sleep nightly. Maintain a consistent sleep schedule, even on weekends.",
    signs: {
      good: "Waking refreshed, consistent energy throughout day, clear thinking, stable mood",
      concerning: "Difficulty falling/staying asleep, daytime drowsiness, irritability, trouble concentrating"
    },
    videoLink: "https://www.youtube.com/watch?v=t0kACis_dJE"
  },
  "Balanced Diet": {
    importance: "A nutritionally balanced diet provides the energy and nutrients your body needs to function optimally, supports immune health, and reduces risk of chronic diseases.",
    frequency: "Every meal should include vegetables or fruits (half your plate), lean protein (quarter), and whole grains (quarter). Aim for 5+ servings of fruits/vegetables daily.",
    signs: {
      good: "Stable energy, healthy weight, regular digestion, strong immune system",
      concerning: "Frequent fatigue, digestive problems, slow healing, brittle hair/nails"
    },
    videoLink: "https://www.youtube.com/watch?v=fqhYBTg73fw"
  },
  "Reduce Stress": {
    importance: "Chronic stress can lead to inflammation, weakened immunity, high blood pressure, and mental health issues. Stress management supports overall physical and mental wellbeing.",
    frequency: "Practice mindfulness, meditation, or deep breathing for at least 10-15 minutes daily. Additional sessions as needed during stressful situations.",
    signs: {
      good: "Better emotional regulation, clarity of thought, lower heart rate, improved sleep",
      concerning: "Constant worry, irritability, muscle tension, digestive issues, sleep problems"
    },
    videoLink: "https://www.youtube.com/watch?v=c1Ndym-IsQg"
  },
  "Limit Screen Time": {
    importance: "Excessive screen time can cause digital eye strain, sleep disruption (due to blue light exposure), reduced physical activity, and decreased in-person social interactions.",
    frequency: "Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds. Take 5-10 minute screen breaks every hour.",
    signs: {
      good: "Normal sleep patterns, healthy social interactions, sustained attention span",
      concerning: "Dry eyes, headaches, neck pain, disrupted sleep, difficulty focusing"
    },
    videoLink: "https://www.youtube.com/watch?v=HNgDirLLZqI"
  }
};

export default function TipDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get the title from params
  const { title, color, icon } = params;
  
  // Look up the detailed information for this tip
  const detail = tipDetails[title] || {
    importance: "Information not available.",
    frequency: "Information not available.",
    signs: {
      good: "Information not available.",
      concerning: "Information not available."
    },
    videoLink: "https://www.youtube.com/"
  };
  
  // Open YouTube video
  const openVideo = (url) => {
    Linking.openURL(url);
  };
  
  // Apply dynamic styles based on theme - Content/Information Screen (White Theme)
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: 'white', // Clean white background for content screen
    },
    header: {
      backgroundColor: 'white',
      borderBottomColor: '#E9ECEF', // Light border
    },
    title: {
      color: '#333', // Dark text on white background
    },
    contentContainer: {
      backgroundColor: 'white', // White content background
    },
    sectionTitle: {
      color: '#333', // Dark section titles
    },
    sectionText: {
      color: '#666', // Medium gray body text
    },
    videoButton: {
      backgroundColor: color || '#4ECDC4', // Use tip color or turquoise fallback
    }
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color || '#4ECDC4'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.title]}>{title}</Text>
        <View style={{width: 24}} />
      </View>
      
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: color || "#2196F3" }]}>
          <Ionicons name={icon || "information-circle"} size={60} color="#fff" />
        </View>
      </View>
      
      <View style={[styles.contentContainer, dynamicStyles.contentContainer]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Why It&apos;s Important</Text>
          <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{detail.importance}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recommended Frequency</Text>
          <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{detail.frequency}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Signs to Watch For</Text>
          <View style={styles.signsContainer}>
            <View style={styles.signBox}>
              <Text style={[styles.signTitle, { color: "#4ECDC4" }]}>Good Signs</Text>
              <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{detail.signs.good}</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={[styles.signTitle, { color: "#F44336" }]}>Concerning Signs</Text>
              <Text style={[styles.sectionText, dynamicStyles.sectionText]}>{detail.signs.concerning}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.videoButton, dynamicStyles.videoButton]} 
          onPress={() => openVideo(detail.videoLink)}
        >
          <Ionicons name="logo-youtube" size={24} color="#fff" />
          <Text style={styles.videoButtonText}>Watch Video Guide</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  signsContainer: {
    flexDirection: "column",
    marginTop: 8,
  },
  signBox: {
    marginBottom: 16,
  },
  signTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  videoButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  }
});