const dbName = 'BadMarksIDB';
const dbVersion = 1;
let db;

// Open or create the database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
      db = event.target.result;

      if (!db.objectStoreNames.contains('students')) {
        const studentStore = db.createObjectStore('students', { keyPath: 'id' });
        studentStore.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = function(event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function(event) {
      reject(`Database error: ${event.target.errorCode}`);
    };
  });
}

// Add a new student
function addStudent(student) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    const request = store.add(student);

    request.onsuccess = function() {
      resolve();
    };

    request.onerror = function(event) {
      reject(`Add student error: ${event.target.errorCode}`);
    };
  });
}

// Get all students
function getStudents() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['students'], 'readonly');
    const store = transaction.objectStore('students');
    const request = store.getAll();

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject(`Get students error: ${event.target.errorCode}`);
    };
  });
}

// Get a single student by ID
function getStudentById(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['students'], 'readonly');
    const store = transaction.objectStore('students');
    const request = store.get(id);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject(`Get student by ID error: ${event.target.errorCode}`);
    };
  });
}

// Update a student (e.g., to add a new mark)
function updateStudent(student) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    const request = store.put(student);

    request.onsuccess = function() {
      resolve();
    };

    request.onerror = function(event) {
      reject(`Update student error: ${event.target.errorCode}`);
    };
  });
}

// Delete a student by ID
function deleteStudent(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    const request = store.delete(id);

    request.onsuccess = function() {
      resolve();
    };

    request.onerror = function(event) {
      reject(`Delete student error: ${event.target.errorCode}`);
    };
  });
}

// Example usage: initialize the database when the script is loaded
openDatabase()
  .then(() => console.log('Database opened successfully'))
  .catch(err => console.error(err));

// Export the functions to use them in other parts of your app
export { openDatabase, addStudent, getStudents, getStudentById, updateStudent, deleteStudent };
