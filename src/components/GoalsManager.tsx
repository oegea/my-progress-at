'use client';

import React, { useState, useRef } from 'react';
import { Plus, Upload, Download, Calendar, Target, CheckCircle, Circle, ChevronDown, ChevronRight, User, FileText, X, Edit, Trash2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-2 z-30">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-xs text-gray-400">
          Developed by{' '}
          <a 
            href="https://github.com/oegea" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Oriol Egea
          </a>{' '}
          with ❤️ (and AI 🤖) from Barcelona.{' '}
          Licensed under MIT.{' '}
          <a 
            href="https://github.com/oegea/my-progress-at" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Source code is available here
          </a>.
        </p>
      </div>
    </footer>
  )
}

export const GoalsManager = () => {
  const [person, setPerson] = useState(null);
  const [expandedStages, setExpandedStages] = useState(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const fileInputRef = useRef(null);

  const statusOptions = [
    { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'discarded', label: 'Discarded', color: 'bg-red-100 text-red-800' }
  ];

  // Modal management
  const openModal = (type, initialData = {}, editId = null) => {
    setModalType(type);
    setModalData(initialData);
    setEditingId(editId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData({});
    setModalType('');
    setEditingId(null);
  };

  // Handle close button with confirmation
  const handleCloseClick = () => {
    setShowCloseConfirmation(true);
  };

  const confirmClose = () => {
    setPerson(null);
    setShowCloseConfirmation(false);
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  // Create/Edit person
  const savePerson = (data) => {
    if (!data.name?.trim() || !data.company?.trim()) return;
    
    if (editingId) {
      setPerson(prev => ({
        ...prev,
        name: data.name.trim(),
        company: data.company.trim(),
        avatar: data.avatar || prev.avatar
      }));
    } else {
      const newPerson = {
        id: Date.now(),
        name: data.name.trim(),
        company: data.company.trim(),
        avatar: data.avatar || null,
        createdAt: new Date().toISOString(),
        stages: []
      };
      setPerson(newPerson);
    }
    closeModal();
  };

  // Load JSON file
  const handleFileLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result: string = e?.target?.result as string;
          const data = JSON.parse(result);
          setPerson(data);
          setExpandedStages(new Set());
          setExpandedObjectives(new Set());
        } catch (error) {
          console.error(error);
          alert('Error loading JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Download data as JSON
  const downloadData = () => {
    const dataStr = JSON.stringify(person, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${person.name.replace(/\s+/g, '_')}_development.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Create/Edit stage
  const saveStage = (data) => {
    if (!data.name?.trim()) return;
    
    const stageData = {
      name: data.name.trim(),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      description: data.description || '',
      status: data.status || 'planned'
    };

    if (editingId) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === editingId ? { ...stage, ...stageData } : stage
        )
      }));
    } else {
      const newStage = {
        id: Date.now(),
        ...stageData,
        objectives: [],
        feedback: []
      };
      setPerson(prev => ({
        ...prev,
        stages: [...prev.stages, newStage]
      }));
    }
    closeModal();
  };

  // Delete stage
  const deleteStage = (stageId) => {
    if (confirm('Are you sure you want to delete this stage and all its objectives?')) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.filter(stage => stage.id !== stageId)
      }));
    }
  };

  // Create/Edit objective
  const saveObjective = (data) => {
    if (!data.title?.trim() || !data.stageId) return;

    const objectiveData = {
      title: data.title.trim(),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      motivation: data.motivation || '',
      expectedResults: data.expectedResults || '',
      status: data.status || 'planned'
    };

    if (editingId) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === editingId ? { ...obj, ...objectiveData } : obj
                )
              }
            : stage
        )
      }));
    } else {
      const newObjective = {
        id: Date.now(),
        ...objectiveData,
        tasks: [],
        outcomes: []
      };
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? { ...stage, objectives: [...stage.objectives, newObjective] }
            : stage
        )
      }));
    }
    closeModal();
  };

  // Delete objective
  const deleteObjective = (stageId, objectiveId) => {
    if (confirm('Are you sure you want to delete this objective and all its tasks?')) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                objectives: stage.objectives.filter(obj => obj.id !== objectiveId)
              }
            : stage
        )
      }));
    }
  };

  // Create/Edit task
  const saveTask = (data) => {
    if (!data.description?.trim() || !data.stageId || !data.objectiveId) return;

    const taskData = {
      description: data.description.trim(),
      completed: data.completed || false,
      completedAt: data.completed ? new Date().toISOString() : null
    };

    if (editingId) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === data.objectiveId
                    ? {
                        ...obj,
                        tasks: obj.tasks.map(task =>
                          task.id === editingId ? { ...task, ...taskData } : task
                        )
                      }
                    : obj
                )
              }
            : stage
        )
      }));
    } else {
      const newTask = {
        id: Date.now(),
        ...taskData
      };
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === data.objectiveId
                    ? { ...obj, tasks: [...obj.tasks, newTask] }
                    : obj
                )
              }
            : stage
        )
      }));
    }
    closeModal();
  };

  // Delete task
  const deleteTask = (stageId, objectiveId, taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === objectiveId
                    ? {
                        ...obj,
                        tasks: obj.tasks.filter(task => task.id !== taskId)
                      }
                    : obj
                )
              }
            : stage
        )
      }));
    }
  };

  // Create/Edit feedback
  const saveFeedback = (data) => {
    if (!data.comment?.trim() || !data.author?.trim() || !data.stageId) return;

    const newFeedback = {
      id: Date.now(),
      author: data.author.trim(),
      comment: data.comment.trim(),
      createdAt: new Date().toISOString()
    };

    setPerson(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === data.stageId
          ? { ...stage, feedback: [newFeedback, ...(stage.feedback || [])] }
          : stage
      )
    }));
    closeModal();
  };

  // Delete feedback
  const deleteFeedback = (stageId, feedbackId) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                feedback: (stage.feedback || []).filter(feedback => feedback.id !== feedbackId)
              }
            : stage
        )
      }));
    }
  };
  const saveOutcome = (data) => {
    if (!data.description?.trim() || !data.stageId || !data.objectiveId) return;

    const outcomeData = {
      description: data.description.trim(),
      achieved: data.achieved || false,
      achievedAt: data.achieved ? new Date().toISOString() : null
    };

    if (editingId) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === data.objectiveId
                    ? {
                        ...obj,
                        outcomes: obj.outcomes.map(outcome =>
                          outcome.id === editingId ? { ...outcome, ...outcomeData } : outcome
                        )
                      }
                    : obj
                )
              }
            : stage
        )
      }));
    } else {
      const newOutcome = {
        id: Date.now(),
        ...outcomeData
      };
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === data.stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === data.objectiveId
                    ? { ...obj, outcomes: [...(obj.outcomes || []), newOutcome] }
                    : obj
                )
              }
            : stage
        )
      }));
    }
    closeModal();
  };

  // Delete outcome
  const deleteOutcome = (stageId, objectiveId, outcomeId) => {
    if (confirm('Are you sure you want to delete this result?')) {
      setPerson(prev => ({
        ...prev,
        stages: prev.stages.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                objectives: stage.objectives.map(obj =>
                  obj.id === objectiveId
                    ? {
                        ...obj,
                        outcomes: (obj.outcomes || []).filter(outcome => outcome.id !== outcomeId)
                      }
                    : obj
                )
              }
            : stage
        )
      }));
    }
  };

  // Toggle task completion
  const toggleTask = (stageId, objectiveId, taskId) => {
    setPerson(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,
              objectives: stage.objectives.map(obj =>
                obj.id === objectiveId
                  ? {
                      ...obj,
                      tasks: obj.tasks.map(task =>
                        task.id === taskId
                          ? {
                              ...task,
                              completed: !task.completed,
                              completedAt: !task.completed ? new Date().toISOString() : null
                            }
                          : task
                      )
                    }
                  : obj
              )
            }
          : stage
      )
    }));
  };

  // Toggle outcome achievement
  const toggleOutcome = (stageId, objectiveId, outcomeId) => {
    setPerson(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,
              objectives: stage.objectives.map(obj =>
                obj.id === objectiveId
                  ? {
                      ...obj,
                      outcomes: (obj.outcomes || []).map(outcome =>
                        outcome.id === outcomeId
                          ? {
                              ...outcome,
                              achieved: !outcome.achieved,
                              achievedAt: !outcome.achieved ? new Date().toISOString() : null
                            }
                          : outcome
                      )
                    }
                  : obj
              )
            }
          : stage
      )
    }));
  };

  // Toggle expansion
  const toggleStageExpansion = (stageId) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const toggleObjectiveExpansion = (objectiveId) => {
    setExpandedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  };

  // Calculate progress
  const getObjectiveProgress = (objective) => {
    const tasks = objective.tasks || [];
    const outcomes = objective.outcomes || [];
    const totalItems = tasks.length + outcomes.length;
    
    if (totalItems === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const achievedOutcomes = outcomes.filter(outcome => outcome.achieved).length;
    
    return Math.round(((completedTasks + achievedOutcomes) / totalItems) * 100);
  };

  const getStageProgress = (stage) => {
    if (stage.objectives.length === 0) return 0;
    const totalProgress = stage.objectives.reduce((sum, obj) => sum + getObjectiveProgress(obj), 0);
    return Math.round(totalProgress / stage.objectives.length);
  };

  // Close Confirmation Modal Component
  const CloseConfirmationModal = () => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Close</h3>
              <button
                onClick={cancelClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to close? Any unsaved changes will be lost.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Close Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  // Modal Component
  const Modal = () => {
    const [formData, setFormData] = useState<any>(modalData);

    const updateFormData = (key, value) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Handle avatar upload
    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('File size must be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          updateFormData('avatar', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const removeAvatar = () => {
      updateFormData('avatar', null);
    };

    const handleSubmit = () => {
      switch (modalType) {
        case 'person':
          savePerson(formData);
          break;
        case 'stage':
          saveStage(formData);
          break;
        case 'objective':
          saveObjective(formData);
          break;
        case 'task':
          saveTask(formData);
          break;
        case 'outcome':
          saveOutcome(formData);
          break;
        case 'feedback':
          saveFeedback(formData);
          break;
        default:
          break;
      }
    };

    const isFormValid = () => {
      switch (modalType) {
        case 'person':
          return formData.name?.trim() && formData.company?.trim();
        case 'stage':
          return formData.name?.trim();
        case 'objective':
          return formData.title?.trim();
        case 'task':
          return formData.description?.trim();
        case 'outcome':
          return formData.description?.trim();
        case 'feedback':
          return formData.comment?.trim() && formData.author?.trim();
        default:
          return false;
      }
    };

    const getModalTitle = () => {
      const action = editingId ? 'Edit' : 'New';
      switch (modalType) {
        case 'person': return `${action} Profile`;
        case 'stage': return `${action} Stage`;
        case 'objective': return `${action} Objective`;
        case 'task': return `${action} Task`;
        case 'outcome': return `${action} Result`;
        case 'feedback': return `${action} Feedback`;
        default: return '';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{getModalTitle()}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalType === 'person' && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                        {formData.avatar ? (
                          <img 
                            src={formData.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      {formData.avatar && (
                        <button
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        {formData.avatar ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Optional - Max 5MB</p>
                    </div>
                  </div>

                  {/* Inline Introduction */}
                  <div className="text-center">
                    <div className="text-2xl text-gray-800 leading-relaxed">
                      Hello, my name is{' '}
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="your name"
                        className="inline-block min-w-[200px] max-w-[300px] px-2 py-1 border-b-2 border-blue-300 focus:border-blue-500 bg-transparent text-center outline-none font-medium"
                        style={{ width: `${Math.max(120, (formData.name || 'your name').length * 14)}px` }}
                      />
                    </div>
                    <div className="text-2xl text-gray-800 leading-relaxed mt-4">
                      and this is My Progress At{' '}
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => updateFormData('company', e.target.value)}
                        placeholder="company name"
                        className="inline-block min-w-[200px] max-w-[300px] px-2 py-1 border-b-2 border-purple-300 focus:border-purple-500 bg-transparent text-center outline-none font-medium"
                        style={{ width: `${Math.max(140, (formData.company || 'company name').length * 14)}px` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'stage' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="e.g. Onboarding, Q1 2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'planned'}
                      onChange={(e) => updateFormData('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe the general objectives of this stage..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {modalType === 'objective' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objective title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="e.g. Master development tools"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'planned'}
                      onChange={(e) => updateFormData('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivation/Purpose
                    </label>
                    <textarea
                      value={formData.motivation || ''}
                      onChange={(e) => updateFormData('motivation', e.target.value)}
                      placeholder="Why this objective is important..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected results
                    </label>
                    <textarea
                      value={formData.expectedResults || ''}
                      onChange={(e) => updateFormData('expectedResults', e.target.value)}
                      placeholder="What is expected to be achieved by completing this objective..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {modalType === 'task' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe what needs to be done..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}

              {modalType === 'outcome' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Result description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe the expected result..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}

              {modalType === 'feedback' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => updateFormData('author', e.target.value)}
                      placeholder="Who is providing this feedback?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.comment || ''}
                      onChange={(e) => updateFormData('comment', e.target.value)}
                      placeholder="Share your feedback, comments, or constructive observations..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {editingId ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Initial screen
  if (!person) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <img src="/logo.png" alt="Next.js logo" className="max-w-[50%] w-[50%] mx-auto mb-4" />
            </div>

            <div className="space-y-4">
              <div>
                <button
                  onClick={() => openModal('person')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                  Create New Profile
                </button>
              </div>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileLoad}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Load JSON File
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        {showModal && <Modal />}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-40">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                  {person.avatar ? (
                    <img 
                      src={person.avatar} 
                      alt={person.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800">
                      {person.name}@{person.company || 'Company'}
                    </h1>
                    <button
                      onClick={() => openModal('person', { name: person.name, company: person.company, avatar: person.avatar }, person.id)}
                      className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(person.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCloseClick}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - With top padding to account for fixed header */}
        <div className="pt-32 max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Development Stages</h2>
            <button
              onClick={() => openModal('stage')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Stage
            </button>
          </div>

          {person.stages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No stages created</p>
              <p className="text-gray-400">Start by adding the first development stage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {person.stages
                .sort((a, b) => (new Date(b.startDate || b.createdAt || 0) as any) - (new Date(a.startDate || a.createdAt || 0) as any))
                .map((stage) => (
                <div key={stage.id} className="bg-white rounded-lg shadow border">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleStageExpansion(stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedStages.has(stage.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(stage.status).color}`}>
                              {getStatusInfo(stage.status).label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {stage.startDate} {stage.endDate && `- ${stage.endDate}`}
                            </span>
                            <span>{stage.objectives.length} objectives</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {getStageProgress(stage)}% completed
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${getStageProgress(stage)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openModal('stage', stage, stage.id)}
                            className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStage(stage.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {stage.description && (
                      <p className="mt-2 text-gray-600 ml-8">{stage.description}</p>
                    )}
                  </div>

                  {expandedStages.has(stage.id) && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-700">Objectives</h4>
                          <button
                            onClick={() => openModal('objective', { stageId: stage.id })}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Objective
                          </button>
                        </div>

                        {stage.objectives.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No objectives defined</p>
                        ) : (
                          <div className="space-y-3">
                            {stage.objectives
                              .sort((a, b) => (new Date(b.startDate || b.createdAt || 0) as any) - (new Date(a.startDate || a.createdAt || 0) as any))
                              .map((objective) => (
                                <div key={objective.id} className="bg-white rounded border">
                                  <div
                                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleObjectiveExpansion(objective.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {expandedObjectives.has(objective.id) ? (
                                          <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                        <Target className="h-4 w-4 text-orange-500" />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium text-gray-800">{objective.title}</h5>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(objective.status).color}`}>
                                              {getStatusInfo(objective.status).label}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {objective.startDate} {objective.endDate && `- ${objective.endDate}`}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          <div className="text-xs font-medium text-gray-600">
                                            {getObjectiveProgress(objective)}%
                                          </div>
                                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                            <div
                                              className="bg-orange-500 h-1.5 rounded-full transition-all"
                                              style={{ width: `${getObjectiveProgress(objective)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => openModal('objective', { ...objective, stageId: stage.id }, objective.id)}
                                            className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteObjective(stage.id, objective.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {expandedObjectives.has(objective.id) && (
                                    <div className="border-t bg-gray-50 p-3">
                                      {objective.motivation && (
                                        <div className="mb-3">
                                          <h6 className="text-xs font-medium text-gray-600 mb-1">Motivation</h6>
                                          <p className="text-sm text-gray-700">{objective.motivation}</p>
                                        </div>
                                      )}
                                      
                                      {objective.expectedResults && (
                                        <div className="mb-3">
                                          <h6 className="text-xs font-medium text-gray-600 mb-1">Expected Results</h6>
                                          <p className="text-sm text-gray-700">{objective.expectedResults}</p>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Tasks */}
                                        <div>
                                          <div className="flex justify-between items-center mb-2">
                                            <h6 className="text-xs font-medium text-gray-600">Tasks</h6>
                                            <button
                                              onClick={() => openModal('task', { stageId: stage.id, objectiveId: objective.id })}
                                              className="flex items-center gap-1 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors cursor-pointer"
                                            >
                                              <Plus className="h-3 w-3" />
                                              Task
                                            </button>
                                          </div>

                                          {(!objective.tasks || objective.tasks.length === 0) ? (
                                            <p className="text-xs text-gray-500 text-center py-2">No tasks defined</p>
                                          ) : (
                                            <div className="space-y-2">
                                              {objective.tasks.map((task) => (
                                                <div
                                                  key={task.id}
                                                  className="flex items-center gap-2 p-2 bg-white rounded border group"
                                                >
                                                  <button
                                                    onClick={() => toggleTask(stage.id, objective.id, task.id)}
                                                    className="flex-shrink-0 cursor-pointer"
                                                  >
                                                    {task.completed ? (
                                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                      <Circle className="h-4 w-4 text-gray-400" />
                                                    )}
                                                  </button>
                                                  <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                    {task.description}
                                                  </span>
                                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => openModal('task', { ...task, stageId: stage.id, objectiveId: objective.id }, task.id)}
                                                      className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                    >
                                                      <Edit className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => deleteTask(stage.id, objective.id, task.id)}
                                                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </button>
                                                  </div>
                                                  {task.completed && task.completedAt && (
                                                    <span className="text-xs text-gray-400">
                                                      {new Date(task.completedAt).toLocaleDateString()}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Results */}
                                        <div>
                                          <div className="flex justify-between items-center mb-2">
                                            <h6 className="text-xs font-medium text-gray-600">Results</h6>
                                            <button
                                              onClick={() => openModal('outcome', { stageId: stage.id, objectiveId: objective.id })}
                                              className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors cursor-pointer"
                                            >
                                              <Plus className="h-3 w-3" />
                                              Result
                                            </button>
                                          </div>

                                          {(!objective.outcomes || objective.outcomes.length === 0) ? (
                                            <p className="text-xs text-gray-500 text-center py-2">No results defined</p>
                                          ) : (
                                            <div className="space-y-2">
                                              {objective.outcomes.map((outcome) => (
                                                <div
                                                  key={outcome.id}
                                                  className="flex items-center gap-2 p-2 bg-white rounded border group"
                                                >
                                                  <button
                                                    onClick={() => toggleOutcome(stage.id, objective.id, outcome.id)}
                                                    className="flex-shrink-0 cursor-pointer"
                                                  >
                                                    {outcome.achieved ? (
                                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                      <Circle className="h-4 w-4 text-gray-400" />
                                                    )}
                                                  </button>
                                                  <span className={`text-sm flex-1 ${outcome.achieved ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                    {outcome.description}
                                                  </span>
                                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => openModal('outcome', { ...outcome, stageId: stage.id, objectiveId: objective.id }, outcome.id)}
                                                      className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                    >
                                                      <Edit className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => deleteOutcome(stage.id, objective.id, outcome.id)}
                                                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </button>
                                                  </div>
                                                  {outcome.achieved && outcome.achievedAt && (
                                                    <span className="text-xs text-gray-400">
                                                      {new Date(outcome.achievedAt).toLocaleDateString()}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Feedback Section - At Stage Level */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-700">Feedback & Comments</h4>
                            <button
                              onClick={() => openModal('feedback', { stageId: stage.id })}
                              className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              Add Feedback
                            </button>
                          </div>

                          {(!stage.feedback || stage.feedback.length === 0) ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                              <p className="text-sm text-gray-500">No feedback yet</p>
                              <p className="text-xs text-gray-400 mt-1">Be the first to share feedback on this stage</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {stage.feedback.map((feedback) => (
                                <div key={feedback.id} className="bg-white rounded-lg border p-4 shadow-sm group">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                                        {feedback.author === person.name && person.avatar ? (
                                          <img 
                                            src={person.avatar} 
                                            alt={feedback.author} 
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <User className="h-4 w-4 text-purple-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-800">{feedback.author}</p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteFeedback(stage.id, feedback.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="ml-10">
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <Footer />
      </div>
      {showModal && <Modal />}
      {showCloseConfirmation && <CloseConfirmationModal />}
    </>
  );
};