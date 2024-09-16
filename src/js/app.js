
/* import { getStudents } from '../db/indexeddb'; */
// import { renderStudentList } from './ui';

class MarkType {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static fromObject(obj) {
    return new MarkType(obj.id, obj.name, obj.description);
  }

  static fromJSON(json) {
    return MarkType.fromObject(JSON.parse(json));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description
    };
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

  static fromObject(obj, markTypes) {
    const type = markTypes.find(markType => markType.id == obj.typeId);
    return new Mark(obj.id, obj.name, type, obj.value, obj.description);
  }

  static fromJSON(json, markTypes) {
    return Mark.fromObject(JSON.parse(json), markTypes);
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      typeId: this.type.id,
      value: this.value,
      description: this.description
    };
  }
}

class MarkAssignment {
  constructor(mark, datetime) {
    this.mark = mark;
    this.datetime = datetime;
  }

  static fromObject(obj, marks) {
    const mark = marks.find(mark => mark.id == obj.markId);
    return new MarkAssignment(mark, obj.datetime);
  }

  static fromJSON(json, marks) {
    return MarkAssignment.fromObject(JSON.parse(json), marks);
  }

  toJSON() {
    return {
      markId: this.mark.id,
      datetime: this.datetime
    };
  }
}

class Student {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static fromObject(obj) {
    return new Student(obj.id, obj.name);
  }

  static fromJSON(json) {
    return Student.fromObject(JSON.parse(json));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }

}

class Group {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static fromObject(obj) {
    return new Group(obj.id, obj.name);
  }

  static fromJSON(json) {
    return Group.fromObject(JSON.parse(json));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }

}

class StudentInGroup {
  constructor(student, group, marks_assigned=[], date_enter=Date.now(), date_quit=null) {
    this.student = student;
    this.group = group;
    this.marks_assigned = marks_assigned;
    this.date_enter = date_enter;
    this.date_quit = date_quit;
  }

  static fromObject(obj, students, groups, marks) {
    const student = students.find(student => student.id == obj.studentId);
    const group = groups.find(group => group.id == obj.groupId);
    const marks_assigned = obj.marks_assigned.map(mark_assignment => MarkAssignment.fromObject(mark_assignment, marks));
    return new StudentInGroup(student, group, marks_assigned, obj.date_enter, obj.date_quit ? obj.date_quit : null);
  }

  static fromJSON(json, students, groups, marks) {
    return StudentInGroup.fromObject(JSON.parse(json), students, groups, marks);
  }

  toJSON() {
    return {
      studentId: this.student.id,
      groupId: this.group.id,
      marks_assigned: this.marks_assigned.map(mark_assignment => mark_assignment.toJSON()),
      date_enter: this.date_enter,
      date_quit: this.date_quit ? this.date_quit : null
    };
  }

  addMark(mark) {
    this.marks_assigned.push({ mark: mark, datetime: Date.now() });
  }

  removeMark(mark) {
    const markIndex = this.marks_assigned.findIndex(mark_assigned => mark_assigned.mark === mark);
    removeMarkByIndex(markIndex);
  }

  removeMarkByIndex(markIndex) {
    this.marks_assigned.splice(markIndex, 1);
  }

}

var g_mark_types = [
  new MarkType(1, 'relative', 'Used for counting grade in statistical manner'),
  new MarkType(2, 'absolute', 'Used for change the grade for an absolute value')
];
var g_marks = [
  new Mark(1, '+', g_mark_types[0], 1, 'Client web'),
  new Mark(2, '-', g_mark_types[0], -1, 'Do nothing'),
  new Mark(3, 'P', g_mark_types[1], 1, 'Essey'),
  new Mark(4, 'M', g_mark_types[1], -1, 'Phone during class')
];
var g_students = [
  new Student(1, 'Alice'),
  new Student(2, 'Bob'),
  new Student(3, 'Charlie'),
  new Student(4, 'David'),
  new Student(5, 'Eve')
];
var g_groups = [
  new Group(1, 'Group 1'),
  new Group(2, 'Group 2'),
  new Group(3, 'Group 3')
];
var g_students_groups = [
  new StudentInGroup(g_students[0], g_groups[0], [new MarkAssignment(g_marks[0], Date.now()), new MarkAssignment(g_marks[1], Date.now())]),
  new StudentInGroup(g_students[1], g_groups[0], [new MarkAssignment(g_marks[0], Date.now()), new MarkAssignment(g_marks[1], Date.now())]),
  new StudentInGroup(g_students[2], g_groups[1], [new MarkAssignment(g_marks[2], Date.now())]),
  new StudentInGroup(g_students[3], g_groups[1], [new MarkAssignment(g_marks[3], Date.now())]),
  new StudentInGroup(g_students[4], g_groups[2], [new MarkAssignment(g_marks[2], Date.now()), new MarkAssignment(g_marks[3], Date.now())])
];

