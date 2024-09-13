
/* import { getStudents } from '../db/indexeddb'; */
// import { renderStudentList } from './ui';

class MarkType {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}

class Mark {
  constructor(id, name, type, value, description) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.value = value;
    this.description = description;
  }
}

class MarkAssignment {
  constructor(mark, datetime) {
    this.mark = mark;
    this.datetime = datetime;
  }
}

class Student {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Group {
  constructor(id, name, students) {
    this.id = id;
    this.name = name;
    this.students_marks = [];
    students.forEach(student => {
     this.students_marks.push({ student: student, marks_assigned: [] });
    });
  }
}

var mark_types = [
  new MarkType(1, 'relative', 'Used for counting grade in statistical manner'),
  new MarkType(2, 'absolute', 'Used for change the grade for an absolute value')
];
var marks = [
  new Mark(1, '+', mark_types[0], 1, 'Client web'),
  new Mark(2, '-', mark_types[0], -1, 'Do nothing'),
  new Mark(3, 'P', mark_types[1], 1, 'Essey'),
  new Mark(4, 'M', mark_types[1], -1, 'Phone during class')
];
var students = [
  new Student(1, 'Alice'),
  new Student(2, 'Bob'),
  new Student(3, 'Charlie'),
  new Student(4, 'David'),
  new Student(5, 'Eve')
];
var groups = [
  new Group(1, 'Group 1', [students[0], students[1]]),
  new Group(2, 'Group 2', [students[2], students[3]]),
  new Group(3, 'Group 3', [students[3], students[4]])
];

var selectedGroup = null;

// Function to add options to the select element
function addOptionToSelect(selectElement, text, value) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;
  selectElement.add(option);
}

function addObjectListToSelect(selectElement, objectList, textKey, valueKey){
  objectList.forEach(object => {
    addOptionToSelect(selectElement, object[textKey], object[valueKey]);
  });
}

function writeObjectListToSelect(selectElement, objectList, textKey, valueKey){
  selectElement.innerHTML = '';
  addObjectListToSelect(selectElement, objectList, textKey, valueKey);
}

function renderAdminDiv(){
  const adminDiv = document.createElement('div');
  adminDiv.setAttribute('id', 'administration_div');
  adminDiv.innerHTML = '<h2>Administration</h2>';

  const adminMarkDiv = renderAdminMarkMainDiv();
  const adminGroupDiv = renderAdminGroupMainDiv();
  const adminStudentDiv = renderAdminStudentMainDiv();

  adminMarkDiv.style.display = 'none';
  adminGroupDiv.style.display = 'block';
  adminStudentDiv.style.display = 'none';

  adminDiv.appendChild(adminMarkDiv);
  adminDiv.appendChild(adminGroupDiv);
  adminDiv.appendChild(adminStudentDiv);

  return adminDiv;
}

function renderUsageDiv(){
  const usageDiv = document.createElement('div');
  usageDiv.setAttribute('id', 'usage_div');
  usageDiv.innerHTML = '<h2>In class</h2>';

  const selectedGroupDiv = document.createElement('div');
  selectedGroupDiv.setAttribute('id', 'selected_group_div');
  
  const groupSelectionDiv = renderUsageGroupSelectionDiv(selectedGroupDiv);

  usageDiv.appendChild(groupSelectionDiv);
  usageDiv.appendChild(selectedGroupDiv);

  if (groups.length === 1) {
    fillUsageSelectedGroupDiv(selectedGroupDiv, groups[0]);
  }

  return usageDiv;
}

function renderResultDiv(){
  const resultDiv = document.createElement('div');
  resultDiv.setAttribute('id', 'result_div');
  resultDiv.innerHTML = '<h2>Results</h2>';

  return resultDiv;
}


function renderAdminMarkMainDiv(){
  const adminMarkDiv = document.createElement('div');
  adminMarkDiv.setAttribute('id', 'admin_mark_main_div');
  adminMarkDiv.innerHTML = '<h3>Mark administration</h3>';

  // const addMarkButton = document.createElement('button');
  // addMarkButton.textContent = 'Add mark';
  // addMarkButton.setAttribute('id', 'add_mark_button');
  // addMarkButton.addEventListener('click', addNewMark);
  // adminMarkDiv.appendChild(addMarkButton);

  adminMarkDiv.appendChild(renderAdminMarkListDiv(marks));

  return adminMarkDiv;
}

function renderAdminMarkListDiv(marks){
  const adminMarkListDiv = document.createElement('div');
  adminMarkListDiv.setAttribute('id', 'admin_mark_list_div');
  adminMarkListDiv.innerHTML = '<h3>Marks</h3>';

  marks.forEach(mark => {
    adminMarkListDiv.appendChild(renderAdminMarkDiv(mark));
  });

  return adminMarkListDiv;
}

