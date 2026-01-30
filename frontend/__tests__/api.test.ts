/**
 * API Integration Tests for Dashboard Daddy
 * Tests the Next.js API routes against Supabase
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

// Test configuration
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Dashboard Daddy API Tests', () => {
  describe('/api/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/stats`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('activeTasks');
      expect(data).toHaveProperty('completedTasks');
      expect(data).toHaveProperty('radarItems');
      expect(data).toHaveProperty('receivables');
    });
  });

  describe('/api/tasks', () => {
    it('should list tasks', async () => {
      const response = await fetch(`${BASE_URL}/api/tasks`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.tasks) || Array.isArray(data)).toBe(true);
    });

    it('should create a task', async () => {
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task from Bubba',
          priority: 'medium',
          status: 'pending',
          description: 'Automated test task created during nightly autonomous work'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.title).toBe('Test Task from Bubba');
    });

    it('should filter tasks by status', async () => {
      const response = await fetch(`${BASE_URL}/api/tasks?status=pending`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      tasks.forEach((task: any) => {
        expect(task.status).toBe('pending');
      });
    });
  });

  describe('/api/activity', () => {
    it('should return activity feed', async () => {
      const response = await fetch(`${BASE_URL}/api/activity`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/activity?limit=5`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('/api/people', () => {
    it('should list contacts', async () => {
      const response = await fetch(`${BASE_URL}/api/people`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.contacts) || Array.isArray(data)).toBe(true);
    });

    it('should create a contact', async () => {
      const response = await fetch(`${BASE_URL}/api/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Contact',
          email: 'test@example.com',
          relationship_type: 'test'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Test Contact');
    });
  });

  describe('/api/calendar', () => {
    it('should return calendar events', async () => {
      const response = await fetch(`${BASE_URL}/api/calendar`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.events) || Array.isArray(data)).toBe(true);
    });
  });
});