var g_selectedGroupId = null;
var g_positive_marks = [];
var g_negative_marks = [];

function updatePositiveAndNegativeMarks(){
  g_positive_marks = g_marks.filter(mark => mark.value >= 0);
  g_negative_marks = g_marks.filter(mark => mark.value < 0);
}

function findMaxIDInObjectList(objectList){
  return objectList.reduce((maxID, object) => Math.max(maxID, object.id), 0);
}

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

function writeObjectListToSelect(selectElement, objectList, textKey, valueKey, addNoneOption={add:false, text:'-- None --', value:''}){
  selectElement.innerHTML = '';
  if(addNoneOption && addNoneOption.add){
    addOptionToSelect(selectElement, addNoneOption.text || '-- None --', addNoneOption.value || '');
  }
  addObjectListToSelect(selectElement, objectList, textKey, valueKey);
}

function showElement(element){
  element.style.display = 'block';
  return element;
}

function hideElement(element){
  element.style.display = 'none';
  return element;
}

function showElementById(elementId){
  return showElement(document.getElementById(elementId));
}

function hideElementById(elementId){
  return hideElement(document.getElementById(elementId));
}

document.getElementById('administration_btn').addEventListener('click', () => {
  updateSection_Admin();
  showElementById('sec_admin');
  hideElementById('sec_usage');
  hideElementById('sec_result');
});

document.getElementById('usage_btn').addEventListener('click', () => {
  updateSection_Usage();
  hideElementById('sec_admin');
  showElementById('sec_usage');
  hideElementById('sec_result');
}); 

document.getElementById('result_btn').addEventListener('click', () => {
  updateSection_Result();
  hideElementById('sec_admin');
  hideElementById('sec_usage');
  showElementById('sec_result');
});

function updateSection_Admin(){
  updateSection_Admin_GroupsTable();
  updateSection_Admin_StudentGroupOption();
  updateSection_Admin_StudentsTable();
  updateSection_Admin_Marks();

}

function updateSection_Usage(){
  updatePositiveAndNegativeMarks();
  updateSection_Usage_GroupSelection();
  updateSection_Usage_StudentsList();
}

function updateSection_Result(){
  // updateSection_Result_GroupSelection();
  // updateSection_Result_StudentsList();
}

function updateSection_Usage_GroupSelection(){
  const select = document.getElementById('usage_group_select_list');
  writeObjectListToSelect(select, g_groups, 'name', 'id');
}

