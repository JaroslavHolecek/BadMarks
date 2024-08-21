
import { getStudents } from '../db/indexeddb';
import { renderStudentList } from './ui';

document.addEventListener('DOMContentLoaded', async () => {
  const students = await getStudents();
  renderStudentList(students);
});


/* To use with indexedDB */

// // Add a new student
// addStudent({ id: 'student_1', name: 'John Doe', marks: [] })
//   .then(() => console.log('Student added'))
//   .catch(err => console.error(err));

// // Get all students
// getStudents()
//   .then(students => console.log(students))
//   .catch(err => console.error(err));

// // Get a student by ID
// getStudentById('student_1')
//   .then(student => console.log(student))
//   .catch(err => console.error(err));

// // Update a student
// getStudentById('student_1')
//   .then(student => {
//     student.marks.push({ id: 'mark_1', type: 'positive', description: 'Helped a classmate', datetime: new Date().toISOString() });
//     return updateStudent(student);
//   })
//   .then(() => console.log('Student updated'))
//   .catch(err => console.error(err));

// // Delete a student
// deleteStudent('student_1')
//   .then(() => console.log('Student deleted'))
//   .catch(err => console.error(err));
