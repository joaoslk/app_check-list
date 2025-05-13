import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function ChecklistScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  };

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: input,
      completed: false,
      createdAt: new Date().toLocaleString(),
    };
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleComplete = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
  };

  const removeCompletedTasks = () => {
    const remaining = tasks.filter(t => !t.completed);
    setTasks(remaining);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.task, item.completed && styles.taskCompleted]}>
      <Checkbox
        value={item.completed}
        onValueChange={() => toggleComplete(item.id)}
      />
      <View style={styles.taskInfo}>
        <Text style={[styles.taskText, item.completed && styles.textDone]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>{item.createdAt}</Text>
      </View>
    </View>
  );

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CheckList</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Nova tarefa"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pendingTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
      />

      {completedTasks.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>Concluídas</Text>
          <FlatList
            data={completedTasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
          />
          <TouchableOpacity style={styles.clearButton} onPress={removeCompletedTasks}>
            <Text style={styles.clearButtonText}>Remover tarefas concluídas</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf1f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  task: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCompleted: {
    backgroundColor: '#d3f9d8',
  },
  taskInfo: {
    marginLeft: 10,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  completedSection: {
    marginTop: 30,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    alignSelf: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    margin: 70,
    padding: 10,
    borderRadius: 6,
    marginTop: 100,
    alignSelf: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
