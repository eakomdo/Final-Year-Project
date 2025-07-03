import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = ({
  title,
  onBackPress,
  showBackButton = true,
  rightComponent,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 34,
    height: 34,
  },
});

export default CustomHeader;