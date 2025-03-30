/**
 * Seed script for parent-child relationships
 */
const { uuidv4 } = require('./utils');

/**
 * Seed parent-child relationships
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 */
async function seedRelationships(connection, userData) {
  console.log('Creating parent-child relationships...');
  
  // Extract user IDs
  const { studentId1, studentId2, studentId3, parentId1, parentId2 } = userData;
  
  try {
    // Clear any existing relationships for these users to prevent duplicates
    await connection.query(`
      DELETE FROM parent_child 
      WHERE (parentId = ? AND studentId = ?) OR (parentId = ? AND studentId = ?)
    `, [
      parentId1, studentId1,
      parentId2, studentId2
    ]);
    
    // Create parent-child relationships in parent_child table
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId1,
      studentId1,
      'parent',
      true,
      true
    ]);
    console.log('Parent-child relationship 1 established in parent_child table');
    
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId2,
      studentId2,
      'parent',
      true,
      true
    ]);
    console.log('Parent-child relationship 2 established in parent_child table');
    
    // Try to clean up existing entries in parent_relationships table
    try {
      await connection.query(`
        DELETE FROM parent_relationships 
        WHERE (parent_id = ? AND student_id = ?) OR (parent_id = ? AND student_id = ?)
      `, [
        parentId1, studentId1,
        parentId2, studentId2
      ]);
    } catch (error) {
      console.warn('Warning: Could not clean parent_relationships table. Error:', error.message);
    }
    
    // Create entries in parent_relationships table
    try {
      await connection.query(`
        INSERT INTO parent_relationships (
          id, 
          parent_id, 
          student_id, 
          relationship_type, 
          description, 
          status, 
          verification_token, 
          token_expiry
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        parentId1,
        studentId1,
        'parent',
        'Father',
        'verified',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Parent relationship 1 created in parent_relationships table');
      
      await connection.query(`
        INSERT INTO parent_relationships (
          id, 
          parent_id, 
          student_id, 
          relationship_type, 
          description, 
          status, 
          verification_token, 
          token_expiry
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        parentId2,
        studentId2,
        'parent',
        'Mother',
        'verified',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Parent relationship 2 created in parent_relationships table');
    } catch (error) {
      console.warn('Warning: Could not create entries in parent_relationships table. This table might be optional:', error.message);
    }
    
    // Additional relationship: parent1 as guardian for student3
    try {
      await connection.query(`
        INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        parentId1,
        studentId3,
        'guardian',
        true,
        false
      ]);
      console.log('Additional guardian relationship established for Student 3');
    } catch (error) {
      console.warn('Warning: Could not create additional guardian relationship:', error.message);
    }
    
    return {
      relationships: [
        { parentId: parentId1, studentId: studentId1, type: 'parent' },
        { parentId: parentId2, studentId: studentId2, type: 'parent' },
        { parentId: parentId1, studentId: studentId3, type: 'guardian' }
      ]
    };
  } catch (error) {
    console.error('Error creating relationships:', error);
    throw error;
  }
}

module.exports = seedRelationships; 