import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Tab<Id extends string> {
  id: Id;
  label: string;
}

interface TabBarProps<Id extends string> {
  tabs: readonly Tab<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
}

// Generic over the tab id type (slide 22): TabBar<'all' | 'favorites'>.
export default class TabBar<Id extends string> extends React.Component<TabBarProps<Id>> {
  override render() {
    const { tabs, active, onSelect } = this.props;
    return (
      <View style={styles.bar}>
        {tabs.map(tab => {
          const isActive = tab.id === active;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabOn]}
              onPress={() => onSelect(tab.id)}>
              <Text style={[styles.text, isActive && styles.textOn]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#eceef3', borderRadius: 12, padding: 3 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  tabOn: { backgroundColor: '#4f6df5' },
  text: { color: '#333', fontWeight: '600' },
  textOn: { color: '#fff' },
});
