import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onNavigate: () => void;
};

interface User {
  firstName: string;
  lastName: string;
}

const user: User = {
  firstName: 'Chung',
  lastName: 'Mai'
};

// 2. Chỉ định tham số `user` phải có kiểu dữ liệu là `User`
function formatName(user: User) {
  return user.firstName + ' ' + user.lastName;
}

export function HelloWorldScreen({ onNavigate }: Props) {
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, {formatName(user)}</Text>
      <TouchableOpacity style={styles.button} onPress={onNavigate}>
        <Text style={styles.buttonText}>Xem danh sách rau củ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
