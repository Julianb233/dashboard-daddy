'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Phone, Mail, MapPin, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RelationshipStats, FerrazziCircles, RoleBreakdown, NeedsAttention } from '@/components/relationships/RelationshipVisuals';
import { 
  CircleDistributionChart, 
  RoleDistributionChart, 
  IncomeProjectionChart, 
  RelationshipStrengthRadar,
  InteractionTimeline,
  TopTagsChart,
  ConversationTopicsChart
} from '@/components/relationships/RelationshipCharts';
import PersonDetailPanel from '@/components/relationships/PersonDetailPanel';

interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  timezone?: string;
  notes?: string;
  tags: string[];
  last_contacted?: string;
  next_follow_up?: string;
  contact_frequency?: number;
  relationship_type: 'contact' | 'client' | 'prospect' | 'partner' | 'friend' | 'family' | 'colleague';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'blocked';
  social_links: Record<string, string>;
  address: Record<string, string>;
  birthday?: string;
  anniversary?: string;
  contact_history?: ContactHistory[];
  created_at: string;
  updated_at: string;
}

interface ContactHistory {
  id: string;
  contact_type: 'email' | 'phone' | 'meeting' | 'text' | 'social' | 'other';
  subject?: string;
  notes?: string;
  outcome?: string;
  next_action?: string;
  contact_date: string;
}

interface PersonFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  notes: string;
  tags: string[];
  nextFollowUp: string;
  contactFrequency: number | null;
  relationshipType: string;
  priority: string;
  status: string;
}

interface OutreachItem {
  id: string;
  person_id: string;
  person_name: string;
  phone?: string;
  circle: string;
  role: string;
  trigger_type: string;
  priority: string;
  reason: string;
  message_draft: string;
  contact_info: {
    phone?: string;
    email?: string;
  };
  last_contact?: {
    type?: string;
    days_ago?: number;
  };
}

