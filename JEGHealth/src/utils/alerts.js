import { Alert } from 'react-native';

export const showErrorAlert = (title, message) => {
  Alert.alert(title || 'Error', message);
};

export const showSuccessAlert = (title, message, onPress) => {
  Alert.alert(
    title || 'Success',
    message,
    [
      {
        text: 'OK',
        onPress,
      },
    ]
  );
};

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
      },
    ]
  );
};