function renderAdminMarkDiv(mark){
  const markDiv = document.createElement('div');
  markDiv.setAttribute('id', 'admin_mark_div');
  markDiv.innerHTML = `
    <span>${mark.name}</span><span>${mark.description}</span><span>${mark.type.name}</span><span>${mark.value}</span>`;
  return markDiv;
}

function renderAdminGroupMainDiv(){
  const adminGroupDiv = document.createElement('div');
  adminGroupDiv.setAttribute('id', 'admin_group_main_div');
  adminGroupDiv.innerHTML = '<h3>Group administration</h3>';

  // const addGroupButton = document.createElement('button');
  // addGroupButton.textContent = 'Add group';
  // addGroupButton.setAttribute('id', 'add_group_button');
  // addGroupButton.addEventListener('click', addNewGroup);
  // adminGroupDiv.appendChild(addGroupButton);

  adminGroupDiv.appendChild(renderAdminGroupListDiv(groups));

  return adminGroupDiv;
}

function renderAdminGroupListDiv(groups){
  const adminGroupListDiv = document.createElement('div');
  adminGroupListDiv.setAttribute('id', 'admin_group_list_div');
  adminGroupListDiv.innerHTML = '<h3>Groups</h3>';

  groups.forEach(group => {
    adminGroupListDiv.appendChild(renderAdminGroupDiv(group));
  });

  return adminGroupListDiv;
}

function renderAdminGroupDiv(group){
  const groupDiv = document.createElement('div');
  groupDiv.setAttribute('id', 'admin_group_div');
  groupDiv.innerHTML = `
    <span>${group.name}</span>`;
  
  return groupDiv;
}

function renderAdminStudentMainDiv(){
  const adminStudentDiv = document.createElement('div');
  adminStudentDiv.setAttribute('id', 'admin_student_main_div');
  adminStudentDiv.innerHTML = '<h3>Student administration</h3>';

  // const addStudentButton = document.createElement('button');
  // addStudentButton.textContent = 'Add student';
  // addStudentButton.setAttribute('id', 'add_student_button');
  // addStudentButton.addEventListener('click', addNewStudent);
  // adminStudentDiv.appendChild(addStudentButton);

  adminStudentDiv.appendChild(renderAdminStudentListDiv(students));

  return adminStudentDiv;
}

function renderAdminStudentListDiv(students){
  const adminStudentListDiv = document.createElement('div');
  adminStudentListDiv.setAttribute('id', 'admin_student_list_div');
  adminStudentListDiv.innerHTML = '<h3>Students</h3>';

  students.forEach(student => {
    adminStudentListDiv.appendChild(renderAdminStudentDiv(student));
  });

  return adminStudentListDiv;
}

function renderAdminStudentDiv(student){
  const studentDiv = document.createElement('div');
  studentDiv.setAttribute('id', 'admin_student_div');
  studentDiv.innerHTML = `
    <span>${student.name}</span>
  `;

  return studentDiv;
}
  

function renderUsageGroupSelectionDiv(selectedGroupDiv){
  const groupSelectionDiv = document.createElement('div');
  groupSelectionDiv.setAttribute('id', 'group_selection_div');
  groupSelectionDiv.innerHTML = '<h3>Group selection</h3>';
  
  const selectGroupDiv = document.createElement('div');
  selectGroupDiv.setAttribute('id', 'select_group_div');
  groupSelectionDiv.appendChild(selectGroupDiv);

  const selectGroupForm = document.createElement('form');
  selectGroupForm.setAttribute('id', 'select_group_form');
  selectGroupDiv.appendChild(selectGroupForm);

  const selectGroupLabel = document.createElement('label');
  selectGroupLabel.setAttribute('for', 'group');
  selectGroupLabel.textContent = 'Select a group:';
  selectGroupForm.appendChild(selectGroupLabel);

  const selectGroupSelect = document.createElement('select');
  selectGroupSelect.setAttribute('name', 'group');
  selectGroupSelect.setAttribute('id', 'group_select');

  addObjectListToSelect(selectGroupSelect, groups, 'name', 'id');
  selectGroupSelect.selectedIndex = -1;
  selectGroupForm.appendChild(selectGroupSelect);

  selectGroupSelect.addEventListener('change', function() {
    const selectedGroupId = selectGroupSelect.value;
    fillUsageSelectedGroupDiv(selectedGroupDiv, groups.find(group => group.id == selectedGroupId));
  });


  // const addGroupDiv = document.createElement('div');
  // addGroupDiv.setAttribute('id', 'add_group_div');
  // groupSelectionDiv.appendChild(addGroupDiv);

  // const newGroupButton = document.createElement('button');
  // newGroupButton.textContent = 'New group';
  // newGroupButton.setAttribute('id', 'add_group_button');
  // newGroupButton.addEventListener('click', addNewGroup);
  // addGroupDiv.appendChild(newGroupButton);
  

  // const addGroupForm = document.createElement('form');
  // addGroupForm.setAttribute('id', 'add_group_form');
  // addGroupForm.innerHTML = `
  //   <input type="text" name="group_name" id="group_name" placeholder="Enter group name">
  // `;
  // addGroupForm.style.display = 'none';
  // addGroupDiv.appendChild(addGroupForm);

  // const saveGroupButton = document.createElement('button');
  // saveGroupButton.textContent = 'Save';
  // saveGroupButton.setAttribute('id', 'save_group_button');
  // saveGroupButton.addEventListener('click', saveNewGroup);
  // addGroupForm.appendChild(saveGroupButton);

  // const cancelGroupButton = document.createElement('button');
  // cancelGroupButton.textContent = 'Cancel';
  // cancelGroupButton.setAttribute('id', 'cancel_group_button');
  // cancelGroupButton.addEventListener('click', cancelNewGroup);
  // addGroupForm.appendChild(cancelGroupButton);

  return groupSelectionDiv;
}

