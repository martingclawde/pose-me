import {useState} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'Library' | 'Camera' | 'Favorites'>(
    'Library',
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text testID="screen-title" style={styles.title}>
          Pose Me
        </Text>
        <Text style={styles.subtitle}>Instagram-ready shots in minutes.</Text>
      </View>

      <View style={styles.libraryPanel}>
        <Text style={styles.panelTitle}>{activeTab}</Text>
        <Text style={styles.panelBody}>
          {activeTab === 'Library'
            ? 'Select a pose card to open Camera with PiP.'
            : activeTab === 'Camera'
              ? 'Camera flow starts here.'
              : 'Save your best pose cards here.'}
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TabButton
          isActive={activeTab === 'Library'}
          label="Library"
          onPress={() => setActiveTab('Library')}
        />
        <TabButton
          isActive={activeTab === 'Camera'}
          label="Camera"
          onPress={() => setActiveTab('Camera')}
        />
        <TabButton
          isActive={activeTab === 'Favorites'}
          label="Favorites"
          onPress={() => setActiveTab('Favorites')}
        />
      </View>
    </SafeAreaView>
  );
}

interface TabButtonProps {
  label: 'Library' | 'Camera' | 'Favorites';
  isActive: boolean;
  onPress: () => void;
}

function TabButton({label, isActive, onPress}: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe8',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    gap: 6,
  },
  title: {
    color: '#1f2a24',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#48554f',
    fontSize: 14,
  },
  libraryPanel: {
    flex: 1,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: '#fffefb',
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5ddd0',
    justifyContent: 'center',
  },
  panelTitle: {
    color: '#1f2a24',
    fontSize: 24,
    fontWeight: '700',
  },
  panelBody: {
    marginTop: 10,
    color: '#46524c',
    fontSize: 15,
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6ccbd',
    backgroundColor: '#f8f2e8',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    backgroundColor: '#1f2a24',
    borderColor: '#1f2a24',
  },
  tabLabel: {
    color: '#37453f',
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#f7f5ef',
  },
});

export default App;
