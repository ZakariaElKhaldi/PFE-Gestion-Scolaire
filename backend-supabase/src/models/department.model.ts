import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentInput {
  name: string;
  description?: string;
}

class DepartmentModel {
  /**
   * Find department by id
   */
  async findById(id: string): Promise<Department | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error('Error finding department by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Find all departments
   */
  async findAll(): Promise<Department[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        logger.error('Error finding all departments:', error);
        return [];
      }
      
      return data.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        createdAt: new Date(dept.created_at),
        updatedAt: new Date(dept.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findAll:', error);
      return [];
    }
  }

  /**
   * Create a new department
   */
  async create(departmentData: DepartmentInput): Promise<Department | null> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('departments')
        .insert({
          id,
          name: departmentData.name,
          description: departmentData.description || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating department:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in create:', error);
      return null;
    }
  }

  /**
   * Update department
   */
  async update(id: string, departmentData: Partial<DepartmentInput>): Promise<Department | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('departments')
        .update({
          ...departmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating department:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in update:', error);
      return null;
    }
  }

  /**
   * Delete department
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting department:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      return false;
    }
  }
}

export const departmentModel = new DepartmentModel(); 