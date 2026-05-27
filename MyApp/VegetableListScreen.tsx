import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Vegetable = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

const vegetables: Vegetable[] = [
  { id: '1', name: 'Cà rốt', emoji: '🥕', color: '#FF7043' },
  { id: '2', name: 'Bông cải xanh', emoji: '🥦', color: '#43A047' },
  { id: '3', name: 'Cà chua', emoji: '🍅', color: '#E53935' },
  { id: '4', name: 'Bắp cải', emoji: '🥬', color: '#66BB6A' },
  { id: '5', name: 'Khoai tây', emoji: '🥔', color: '#A1887F' },
  { id: '6', name: 'Ớt chuông', emoji: '🫑', color: '#FDD835' },
  { id: '7', name: 'Dưa chuột', emoji: '🥒', color: '#26A69A' },
  { id: '8', name: 'Hành tây', emoji: '🧅', color: '#8D6E63' },
];

function VegetableItem({ item }: { item: Vegetable }) {
  return (
    <View style={[styles.item, { borderLeftColor: item.color }]}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );
}

type Props = {
  onBack: () => void;
};

export function VegetableListScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Danh sách rau củ</Text>
        <View style={styles.navRight} />
      </View>
      <FlatList
        data={vegetables}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <VegetableItem item={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
  },
  backText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  navRight: {
    minWidth: 80,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emoji: {
    fontSize: 32,
    marginRight: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
