import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import { uploadDocument } from '../services/api';

export const DocumentsUploadScreen = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    title: '',
    category: '',
    description: '',
    equipment_tags: '',
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        
        if (!metadata.title) {
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          setMetadata({ ...metadata, title: fileName });
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a document first');
      return;
    }

    if (!metadata.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a document title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const tagsArray = metadata.equipment_tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const uploadMetadata = {
        title: metadata.title,
        category: metadata.category || 'general',
        description: metadata.description,
        equipment_tags: tagsArray,
      };

      await uploadDocument(
        selectedFile.uri,
        selectedFile.name,
        selectedFile.mimeType,
        uploadMetadata,
        (progress) => setUploadProgress(progress)
      );

      Alert.alert('Success', 'Document uploaded successfully!');
      setSelectedFile(null);
      setMetadata({ title: '', category: '', description: '', equipment_tags: '' });
      setUploadProgress(0);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      Alert.alert('Upload Failed', error.message || 'Could not upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>Upload</Text> Document
        </Text>
        <Text style={styles.subtitle}>Add to knowledge base</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={handlePickDocument}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <BlurView intensity={40} tint="dark" style={styles.pickerContent}>
            <Text style={styles.pickerIcon}>📎</Text>
            <Text style={styles.pickerText}>
              {selectedFile ? 'Change Document' : 'Pick Document'}
            </Text>
            <Text style={styles.pickerHint}>PDF, DOC, XLS, Images</Text>
          </BlurView>
        </TouchableOpacity>

        {selectedFile && (
          <BlurView intensity={30} tint="dark" style={styles.fileInfoCard}>
            <View style={styles.fileHeader}>
              <Text style={styles.fileIcon}>📄</Text>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
              {!uploading && (
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        )}

        {selectedFile && (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>DOCUMENT INFORMATION</Text>
            
            <BlurView intensity={30} tint="dark" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Pump P-101A Manual"
                placeholderTextColor="#64748B"
                value={metadata.title}
                onChangeText={(text) => setMetadata({ ...metadata, title: text })}
                editable={!uploading}
              />
            </BlurView>

            <BlurView intensity={30} tint="dark" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., maintenance, safety"
                placeholderTextColor="#64748B"
                value={metadata.category}
                onChangeText={(text) => setMetadata({ ...metadata, category: text })}
                editable={!uploading}
              />
            </BlurView>

            <BlurView intensity={30} tint="dark" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Equipment Tags</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., P-101A, HX-201 (comma separated)"
                placeholderTextColor="#64748B"
                value={metadata.equipment_tags}
                onChangeText={(text) => setMetadata({ ...metadata, equipment_tags: text })}
                editable={!uploading}
              />
            </BlurView>

            <BlurView intensity={30} tint="dark" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description..."
                placeholderTextColor="#64748B"
                value={metadata.description}
                onChangeText={(text) => setMetadata({ ...metadata, description: text })}
                multiline
                numberOfLines={4}
                editable={!uploading}
              />
            </BlurView>
          </View>
        )}

        {uploading && (
          <BlurView intensity={40} tint="dark" style={styles.progressCard}>
            <Text style={styles.progressTitle}>Uploading Document</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            <ActivityIndicator size="small" color="#60A5FA" style={{ marginTop: 10 }} />
          </BlurView>
        )}

        {selectedFile && !uploading && (
          <TouchableOpacity 
            style={[styles.uploadButton, !metadata.title.trim() && styles.uploadButtonDisabled]} 
            onPress={handleUpload}
            disabled={!metadata.title.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadButtonText}>Upload to Knowledge Base</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  titleHighlight: { color: '#60A5FA' },
  subtitle: { color: '#94A3B8', fontSize: 16, marginTop: 6, fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 20 },
  pickerButton: { marginBottom: 20 },
  pickerContent: { borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(96, 165, 250, 0.3)', borderStyle: 'dashed', overflow: 'hidden' },
  pickerIcon: { fontSize: 48, marginBottom: 15 },
  pickerText: { color: '#60A5FA', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  pickerHint: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  fileInfoCard: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  fileHeader: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { fontSize: 32, marginRight: 12 },
  fileDetails: { flex: 1 },
  fileName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fileSize: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  removeButton: { color: '#EF4444', fontSize: 24, fontWeight: '600', paddingHorizontal: 10 },
  formSection: { marginBottom: 20 },
  formLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 1.5 },
  inputCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  inputLabel: { color: '#60A5FA', fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  input: { color: '#F8FAFC', fontSize: 16, fontWeight: '500' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  progressCard: { borderRadius: 16, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)', alignItems: 'center', overflow: 'hidden' },
  progressTitle: { color: '#60A5FA', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  progressBarContainer: { width: '100%', height: 8, backgroundColor: 'rgba(100, 116, 139, 0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#60A5FA', borderRadius: 4 },
  progressText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  uploadButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  uploadButtonDisabled: { backgroundColor: 'rgba(59, 130, 246, 0.4)' },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