function updateSection_Usage_StudentsList(){
  const table = document.getElementById('usage_students_table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  g_selectedGroupId = document.getElementById('usage_group_select_list').value;

  if(!g_selectedGroupId){
    return;
  }

  const selectedGroupName = g_groups.find(group => group.id == g_selectedGroupId).name;
  const selectedGroupStudents = g_students_groups.filter(student_group => student_group.group.id == g_selectedGroupId).map(student_group => student_group.student);

  const tbody_fragment = document.createDocumentFragment();
  selectedGroupStudents.forEach(student => {
    const tr = document.createElement('tr');

    const td_slct_negative = document.createElement('td');
    const slct_negative = document.createElement('select');
    slct_negative.classList.add('populate-on-click');
    slct_negative.classList.add('slct_negative_mark_general');
    slct_negative.setAttribute('data-student-id', student.id);

    td_slct_negative.appendChild(slct_negative);
    tr.appendChild(td_slct_negative);
    
    
    const td_name = document.createElement('td');
    td_name.textContent = student.name;
    tr.appendChild(td_name);

    const td_slct_positive = document.createElement('td');
    const slct_positive = document.createElement('select');
    slct_positive.classList.add('populate-on-click');
    slct_positive.classList.add('slct_positive_mark_general');
    slct_positive.setAttribute('data-student-id', student.id);

    td_slct_positive.appendChild(slct_positive);
    tr.appendChild(td_slct_positive);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

function populateMarkOptions(event, marks){
  const select = event.target;
  writeObjectListToSelect(select, marks, 'name', 'id', addNoneOption={add:true, text:"Close", value:""});
}


document.querySelector('#usage_students').addEventListener('click', function(event) {
  if (event.target.matches('button.btn_negative_mark_general')) {
    console.log('Negative mark for student');
  }else if (event.target.matches('button.btn_positive_mark_general')) {
    console.log('Positive mark for student');
  }else if (event.target.matches('select.populate-on-click')) {
    if(event.target.classList.contains('slct_negative_mark_general')){
      populateMarkOptions(event, g_negative_marks);
    }else if(event.target.classList.contains('slct_positive_mark_general')){
      populateMarkOptions(event, g_positive_marks);
    }
  }
});

document.getElementById('usage_group_select_list').addEventListener('change', function(event) {
  updateSection_Usage_StudentsList();
});

document.getElementById('usage_students_table').addEventListener('change', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      addMarkToStudent(event);
  }
});

function addMarkToStudent(event) {
  const selectElement = event.target;
  const studentId = selectElement.getAttribute('data-student-id');
  const markId = selectElement.value;

  if (markId) {
      const mark = g_marks.find(mark => mark.id == markId);

      if (mark) {
          // Add the mark to the student
          g_students_groups.find(student_group => student_group.student.id == studentId && student_group.group.id == g_selectedGroupId).addMark(mark);
      }
  }
}




    




function updateSection_Admin_GroupsTable(){
  const table = document.getElementById('admin_group_table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  const tbody_fragment = document.createDocumentFragment();
  g_groups.forEach(group => {
    const tr = document.createElement('tr');
    
    const td_name = document.createElement('td');
    td_name.textContent = group.name;
    tr.appendChild(td_name);

    const td_remove = document.createElement('td');
    
    const btn_remove = document.createElement('button');
    btn_remove.textContent = 'Delete';
    btn_remove.setAttribute('data-group-id', group.id); // Add data attribute to store the group ID
    btn_remove.addEventListener('click', deleteGroup);
    td_remove.appendChild(btn_remove);
    
    tr.appendChild(td_remove);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

function updateSection_Admin_StudentsTable(){
  const table = document.getElementById('admin_student_table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  const tbody_fragment = document.createDocumentFragment();
  g_students.forEach(student => {
    const tr = document.createElement('tr');
    
    const td_name = document.createElement('td');
    td_name.textContent = student.name;
    tr.appendChild(td_name);

    const td_groups = document.createElement('td');
    const student_groups = g_students_groups.filter(student_group => student_group.student.id == student.id).map(student_group => student_group.group);
    student_groups.forEach(group => {
      const span = document.createElement('span');
      span.textContent = group.name;
      
      const btn_remove = document.createElement('button');
      btn_remove.textContent = 'X';
      btn_remove.setAttribute('data-student-id', student.id); // Add data attribute to store the student ID
      btn_remove.setAttribute('data-group-id', group.id); // Add data attribute to store the group ID
      btn_remove.classList.add('btn_remove_student_from_group');
      span.appendChild(btn_remove);
      td_groups.appendChild(span);
    });  
    const select = document.createElement('select');
    select.classList.add('populate-on-click');
    select.classList.add('slct_add_student_to_group');
    select.setAttribute('data-student-id', student.id); // Add data attribute to store the student ID
    td_groups.appendChild(select);
    tr.appendChild(td_groups);

    const td_delete = document.createElement('td');
    
    const btn_delete = document.createElement('button');
    btn_delete.textContent = 'Delete';
    btn_delete.setAttribute('data-student-id', student.id); // Add data attribute to store the student ID
    btn_delete.classList.add('btn_delete_student');
    td_delete.appendChild(btn_delete);
    
    tr.appendChild(td_delete);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

function deleteGroup(event){
  event.preventDefault();
    
  const groupId = event.target.getAttribute('data-group-id');
  const groupName = g_groups.find(group => group.id == groupId).name;
  
  const userConfirmed = confirm(`"${groupName}" is going to be deleted. Are you sure you want it? It can't be undone.`);
  if (userConfirmed) {
      const groupIndex = g_groups.findIndex(group => group.id == groupId);
      g_groups.splice(groupIndex, 1);
      g_students_groups = g_students_groups.filter(student_group => student_group.group.id != groupId); /* rewrite with new list that excluded removed group */
    
      updateSection_Admin_GroupsTable();
      updateSection_Admin_StudentGroupOption();
      updateSection_Admin_StudentsTable();
  }
}

function addGroup(event){
  event.preventDefault();

  const form = event.target.form;
  const groupName = form.elements['group_name'].value;
  g_groups.push(new Group(findMaxIDInObjectList(g_groups) + 1, groupName, []));
  updateSection_Admin_GroupsTable();
}

function updateSection_Admin_StudentGroupOption(){
  const select = document.getElementById('student_group');
  writeObjectListToSelect(select, g_groups, 'name', 'id');
}

// Function to populate the select element with options
function populateStudentGroupOptions(event) {
  const select = event.target;
  const studentId = select.getAttribute('data-student-id');
  if(!studentId){
    writeObjectListToSelect(select, g_groups, 'name', 'id', addNoneOption={add:true, text:"--None--", value:""});
  }else{
    const studentGroups = g_students_groups.filter(student_group => student_group.student.id == studentId).map(student_group => student_group.group);
    const groupsNotIn = g_groups.filter(group => !studentGroups.includes(group));
    writeObjectListToSelect(select, groupsNotIn, 'name', 'id', addNoneOption={add:true, text:"--", value:""});
  }
}

// // Add event listener to all select elements with the class 'populate-on-click'
// document.querySelectorAll('select.populate-on-click').forEach(select => {
//   select.addEventListener('click', populateStudentGroupOptions);
// });

// Add event listener to the parent element for select elements
document.querySelector('#admin_student').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      populateStudentGroupOptions(event);
  }else if (event.target.matches('button.btn_delete_student')) {
        deleteStudent(event);
  }else if (event.target.matches('button.btn_remove_student_from_group')) {
    removeStudentFromGroup(event);
  } 
});

// Add event listener to the parent element for change events on select elements
document.querySelector('#admin_student_table tbody').addEventListener('change', function(event) {
  if (event.target.matches('select.slct_add_student_to_group')) {
      addStudentToGroup(event);
  }
});

function addStudent(event){
  event.preventDefault();

  const form = event.target.form;
  const studentName = form.elements['student_name'].value;
  const studentGroupId = form.elements['student_group'].value;
  const studentGroup = g_groups.find(group => group.id == studentGroupId);
  let student = new Student(findMaxIDInObjectList(g_students) + 1, studentName);
  g_students.push(student);
  g_students_groups.push(new StudentInGroup(student, studentGroup));
  updateSection_Admin_StudentGroupOption();
  updateSection_Admin_StudentsTable();
}

function deleteStudent(event){
  event.preventDefault();

  const studentId = event.target.getAttribute('data-student-id');
  const student = g_students.find(student => student.id == studentId);

  const userConfirmed = confirm(`"${student.name}" is going to be deleted. Are you sure you want it? It can't be undone.`);
  if (userConfirmed) {
    g_students.splice(g_students.indexOf(student), 1);
    g_students_groups = g_students_groups.filter(student_group => student_group.student.id != studentId); /* rewrite with new list that excluded removed student */
    updateSection_Admin_StudentsTable();
  }
}

function removeStudentFromGroup(event){
  event.preventDefault();

  const studentId = event.target.getAttribute('data-student-id');
  const groupId = event.target.getAttribute('data-group-id');
  
  const studentGroupIndex = g_students_groups.findIndex(student_group => student_group.student.id == studentId && student_group.group.id == groupId);
  g_students_groups.splice(studentGroupIndex, 1);
  updateSection_Admin_StudentsTable();
}

function addStudentToGroup(event) {
  const selectElement = event.target;
  const studentId = selectElement.getAttribute('data-student-id');
  const groupId = selectElement.value;

  if (groupId) {
      // Find the student and group objects
      const student = g_students.find(student => student.id == studentId);
      const group = g_groups.find(group => group.id == groupId);

      if (student && group) {
          // Add the student to the group
          g_students_groups.push(new StudentInGroup(student, group));
          updateSection_Admin_StudentsTable();
      }
  }
}

function updateSection_Admin_Marks(){
  const table = document.getElementById('admin_mark_table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  const tbody_fragment = document.createDocumentFragment();
  g_marks.forEach(mark => {
    const tr = document.createElement('tr');
    
    const td_name = document.createElement('td');
    td_name.textContent = mark.name;
    tr.appendChild(td_name);

    const td_type = document.createElement('td');
    td_type.textContent = mark.type.name;
    tr.appendChild(td_type);

    const td_value = document.createElement('td');
    td_value.textContent = mark.value;
    tr.appendChild(td_value);

    const td_description = document.createElement('td');
    td_description.textContent = mark.description;
    tr.appendChild(td_description);

    const td_delete = document.createElement('td');
    
    const btn_delete = document.createElement('button');
    btn_delete.textContent = 'Delete';
    btn_delete.setAttribute('data-mark-id', mark.id); // Add data attribute to store the mark ID
    btn_delete.addEventListener('click', deleteMark);
    td_delete.appendChild(btn_delete);
    
    tr.appendChild(td_delete);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

function deleteMark(event){
  event.preventDefault();

  const markId = event.target.getAttribute('data-mark-id');
  const markName = g_marks.find(mark => mark.id == markId).name;

  const userConfirmed = confirm(`"${markName}" is going to be deleted. Are you sure you want it? It can't be undone.`);
  if (userConfirmed) {
    const markIndex = g_marks.findIndex(mark => mark.id == markId);
    g_marks.splice(markIndex, 1);
    updateSection_Admin_Marks();
  }
}

function addMark(event){
  event.preventDefault();

  const form = event.target.form;
  const markName = form.elements['mark_name'].value;
  const markType = g_mark_types.find(mark_type => mark_type.id == form.elements['mark_type'].value);
  const markValue = form.elements['mark_value'].value;
  const markDescription = form.elements['mark_description'].value;
  g_marks.push(new Mark(findMaxIDInObjectList(g_marks) + 1, markName, markType, markValue, markDescription));
  updateSection_Admin_Marks();
}

function populateMarkType(event) {
  const select = event.target;
  writeObjectListToSelect(select, g_mark_types, 'name', 'id');
}




// Add event listener to the parent element for select elements
document.querySelector('#admin_mark').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      populateMarkType(event);
  }else if (event.target.matches('button.btn_delete_mark')) {
      deleteMark(event);
  }
});


function saveData() {
  const data = {
      marks: g_marks,
      markTypes: g_mark_types,
      students: g_students,
      groups: g_groups,
      studentsGroups: g_students_groups
  };

  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
}

function loadData(event) {
  const file = document.getElementById("load_file").files[0];
  if(!file){
    return;
  }
  const reader = new FileReader();
  reader.onload = function() {
      const jsonString = reader.result;
      const data = JSON.parse(jsonString);

      g_mark_types = data.markTypes.map(markType => MarkType.fromObject(markType));
      g_marks = data.marks.map(mark => Mark.fromObject(mark, g_mark_types));
      g_students = data.students.map(student => Student.fromObject(student));
      g_groups = data.groups.map(group => Group.fromObject(group));
      g_students_groups = data.studentsGroups.map(studentGroup => StudentInGroup.fromObject(studentGroup, g_students, g_groups, g_marks));

      updateSection_Admin();
      updateSection_Usage();
      updateSection_Result();
  };
  reader.readAsText(file);  
}



      






// function renderAdminDiv(){
//   const adminDiv = document.createElement('div');
//   adminDiv.setAttribute('id', 'administration_div');
//   adminDiv.innerHTML = '<h2>Administration</h2>';

//   const adminMarkDiv = renderAdminMarkMainDiv();
//   const adminGroupDiv = renderAdminGroupMainDiv();
//   const adminStudentDiv = renderAdminStudentMainDiv();

//   adminMarkDiv.style.display = 'none';
//   adminGroupDiv.style.display = 'block';
//   adminStudentDiv.style.display = 'none';

//   adminDiv.appendChild(adminMarkDiv);
//   adminDiv.appendChild(adminGroupDiv);
//   adminDiv.appendChild(adminStudentDiv);

//   return adminDiv;
// }

// function renderUsageDiv(){
//   const usageDiv = document.createElement('div');
//   usageDiv.setAttribute('id', 'usage_div');
//   usageDiv.innerHTML = '<h2>In class</h2>';

//   const selectedGroupDiv = document.createElement('div');
//   selectedGroupDiv.setAttribute('id', 'selected_group_div');
  
//   const groupSelectionDiv = renderUsageGroupSelectionDiv(selectedGroupDiv);

//   usageDiv.appendChild(groupSelectionDiv);
//   usageDiv.appendChild(selectedGroupDiv);

//   if (groups.length === 1) {
//     fillUsageSelectedGroupDiv(selectedGroupDiv, g_groups[0]);
//   }

//   return usageDiv;
// }

// function renderResultDiv(){
//   const resultDiv = document.createElement('div');
//   resultDiv.setAttribute('id', 'result_div');
//   resultDiv.innerHTML = '<h2>Results</h2>';

//   return resultDiv;
// }


// function renderAdminMarkMainDiv(){
//   const adminMarkDiv = document.createElement('div');
//   adminMarkDiv.setAttribute('id', 'admin_mark_main_div');
//   adminMarkDiv.innerHTML = '<h3>Mark administration</h3>';

//   // const addMarkButton = document.createElement('button');
//   // addMarkButton.textContent = 'Add mark';
//   // addMarkButton.setAttribute('id', 'add_mark_button');
//   // addMarkButton.addEventListener('click', addNewMark);
//   // adminMarkDiv.appendChild(addMarkButton);

//   adminMarkDiv.appendChild(renderAdminMarkListDiv(g_marks));

//   return adminMarkDiv;
// }

// function renderAdminMarkListDiv(g_marks){
//   const adminMarkListDiv = document.createElement('div');
//   adminMarkListDiv.setAttribute('id', 'admin_mark_list_div');
//   adminMarkListDiv.innerHTML = '<h3>g_marks</h3>';

//   g_marks.forEach(mark => {
//     adminMarkListDiv.appendChild(renderAdminMarkDiv(mark));
//   });

//   return adminMarkListDiv;
// }

// function renderAdminMarkDiv(mark){
//   const markDiv = document.createElement('div');
//   markDiv.setAttribute('id', 'admin_mark_div');
//   markDiv.innerHTML = `
//     <span>${mark.name}</span><span>${mark.description}</span><span>${mark.type.name}</span><span>${mark.value}</span>`;
//   return markDiv;
// }

// function renderAdminGroupMainDiv(){
//   const adminGroupDiv = document.createElement('div');
//   adminGroupDiv.setAttribute('id', 'admin_group_main_div');
//   adminGroupDiv.innerHTML = '<h3>Group administration</h3>';

//   // const addGroupButton = document.createElement('button');
//   // addGroupButton.textContent = 'Add group';
//   // addGroupButton.setAttribute('id', 'add_group_button');
//   // addGroupButton.addEventListener('click', addNewGroup);
//   // adminGroupDiv.appendChild(addGroupButton);

//   adminGroupDiv.appendChild(renderAdminGroupListDiv(groups));

//   return adminGroupDiv;
// }

// function renderAdminGroupListDiv(groups){
//   const adminGroupListDiv = document.createElement('div');
//   adminGroupListDiv.setAttribute('id', 'admin_group_list_div');
//   adminGroupListDiv.innerHTML = '<h3>Groups</h3>';

//   g_groups.forEach(group => {
//     adminGroupListDiv.appendChild(renderAdminGroupDiv(group));
//   });

//   return adminGroupListDiv;
// }

// function renderAdminGroupDiv(group){
//   const groupDiv = document.createElement('div');
//   groupDiv.setAttribute('id', 'admin_group_div');
//   groupDiv.innerHTML = `
//     <span>${group.name}</span>`;
  
//   return groupDiv;
// }

// function renderAdminStudentMainDiv(){
//   const adminStudentDiv = document.createElement('div');
//   adminStudentDiv.setAttribute('id', 'admin_student_main_div');
//   adminStudentDiv.innerHTML = '<h3>Student administration</h3>';

//   // const addStudentButton = document.createElement('button');
//   // addStudentButton.textContent = 'Add student';
//   // addStudentButton.setAttribute('id', 'add_student_button');
//   // addStudentButton.addEventListener('click', addNewStudent);
//   // adminStudentDiv.appendChild(addStudentButton);

//   adminStudentDiv.appendChild(renderAdminStudentListDiv(g_students));

//   return adminStudentDiv;
// }

// function renderAdminStudentListDiv(g_students){
//   const adminStudentListDiv = document.createElement('div');
//   adminStudentListDiv.setAttribute('id', 'admin_student_list_div');
//   adminStudentListDiv.innerHTML = '<h3>Students</h3>';

//   g_students.forEach(student => {
//     adminStudentListDiv.appendChild(renderAdminStudentDiv(student));
//   });

//   return adminStudentListDiv;
// }

// function renderAdminStudentDiv(student){
//   const studentDiv = document.createElement('div');
//   studentDiv.setAttribute('id', 'admin_student_div');
//   studentDiv.innerHTML = `
//     <span>${student.name}</span>
//   `;

//   return studentDiv;
// }
  

// function renderUsageGroupSelectionDiv(selectedGroupDiv){
//   const groupSelectionDiv = document.createElement('div');
//   groupSelectionDiv.setAttribute('id', 'group_selection_div');
//   groupSelectionDiv.innerHTML = '<h3>Group selection</h3>';
  
//   const selectGroupDiv = document.createElement('div');
//   selectGroupDiv.setAttribute('id', 'select_group_div');
//   groupSelectionDiv.appendChild(selectGroupDiv);

//   const selectGroupForm = document.createElement('form');
//   selectGroupForm.setAttribute('id', 'select_group_form');
//   selectGroupDiv.appendChild(selectGroupForm);

//   const selectGroupLabel = document.createElement('label');
//   selectGroupLabel.setAttribute('for', 'group');
//   selectGroupLabel.textContent = 'Select a group:';
//   selectGroupForm.appendChild(selectGroupLabel);

//   const selectGroupSelect = document.createElement('select');
//   selectGroupSelect.setAttribute('name', 'group');
//   selectGroupSelect.setAttribute('id', 'group_select');

//   addObjectListToSelect(selectGroupSelect, g_groups, 'name', 'id');
//   selectGroupSelect.selectedIndex = -1;
//   selectGroupForm.appendChild(selectGroupSelect);

//   selectGroupSelect.addEventListener('change', function() {
//     const selectedGroupId = selectGroupSelect.value;
//     fillUsageSelectedGroupDiv(selectedGroupDiv, g_groups.find(group => group.id == selectedGroupId));
//   });


//   // const addGroupDiv = document.createElement('div');
//   // addGroupDiv.setAttribute('id', 'add_group_div');
//   // groupSelectionDiv.appendChild(addGroupDiv);

//   // const newGroupButton = document.createElement('button');
//   // newGroupButton.textContent = 'New group';
//   // newGroupButton.setAttribute('id', 'add_group_button');
//   // newGroupButton.addEventListener('click', addNewGroup);
//   // addGroupDiv.appendChild(newGroupButton);
  

//   // const addGroupForm = document.createElement('form');
//   // addGroupForm.setAttribute('id', 'add_group_form');
//   // addGroupForm.innerHTML = `
//   //   <input type="text" name="group_name" id="group_name" placeholder="Enter group name">
//   // `;
//   // addGroupForm.style.display = 'none';
//   // addGroupDiv.appendChild(addGroupForm);

//   // const saveGroupButton = document.createElement('button');
//   // saveGroupButton.textContent = 'Save';
//   // saveGroupButton.setAttribute('id', 'save_group_button');
//   // saveGroupButton.addEventListener('click', saveNewGroup);
//   // addGroupForm.appendChild(saveGroupButton);

//   // const cancelGroupButton = document.createElement('button');
//   // cancelGroupButton.textContent = 'Cancel';
//   // cancelGroupButton.setAttribute('id', 'cancel_group_button');
//   // cancelGroupButton.addEventListener('click', cancelNewGroup);
//   // addGroupForm.appendChild(cancelGroupButton);

//   return groupSelectionDiv;
// }

// function fillUsageSelectedGroupDiv(selectedGroupDiv, group) {
//   if(!group) {
//     selectedGroupDiv.innerHTML = '<h3>No group selected</h3>';
//     return selectedGroupDiv;
//   }

//   selectedGroupDiv.innerHTML = `<h3>Group ${group.name}</h3>`;
//   const groupStudentsListDiv = renderUsageStudentsListDiv(group.g_students_marks);
//   selectedGroupDiv.appendChild(groupStudentsListDiv);  

//   return selectedGroupDiv;
// }

// function renderUsageStudentsListDiv(g_students_marks){
//   const studentsListDiv = document.createElement('div');
//   studentsListDiv.setAttribute('id', 'students_list_div');

//   g_students_marks.forEach(student_g_marks => {
//     studentsListDiv.appendChild(renderStudentDiv(student_marks));
//   });

//   return studentsListDiv;
// }

// function renderStudentDiv(student_marks){
//   const studentDiv = document.createElement('div');
//   studentDiv.classList.add('student_div');

//   const negativeMarkButton = document.createElement('button');
//   negativeMarkButton.textContent = '-';
//   negativeMarkButton.addEventListener('click', () => {
//     console.log(`Negative mark for student ${student_marks.student.name}`);
//   });
//   studentDiv.appendChild(negativeMarkButton);

//   const studentNameSpan = document.createElement('span');
//   studentNameSpan.textContent = student_marks.student.name;
//   studentDiv.appendChild(studentNameSpan);

//   const positiveMarkButton = document.createElement('button');
//   positiveMarkButton.textContent = '+';
//   positiveMarkButton.addEventListener('click', () => {
//     console.log(`Positive mark for student ${student_marks.student.name}`);
//   });
//   studentDiv.appendChild(positiveMarkButton);

//   return studentDiv;
// }





// function toggleAddGroupForm(){
//   const addGroupForm = document.getElementById('add_group_form');
//   addGroupForm.style.display = addGroupForm.style.display === 'none' ? 'block' : 'none';
//   const addGroupButton = document.getElementById('add_group_button');
//   addGroupButton.style.display = addGroupButton.style.display === 'none' ? 'block' : 'none';
// }

// function addNewGroup(event){
//   event.preventDefault();
//   toggleAddGroupForm();
// }

// function saveNewGroup(event){
//   event.preventDefault();
//   const groupName = document.getElementById('group_name').value;
//   g_groups.push({id: g_groups.length + 1, name: groupName, g_students_marks: []});
//   console.log(groupName);
//   toggleAddGroupForm();
// }

// function cancelNewGroup(event){
//   event.preventDefault();
//   toggleAddGroupForm();
// }

// function clearMain(){
//   const main = document.getElementById('main');
//   main.innerHTML = '';
//   return main;
// }

updateSection_Usage();



document.addEventListener('DOMContentLoaded', async () => {

  // const main = document.getElementById('main');

  // main.appendChild(renderUsageDiv());


  // /* If there is only one group, show it */
  // if (groups.length == 0) {
  //   selectedGroup = g_groups[0];
  //   document.body.appendChild(renderGroupDiv());
  // }

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
