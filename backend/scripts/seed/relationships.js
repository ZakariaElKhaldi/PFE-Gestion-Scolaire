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
  const { 
    studentId1, studentId2, studentId3, studentId4, studentId5, 
    parentId1, parentId2, parentId3, parentId4 
  } = userData;
  
  try {
    // Clear any existing relationships for these users to prevent duplicates
    await connection.query(`
      DELETE FROM parent_child 
      WHERE parentId IN (?, ?, ?, ?) OR studentId IN (?, ?, ?, ?, ?)
    `, [
      parentId1, parentId2, parentId3, parentId4,
      studentId1, studentId2, studentId3, studentId4, studentId5
    ]);
    
    // Create parent-child relationships in parent_child table
    
    // Robert Johnson is parent of Student Johnson
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId1,
      studentId1,
      'father',
      true,
      true
    ]);
    console.log('Parent-child relationship 1 established in parent_child table');
    
    // Jane Williams is parent of Mike Williams
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId2,
      studentId2,
      'mother',
      true,
      true
    ]);
    console.log('Parent-child relationship 2 established in parent_child table');
    
    // Robert Davis is parent of Emma Davis
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId3,
      studentId3,
      'father',
      true,
      true
    ]);
    console.log('Parent-child relationship 3 established in parent_child table');
    
    // Maria Martinez is parent of Alex Martinez
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId4,
      studentId4,
      'mother',
      true,
      true
    ]);
    console.log('Parent-child relationship 4 established in parent_child table');
    
    // Robert Johnson is also guardian for Sophia Brown (demonstrating multiple relationships)
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId1,
      studentId5,
      'guardian',
      true,
      false
    ]);
    console.log('Guardian relationship established for Student 5');
    
    // Jane Williams is also emergency contact for Emma Davis (demonstrating cross-family connections)
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId2,
      studentId3,
      'emergency_contact',
      true,
      true
    ]);
    console.log('Emergency contact relationship established');
    
    // Try to clean up existing entries in parent_relationships table
    try {
      await connection.query(`
        DELETE FROM parent_relationships 
        WHERE parent_id IN (?, ?, ?, ?) OR student_id IN (?, ?, ?, ?, ?)
      `, [
        parentId1, parentId2, parentId3, parentId4,
        studentId1, studentId2, studentId3, studentId4, studentId5
      ]);
    } catch (error) {
      console.warn('Warning: Could not clean parent_relationships table. Error:', error.message);
    }
    
    // Create entries in parent_relationships table
    try {
      // Robert Johnson -> Student Johnson
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
      
      // Jane Williams -> Mike Williams
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
      
      // Robert Davis -> Emma Davis
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
        parentId3,
        studentId3,
        'parent',
        'Father',
        'verified',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Parent relationship 3 created in parent_relationships table');
      
      // Maria Martinez -> Alex Martinez
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
        parentId4,
        studentId4,
        'parent',
        'Mother',
        'verified',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Parent relationship 4 created in parent_relationships table');
      
      // Robert Johnson -> Sophia Brown (Guardian)
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
        studentId5,
        'guardian',
        'Legal Guardian',
        'verified',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Guardian relationship created in parent_relationships table');
      
      // Jane Williams -> Emma Davis (Emergency Contact - pending verification)
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
        studentId3,
        'other',
        'Emergency Contact',
        'pending',
        uuidv4(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]);
      console.log('Emergency contact relationship created in parent_relationships table');
      
    } catch (error) {
      console.warn('Warning: Could not create entries in parent_relationships table. This table might be optional:', error.message);
    }
    
    return {
      relationships: [
        { parentId: parentId1, studentId: studentId1, type: 'father' },
        { parentId: parentId2, studentId: studentId2, type: 'mother' },
        { parentId: parentId3, studentId: studentId3, type: 'father' },
        { parentId: parentId4, studentId: studentId4, type: 'mother' },
        { parentId: parentId1, studentId: studentId5, type: 'guardian' },
        { parentId: parentId2, studentId: studentId3, type: 'emergency_contact' }
      ]
    };
  } catch (error) {
    console.error('Error creating relationships:', error);
    throw error;
  }
}

module.exports = seedRelationships; 