const RelationshipsPage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showDailyOutreach, setShowDailyOutreach] = useState(false);
  const [outreaches, setOutreaches] = useState<OutreachItem[]>([]);
  const [loadingOutreaches, setLoadingOutreaches] = useState(false);
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);
  const [processingOutreach, setProcessingOutreach] = useState<string | null>(null);
  const [delayDropdownOpen, setDelayDropdownOpen] = useState<string | null>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    notes: '',
    tags: [],
    nextFollowUp: '',
    contactFrequency: null,
    relationshipType: 'contact',
    priority: 'medium',
    status: 'active'
  });

  useEffect(() => {
    fetchPeople();
  }, [searchTerm, filterType, filterPriority, showFollowUps]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (showFollowUps) params.append('followUp', 'true');
      
      const response = await fetch(`/api/relationships?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPeople(data.people || []);
      } else {
        console.error('Error fetching people:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      notes: '',
      tags: [],
      nextFollowUp: '',
      contactFrequency: null,
      relationshipType: 'contact',
      priority: 'medium',
      status: 'active'
    });
    setEditingPerson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        title: formData.title || null,
        notes: formData.notes || null,
        tags: formData.tags,
        nextFollowUp: formData.nextFollowUp || null,
        contactFrequency: formData.contactFrequency,
        relationshipType: formData.relationshipType,
        priority: formData.priority,
        status: formData.status
      };

      const url = editingPerson 
        ? `/api/relationships/${editingPerson.id}`
        : '/api/relationships';
      
      const method = editingPerson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchPeople();
      } else {
        const data = await response.json();
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Error saving person');
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email || '',
      phone: person.phone || '',
      company: person.company || '',
      title: person.title || '',
      notes: person.notes || '',
      tags: person.tags || [],
      nextFollowUp: person.next_follow_up ? person.next_follow_up.split('T')[0] : '',
      contactFrequency: person.contact_frequency,
      relationshipType: person.relationship_type,
      priority: person.priority,
      status: person.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return;
    
    try {
      const response = await fetch(`/api/relationships/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPeople();
      } else {
        const data = await response.json();
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Error deleting person');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getFollowUpStatus = (nextFollowUp?: string) => {
    if (!nextFollowUp) return { status: 'none', text: 'No follow-up set', color: 'text-gray-400' };
    
    const followUpDate = new Date(nextFollowUp);
    const now = new Date();
    const diffTime = followUpDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-500' };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Due today', color: 'text-yellow-500' };
    } else if (diffDays <= 7) {
      return { status: 'soon', text: `Due in ${diffDays} days`, color: 'text-orange-500' };
    } else {
      return { status: 'future', text: `Due in ${diffDays} days`, color: 'text-green-500' };
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'blocked': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const fetchOutreaches = async () => {
    try {
      setLoadingOutreaches(true);
      const response = await fetch('/api/relationships/outreach');
      const data = await response.json();
      
      if (response.ok) {
        setOutreaches(data.outreaches || []);
      } else {
        console.error('Error fetching outreaches:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingOutreaches(false);
    }
  };

  const sendMessage = async (outreachId: string, personId: string, message: string) => {
    try {
      setSendingMessage(outreachId);
      
      const response = await fetch('/api/relationships/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personId,
          message: message,
          contact_method: 'text'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove the sent outreach from the list
        setOutreaches(outreaches.filter(o => o.id !== outreachId));
        alert('Message sent successfully!');
        
        // Refresh people data to update last contact dates
        fetchPeople();
      } else {
        alert('Error sending message: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setSendingMessage(null);
    }
  };

  const skipOutreach = (outreachId: string) => {
    setOutreaches(outreaches.filter(o => o.id !== outreachId));
  };

  const approveOutreach = async (outreachId: string, personId: string, message: string, originalTrigger: any) => {
    try {
      setProcessingOutreach(outreachId);
      
      const response = await fetch('/api/relationships/outreach/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personId,
          message: message,
          original_trigger: originalTrigger
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove from outreach list
        setOutreaches(outreaches.filter(o => o.id !== outreachId));
        
        const scheduleTime = new Date(data.scheduled_time);
        alert(`✅ Message approved! It will be sent to ${data.person_name} at the optimal time (${scheduleTime.toLocaleString()})`);
      } else {
        alert('Error approving outreach: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving outreach:', error);
      alert('Error approving outreach');
    } finally {
      setProcessingOutreach(null);
    }
  };

  const denyOutreach = async (outreachId: string, personId: string, message: string) => {
    try {
      const response = await fetch('/api/relationships/outreach/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personId,
          message: message,
          reason: 'User declined to send'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove from outreach list
        setOutreaches(outreaches.filter(o => o.id !== outreachId));
        alert(`❌ Outreach denied. ${data.person_name} won't appear in suggestions for 7 days.`);
      } else {
        alert('Error denying outreach: ' + data.error);
      }
    } catch (error) {
      console.error('Error denying outreach:', error);
      alert('Error denying outreach');
    }
  };

  const delayOutreach = async (outreachId: string, personId: string, message: string, delayReason: string, originalTrigger: any) => {
    try {
      setDelayDropdownOpen(null);
      
      const response = await fetch('/api/relationships/outreach/delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personId,
          message: message,
          delay_reason: delayReason,
          original_trigger: originalTrigger
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove from outreach list
        setOutreaches(outreaches.filter(o => o.id !== outreachId));
        
        const scheduleTime = new Date(data.scheduled_time);
        alert(`⏰ Message delayed! It will remind you at ${scheduleTime.toLocaleString()}`);
      } else {
        alert('Error delaying outreach: ' + data.error);
      }
    } catch (error) {
      console.error('Error delaying outreach:', error);
      alert('Error delaying outreach');
    }
  };

  const toggleDelayDropdown = (outreachId: string) => {
    setDelayDropdownOpen(delayDropdownOpen === outreachId ? null : outreachId);
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/relationships/outreach/queue');
      const data = await response.json();
      
      if (response.ok) {
        setQueueItems(data.queue || []);
      } else {
        console.error('Error fetching queue:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDailyOutreachOpen = () => {
    setShowDailyOutreach(true);
    fetchOutreaches();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-4xl font-brier font-bold text-glow-gold mb-2">
              Relationships
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Manage your personal and professional relationships
            </p>
          </div>
          
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-3">
            <button
              onClick={() => { setShowQueueModal(true); fetchQueue(); }}
              className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-wizard-emerald to-wizard-gold text-white font-semibold rounded-lg hover:scale-105 transition-transform cosmic-glow text-base min-h-[44px]"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Outreach Queue
            </button>
            
            <button
              onClick={handleDailyOutreachOpen}
              className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-wizard-gold to-wizard-emerald text-white font-semibold rounded-lg hover:scale-105 transition-transform cosmic-glow text-base min-h-[44px]"
            >
              <Mail className="w-5 h-5 mr-2" />
              Daily Outreach
            </button>
            
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-3 bg-gradient-wizard text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform cosmic-glow text-base min-h-[44px]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Person
            </button>
          </div>
        </div>

        {/* Visual Stats */}
        <RelationshipStats people={people} />
        
        {/* Needs Attention Alert */}
        <NeedsAttention people={people} />

        {/* Circles and Role Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FerrazziCircles people={people} />
          <RoleBreakdown people={people} />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📊 Analytics & Insights
          </h2>
          
          {/* Income & Strength */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <IncomeProjectionChart people={people} />
            <RelationshipStrengthRadar people={people} />
          </div>
          
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CircleDistributionChart people={people} />
            <RoleDistributionChart people={people} />
          </div>
          
          {/* Activity & Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <InteractionTimeline people={people} />
            <TopTagsChart people={people} />
            <ConversationTopicsChart people={people} />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 lg:p-6 mb-8 agent-shimmer-frame">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-base min-h-[44px]"
              />
            </div>

            {/* Relationship Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-base min-h-[44px]"
            >
              <option value="all">All Types</option>
              <option value="client">Client</option>
              <option value="prospect">Prospect</option>
              <option value="partner">Partner</option>
              <option value="colleague">Colleague</option>
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="contact">Contact</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-base min-h-[44px]"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Follow-ups Toggle */}
            <label className="flex items-center space-x-3 cursor-pointer py-3 min-h-[44px]">
              <input
                type="checkbox"
                checked={showFollowUps}
                onChange={(e) => setShowFollowUps(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-base font-medium">Needs follow-up only</span>
            </label>
          </div>
        </div>

        {/* People List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {people.length === 0 ? (
              <div className="bg-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No relationships found.</p>
              </div>
            ) : (
              people.map((person, index) => {
                const followUpStatus = getFollowUpStatus(person.next_follow_up);
                
                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="bg-card rounded-lg p-6 hover:scale-[1.01] transition-transform agent-shimmer-frame cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side: Person info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {/* Numbered list */}
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {person.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span className="px-2 py-1 bg-secondary/20 rounded-full">
                                {person.relationship_type}
                              </span>
                              {getPriorityIcon(person.priority)}
                              <span className="capitalize">{person.priority}</span>
                              {getStatusIcon(person.status)}
                            </div>
                          </div>
                        </div>

                        {/* Contact info grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {person.company && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span>{person.company}</span>
                              {person.title && <span className="text-muted-foreground">• {person.title}</span>}
                            </div>
                          )}
                          
                          {person.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{person.email}</span>
                            </div>
                          )}
                          
                          {person.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{person.phone}</span>
                            </div>
                          )}
                          
                          {person.timezone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{person.timezone}</span>
                            </div>
                          )}
                        </div>

                        {/* Contact status */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last contacted:</span>
                            <span className="ml-2 font-medium">
                              {formatRelativeTime(person.last_contacted)}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Next follow-up:</span>
                            <span className={`ml-2 font-medium ${followUpStatus.color}`}>
                              {followUpStatus.text}
                            </span>
                          </div>
                        </div>

                        {/* Notes preview */}
                        {person.notes && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                            {person.notes}
                          </p>
                        )}

                        {/* Tags */}
                        {person.tags && person.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {person.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side: Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(person)}
                          className="px-3 py-1 bg-secondary/20 text-secondary rounded hover:bg-secondary/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="px-3 py-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal for Add/Edit Person */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto agent-shimmer-frame">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingPerson ? 'Edit Person' : 'Add New Person'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Timezone will be inferred from area code
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Relationship Type</label>
                      <select
                        value={formData.relationshipType}
                        onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="contact">Contact</option>
                        <option value="client">Client</option>
                        <option value="prospect">Prospect</option>
                        <option value="partner">Partner</option>
                        <option value="colleague">Colleague</option>
                        <option value="friend">Friend</option>
                        <option value="family">Family</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Next Follow-up</label>
                      <input
                        type="date"
                        value={formData.nextFollowUp}
                        onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Frequency (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.contactFrequency || ''}
                        onChange={(e) => setFormData({ ...formData, contactFrequency: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        placeholder="e.g., 30 for monthly"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Any additional notes about this person..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-wizard text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform"
                    >
                      {editingPerson ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Person Detail Panel */}
        {selectedPerson && (
          <PersonDetailPanel
            person={selectedPerson}
            isOpen={!!selectedPerson}
            onClose={() => setSelectedPerson(null)}
            onUpdate={(updated) => {
              setPeople(people.map(p => p.id === updated.id ? { ...p, ...updated } : p));
              setSelectedPerson({ ...selectedPerson, ...updated });
            }}
            onDelete={(id) => {
              setPeople(people.filter(p => p.id !== id));
              setSelectedPerson(null);
            }}
          />
        )}

        {/* Daily Outreach Modal */}
        {showDailyOutreach && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto agent-shimmer-frame">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Daily Outreach Suggestions</h2>
                  <button
                    onClick={() => setShowDailyOutreach(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {loadingOutreaches ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : outreaches.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">
                      No urgent outreach needed today. Your relationships are in great shape! 🎉
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Top {outreaches.length} people who need your attention today:
                    </div>
                    
                    {outreaches.map((outreach, index) => (
                      <div
                        key={outreach.id}
                        className={`bg-background rounded-lg border p-6 ${getPriorityColor(outreach.priority)}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{outreach.person_name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span className="capitalize px-2 py-1 bg-secondary/20 rounded-full">
                                  {outreach.role}
                                </span>
                                <span className="capitalize px-2 py-1 bg-secondary/20 rounded-full">
                                  {outreach.circle} circle
                                </span>
                                <span className={`capitalize px-2 py-1 rounded-full font-medium ${getPriorityColor(outreach.priority)}`}>
                                  {outreach.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="text-right text-sm text-muted-foreground">
                            {outreach.contact_info.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{outreach.contact_info.phone}</span>
                              </div>
                            )}
                            {outreach.last_contact?.days_ago && (
                              <div>Last contact: {outreach.last_contact.days_ago} days ago</div>
                            )}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Why now?</div>
                          <div className="text-sm">{outreach.reason}</div>
                        </div>

                        {/* Message Draft */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Suggested message:</div>
                          <div className="bg-muted/20 p-4 rounded-lg border-l-4 border-primary">
                            <div className="text-sm whitespace-pre-wrap">{outreach.message_draft}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => denyOutreach(outreach.id, outreach.person_id, outreach.message_draft)}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Deny</span>
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={() => toggleDelayDropdown(outreach.id)}
                              className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center space-x-1"
                            >
                              <Clock className="w-4 h-4" />
                              <span>Delay</span>
                            </button>
                            
                            {delayDropdownOpen === outreach.id && (
                              <div className="absolute right-0 bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                                <button
                                  onClick={() => delayOutreach(outreach.id, outreach.person_id, outreach.message_draft, '1h', outreach)}
                                  className="w-full text-left px-3 py-2 hover:bg-secondary/20 text-sm"
                                >
                                  1 hour
                                </button>
                                <button
                                  onClick={() => delayOutreach(outreach.id, outreach.person_id, outreach.message_draft, '4h', outreach)}
                                  className="w-full text-left px-3 py-2 hover:bg-secondary/20 text-sm"
                                >
                                  4 hours
                                </button>
                                <button
                                  onClick={() => delayOutreach(outreach.id, outreach.person_id, outreach.message_draft, 'tomorrow', outreach)}
                                  className="w-full text-left px-3 py-2 hover:bg-secondary/20 text-sm"
                                >
                                  Tomorrow
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {outreach.contact_info.phone ? (
                            <button
                              onClick={() => approveOutreach(outreach.id, outreach.person_id, outreach.message_draft, outreach)}
                              disabled={processingOutreach === outreach.id}
                              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {processingOutreach === outreach.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="text-xs text-muted-foreground py-2">
                              No phone number available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outreach Queue Modal */}
        {showQueueModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto agent-shimmer-frame">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Outreach Queue</h2>
                  <button
                    onClick={() => setShowQueueModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {queueItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages queued</h3>
                    <p className="text-muted-foreground">
                      Approve some outreach suggestions to see them here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      {queueItems.length} messages pending • {queueItems.filter(item => {
                        const scheduleDate = new Date(item.scheduled_time);
                        const today = new Date();
                        return scheduleDate.toDateString() === today.toDateString();
                      }).length} due today
                    </div>
                    
                    {queueItems.map((item) => {
                      const scheduleDate = new Date(item.scheduled_time);
                      const isOverdue = scheduleDate < new Date();
                      const isToday = scheduleDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div
                          key={item.id}
                          className={`bg-background rounded-lg border p-6 ${
                            isOverdue ? 'border-red-500/50 bg-red-500/5' :
                            isToday ? 'border-yellow-500/50 bg-yellow-500/5' :
                            'border-border'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{item.person_name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span className="capitalize px-2 py-1 bg-secondary/20 rounded-full">
                                  {item.person_details.relationship_type}
                                </span>
                                <span className="capitalize px-2 py-1 bg-secondary/20 rounded-full">
                                  {item.person_details.priority} priority
                                </span>
                                {item.delay_reason && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full">
                                    Delayed: {item.delay_reason}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right text-sm">
                              <div className={`font-medium ${
                                isOverdue ? 'text-red-500' :
                                isToday ? 'text-yellow-500' :
                                'text-muted-foreground'
                              }`}>
                                {isOverdue ? 'Overdue!' :
                                 isToday ? 'Due today' :
                                 `Due ${scheduleDate.toLocaleDateString()}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {scheduleDate.toLocaleString()}
                              </div>
                              {item.contact_info.phone && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.contact_info.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message */}
                          <div className="mb-4">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Queued message:</div>
                            <div className="bg-muted/20 p-4 rounded-lg border-l-4 border-primary">
                              <div className="text-sm whitespace-pre-wrap">{item.message}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/relationships/outreach/queue', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      queue_id: item.id,
                                      action: 'cancel'
                                    })
                                  });
                                  if (response.ok) {
                                    setQueueItems(queueItems.filter(q => q.id !== item.id));
                                    alert('Message cancelled');
                                  }
                                } catch (error) {
                                  alert('Error cancelling message');
                                }
                              }}
                              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                            
                            <button
                              onClick={() => {
                                const newMessage = prompt('Edit message:', item.message);
                                if (newMessage && newMessage !== item.message) {
                                  // Update message logic here
                                  alert('Message editing coming soon!');
                                }
                              }}
                              className="px-4 py-2 bg-wizard-emerald/20 text-wizard-emerald rounded-lg hover:bg-wizard-emerald/30 transition-colors"
                            >
                              Edit
                            </button>
                            
                            {item.contact_info.phone && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Send message to ${item.person_name} right now?`)) {
                                    try {
                                      const response = await fetch('/api/relationships/outreach/queue', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          queue_id: item.id,
                                          action: 'send_now'
                                        })
                                      });
                                      const data = await response.json();
                                      if (response.ok) {
                                        setQueueItems(queueItems.filter(q => q.id !== item.id));
                                        alert('Message sent successfully!');
                                      } else {
                                        alert('Error sending message: ' + data.error);
                                      }
                                    } catch (error) {
                                      alert('Error sending message');
                                    }
                                  }
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
                              >
                                Send Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default RelationshipsPage;