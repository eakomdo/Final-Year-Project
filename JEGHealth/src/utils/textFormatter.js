import React from 'react';
import { Text, View } from 'react-native';

/**
 * Utility to render AI-generated text with basic markdown formatting
 * Supports: **bold**, *italic*, ##headers##, and line breaks
 */

export const renderFormattedText = (text, baseStyle = {}) => {
  if (!text) return null;

  // Split text by markdown patterns while preserving them
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|##[^#]+##)/g);
  
  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        // Check for bold text (**text**)
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <Text key={`bold-${index}`} style={[baseStyle, { fontWeight: 'bold' }]}>
              {boldText}
            </Text>
          );
        }
        
        // Check for italic text (*text*)
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          const italicText = part.slice(1, -1);
          return (
            <Text key={`italic-${index}`} style={[baseStyle, { fontStyle: 'italic' }]}>
              {italicText}
            </Text>
          );
        }
        
        // Check for headers (##text##)
        if (part.startsWith('##') && part.endsWith('##')) {
          const headerText = part.slice(2, -2);
          return (
            <Text key={`header-${index}`} style={[
              baseStyle, 
              { 
                fontWeight: 'bold', 
                fontSize: (baseStyle.fontSize || 16) + 2,
                marginVertical: 4
              }
            ]}>
              {headerText}
            </Text>
          );
        }
        
        // Regular text - handle line breaks
        return (
          <Text key={`text-${index}`} style={baseStyle}>
            {part.split('\n').map((line, lineIndex, lines) => (
              <React.Fragment key={`line-${index}-${lineIndex}`}>
                {line}
                {lineIndex < lines.length - 1 && '\n'}
              </React.Fragment>
            ))}
          </Text>
        );
      })}
    </Text>
  );
};

/**
 * Enhanced text renderer with more markdown features
 * Supports nested formatting and lists
 */
export const renderAdvancedFormattedText = (text, baseStyle = {}) => {
  if (!text) return null;

  // Split text into lines for better processing
  const lines = text.split('\n');
  
  return (
    <View>
      {lines.map((line, lineIndex) => {
        // Check for list items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const listText = line.trim().substring(2);
          return (
            <View key={`list-${lineIndex}`} style={{ flexDirection: 'row', marginVertical: 2 }}>
              <Text style={[baseStyle, { marginRight: 8 }]}>•</Text>
              {renderFormattedText(listText, baseStyle)}
            </View>
          );
        }
        
        // Check for numbered lists
        const numberedMatch = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          const [, number, listText] = numberedMatch;
          return (
            <View key={`numbered-${lineIndex}`} style={{ flexDirection: 'row', marginVertical: 2 }}>
              <Text style={[baseStyle, { marginRight: 8 }]}>{number}.</Text>
              {renderFormattedText(listText, baseStyle)}
            </View>
          );
        }
        
        // Regular line with formatting
        return (
          <View key={`line-${lineIndex}`} style={{ marginVertical: line.trim() ? 2 : 8 }}>
            {renderFormattedText(line, baseStyle)}
          </View>
        );
      })}
    </View>
  );
};

export default { renderFormattedText, renderAdvancedFormattedText };