function fillUsageSelectedGroupDiv(selectedGroupDiv, group) {
  if(!group) {
    selectedGroupDiv.innerHTML = '<h3>No group selected</h3>';
    return selectedGroupDiv;
  }

  selectedGroupDiv.innerHTML = `<h3>Group ${group.name}</h3>`;
  const groupStudentsListDiv = renderUsageStudentsListDiv(group.students_marks);
  selectedGroupDiv.appendChild(groupStudentsListDiv);  

  return selectedGroupDiv;
}

function renderUsageStudentsListDiv(students_marks){
  const studentsListDiv = document.createElement('div');
  studentsListDiv.setAttribute('id', 'students_list_div');

  students_marks.forEach(student_marks => {
    studentsListDiv.appendChild(renderStudentDiv(student_marks));
  });

  return studentsListDiv;
}

function renderStudentDiv(student_marks){
  const studentDiv = document.createElement('div');
  studentDiv.classList.add('student_div');

  const negativeMarkButton = document.createElement('button');
  negativeMarkButton.textContent = '-';
  negativeMarkButton.addEventListener('click', () => {
    console.log(`Negative mark for student ${student_marks.student.name}`);
  });
  studentDiv.appendChild(negativeMarkButton);

  const studentNameSpan = document.createElement('span');
  studentNameSpan.textContent = student_marks.student.name;
  studentDiv.appendChild(studentNameSpan);

  const positiveMarkButton = document.createElement('button');
  positiveMarkButton.textContent = '+';
  positiveMarkButton.addEventListener('click', () => {
    console.log(`Positive mark for student ${student_marks.student.name}`);
  });
  studentDiv.appendChild(positiveMarkButton);

  return studentDiv;
}





function toggleAddGroupForm(){
  const addGroupForm = document.getElementById('add_group_form');
  addGroupForm.style.display = addGroupForm.style.display === 'none' ? 'block' : 'none';
  const addGroupButton = document.getElementById('add_group_button');
  addGroupButton.style.display = addGroupButton.style.display === 'none' ? 'block' : 'none';
}

function addNewGroup(event){
  event.preventDefault();
  toggleAddGroupForm();
}

function saveNewGroup(event){
  event.preventDefault();
  const groupName = document.getElementById('group_name').value;
  groups.push({id: groups.length + 1, name: groupName, students_marks: []});
  console.log(groupName);
  toggleAddGroupForm();
}

function cancelNewGroup(event){
  event.preventDefault();
  toggleAddGroupForm();
}

function clearMain(){
  const main = document.getElementById('main');
  main.innerHTML = '';
  return main;
}

document.getElementById('administration_btn').addEventListener('click', () => {
  const main = clearMain();
  main.appendChild(renderAdminDiv());
});

document.getElementById('usage_btn').addEventListener('click', () => {
  const main = clearMain(); 
  main.appendChild(renderUsageDiv());
}); 

document.getElementById('result_btn').addEventListener('click', () => {
  const main = clearMain();
  main.appendChild(renderResultDiv());
});

document.addEventListener('DOMContentLoaded', async () => {

  const main = document.getElementById('main');

  main.appendChild(renderUsageDiv());


  /* If there is only one group, show it */
  if (groups.length == 0) {
    selectedGroup = groups[0];
    document.body.appendChild(renderGroupDiv());
  }

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
