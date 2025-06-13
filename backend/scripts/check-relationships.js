const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });

    console.log('Checking parent-child relationships...');

    // Query parent-child relationships
    const [parentChildRows] = await connection.query(`
      SELECT 
        pc.relationship, 
        pc.isEmergencyContact, 
        pc.canPickup, 
        p.firstName AS parentFirstName, 
        p.lastName AS parentLastName, 
        s.firstName AS studentFirstName, 
        s.lastName AS studentLastName
      FROM 
        parent_child pc
      JOIN 
        users p ON pc.parentId = p.id
      JOIN 
        users s ON pc.studentId = s.id
    `);

    console.log('\nParent-Child Relationships:', parentChildRows.length);
    
    // Display parent-child relationships
    parentChildRows.forEach((relation, index) => {
      console.log(`\nRelationship ${index + 1}:`);
      console.log(`- Parent: ${relation.parentFirstName} ${relation.parentLastName}`);
      console.log(`- Student: ${relation.studentFirstName} ${relation.studentLastName}`);
      console.log(`- Relationship Type: ${relation.relationship}`);
      console.log(`- Emergency Contact: ${relation.isEmergencyContact ? 'Yes' : 'No'}`);
      console.log(`- Can Pickup: ${relation.canPickup ? 'Yes' : 'No'}`);
    });

    // Query parent_relationships table if it exists
    try {
      const [parentRelationshipsRows] = await connection.query(`
        SELECT 
          pr.relationship_type, 
          pr.description, 
          pr.status, 
          p.firstName AS parentFirstName, 
          p.lastName AS parentLastName, 
          s.firstName AS studentFirstName, 
          s.lastName AS studentLastName
        FROM 
          parent_relationships pr
        JOIN 
          users p ON pr.parent_id = p.id
        JOIN 
          users s ON pr.student_id = s.id
      `);

      console.log('\nParent Relationships Table:', parentRelationshipsRows.length);
      
      // Display parent relationships
      parentRelationshipsRows.forEach((relation, index) => {
        console.log(`\nRelationship ${index + 1}:`);
        console.log(`- Parent: ${relation.parentFirstName} ${relation.parentLastName}`);
        console.log(`- Student: ${relation.studentFirstName} ${relation.studentLastName}`);
        console.log(`- Relationship Type: ${relation.relationship_type}`);
        console.log(`- Description: ${relation.description}`);
        console.log(`- Status: ${relation.status}`);
      });
    } catch (error) {
      console.log('\nNote: parent_relationships table could not be queried:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
run(); 