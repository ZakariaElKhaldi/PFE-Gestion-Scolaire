/**
 * Seed script for departments
 */
const { uuidv4, getUniqueDepartmentCode } = require('./utils');

/**
 * Seed departments
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @returns {object} - Department IDs for use in other seed modules
 */
async function seedDepartments(connection, userData) {
  console.log('Creating departments...');
  
  // Extract user IDs
  const { teacherId1, teacherId2 } = userData;
  
  // Check if departments table has a code column
  let hasCodeColumn = true;
  try {
    // This will throw an error if the column doesn't exist
    await connection.query('SHOW COLUMNS FROM departments LIKE "code"');
  } catch (error) {
    console.warn('Warning: departments table may not have a code column:', error.message);
    hasCodeColumn = false;
  }
  
  // Generate department IDs
  const scienceDeptId = uuidv4();
  const mathDeptId = uuidv4();
  
  try {
    // Clean up existing departments if they exist
    await connection.query('DELETE FROM departments WHERE name LIKE ? OR name LIKE ?', [
      'Science Department',
      'Mathematics Department'
    ]);
    
    let scienceCode = await getUniqueDepartmentCode(connection, 'SCI');
    let mathCode = await getUniqueDepartmentCode(connection, 'MATH');
    
    // Check which query to use based on table structure
    if (hasCodeColumn) {
      // Insert Science Department with code
      await connection.query(`
        INSERT INTO departments (id, name, code, description, headId)
        VALUES (?, ?, ?, ?, ?)
      `, [
        scienceDeptId,
        'Science Department',
        scienceCode,
        'Department responsible for science subjects including physics, chemistry, and biology',
        teacherId2
      ]);
      console.log('Science Department created with teacher 2 as head');
      
      // Insert Mathematics Department with code
      await connection.query(`
        INSERT INTO departments (id, name, code, description, headId)
        VALUES (?, ?, ?, ?, ?)
      `, [
        mathDeptId,
        'Mathematics Department',
        mathCode,
        'Department responsible for mathematics subjects including algebra, geometry, and calculus',
        teacherId1
      ]);
      console.log('Mathematics Department created with teacher 1 as head');
    } else {
      // Insert without code column
      await connection.query(`
        INSERT INTO departments (id, name, description, headId)
        VALUES (?, ?, ?, ?)
      `, [
        scienceDeptId,
        'Science Department',
        'Department responsible for science subjects including physics, chemistry, and biology',
        teacherId2
      ]);
      console.log('Science Department created with teacher 2 as head');
      
      await connection.query(`
        INSERT INTO departments (id, name, description, headId)
        VALUES (?, ?, ?, ?)
      `, [
        mathDeptId,
        'Mathematics Department',
        'Department responsible for mathematics subjects including algebra, geometry, and calculus',
        teacherId1
      ]);
      console.log('Mathematics Department created with teacher 1 as head');
    }
    
    return {
      scienceDeptId,
      mathDeptId,
      departments: [
        {
          id: scienceDeptId,
          name: 'Science Department',
          code: hasCodeColumn ? scienceCode : undefined,
          headId: teacherId2
        },
        {
          id: mathDeptId,
          name: 'Mathematics Department',
          code: hasCodeColumn ? mathCode : undefined,
          headId: teacherId1
        }
      ]
    };
  } catch (error) {
    console.error('Error creating departments:', error);
    throw error;
  }
}

module.exports = seedDepartments; 