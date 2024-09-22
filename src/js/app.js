
/* import { getStudents } from '../db/indexeddb'; */
// import { renderStudentList } from './ui';

class GradeStrategy {
  constructor(name, thresholds, grades) {
    this.name = name;
    this.thresholds = thresholds;
    this.grades = grades;
  }

  static fromObject(obj) {
    return new GradeStrategy(obj.thresholds, obj.grades);
  }

  static fromJSON(json) {
    return GradeStrategy.fromObject(JSON.parse(json));
  }

  toJSON() {
    return {
      name: this.name,
      thresholds: this.thresholds,
      grades: this.grades
    };
  }

  getGrade(score) {
    for (let i = 0; i < this.thresholds.length; i++) {
      if (score >= this.thresholds[i]) {
        return this.grades[i];
      }
    }
    return this.grades[this.grades.length - 1];
  }
}


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

  /**
   * 
   * @param {Mark} mark to add 
   * @returns index of the added mark
   */
  addMark(mark) {
    return this.marks_assigned.push(new MarkAssignment(mark, Date.now())) - 1;
  }

  removeMark(mark) {
    const markIndex = this.marks_assigned.findIndex(mark_assigned => mark_assigned.mark === mark);
    removeMarkByIndex(markIndex);
  }

  removeMarkByIndex(markIndex) {
    this.marks_assigned.splice(markIndex, 1);
  }
}

var g_gradesStrategies = [
  new GradeStrategy("JH", [90, 80, 70, 60, 45, 30, 15, 0], ['1', '1-', '2', '2-', '3', '3-', '4', '4-', '5']),
  new GradeStrategy("NoStress", [], [':-)'])
];

var g_mark_types = [
  new MarkType(1, 'relative', 'Pro výpočet průměrné hodnoty'),
  new MarkType(2, 'absolute', 'Pro absolutní změnu hodnoty')
];
var g_marks = [
  new Mark(1, 'Odpověď', g_mark_types[0], 50, 'Odpověď na otázku'),
  new Mark(2, 'Otázka/Diskuze', g_mark_types[0], 100, 'Otázka či diskuze k tématu'),
  new Mark(3, 'Neaktivita', g_mark_types[0], -100, 'Neaktivita'),
  new Mark(4, 'Prezentace', g_mark_types[1], 10, 'Prezentace navíc'),
  new Mark(5, 'Telefon', g_mark_types[1], -10, 'Používá ve třídě v hodně telefon k nesouvisející činnosti')
];
var g_students = [
  new Student(1, 'Adam'),
  new Student(2, 'Bára'),
  new Student(3, 'Cyril')
];
var g_groups = [
  new Group(1, 'Ukázková')
];
var g_students_groups = [
  new StudentInGroup(g_students[0], g_groups[0], [new MarkAssignment(g_marks[0], Date.now()), new MarkAssignment(g_marks[1], Date.now())]),
  new StudentInGroup(g_students[1], g_groups[0], [new MarkAssignment(g_marks[1], Date.now()), new MarkAssignment(g_marks[2], Date.now())]),
  new StudentInGroup(g_students[2], g_groups[0], [new MarkAssignment(g_marks[2], Date.now())]),
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
  document.getElementById('usage_group_name').textContent = selectedGroupName;

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
    const span = document.createElement('span');
    span.classList.add('revert-button-container');
    td_name.appendChild(span);    
    tr.appendChild(td_name);

    const td_slct_positive = document.createElement('td');
    const slct_positive = document.createElement('select');
    slct_positive.classList.add('populate-on-click');
    slct_positive.classList.add('slct_positive_mark_general');
    slct_positive.setAttribute('data-student-id', student.id);

    td_slct_positive.appendChild(slct_positive);
    tr.appendChild(td_slct_positive);

    const td_missing = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    td_missing.appendChild(checkbox);
    tr.appendChild(td_missing);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

// Function to handle checkbox change
function onCheckboxChange(event) {
  const checkbox = event.target;
  const studentRow = checkbox.closest('tr');
  if (checkbox.checked) {
      studentRow.classList.add('student-missing');
  } else {
      studentRow.classList.remove('student-missing');
  }
}

// Add event listener for checkbox change
document.querySelector('#usage_students').addEventListener('change', function(event) {
  if (event.target.matches('input[type="checkbox"]')) {
      onCheckboxChange(event);
  }
});

function populateMarkOptions(event, marks){
  const select = event.target;
  writeObjectListToSelect(select, marks, 'name', 'id', addNoneOption={add:true, text:"Close", value:""});
}


document.querySelector('#usage_students').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
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

// Add event listeners for focus and blur events on select elements
document.getElementById('usage_students_table').addEventListener('focusin', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      const studentRow = event.target.closest('tr');
      studentRow.classList.add('highlight-row');
  }
});

document.getElementById('usage_students_table').addEventListener('focusout', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      const studentRow = event.target.closest('tr');
      studentRow.classList.remove('highlight-row');
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
        const student_group = g_students_groups.find(student_group => student_group.student.id == studentId && student_group.group.id == g_selectedGroupId);
        const index = student_group.addMark(mark);
        
        const studentRow = event.target.closest('tr');
        showRevertButton(studentRow, student_group, index);
      }
  }
}

// Function to show the "Revert" button
function showRevertButton(studentRow, student_group, markIndex) {
  const revertButtonContainer = studentRow.querySelector('.revert-button-container');
  revertButtonContainer.innerHTML = ''; // Clear any existing button
  const mark_name = student_group.marks_assigned[markIndex].mark.name;

  studentRow.classList.add('highlight-row'); // Highlight the row when a mark is added

  const revertButton = document.createElement('button');
  let countdown = 5; // Countdown time in seconds
  revertButton.className = 'revert-button';
  revertButton.onclick = function() {
      student_group.removeMarkByIndex(markIndex);
      clearInterval(countdownInterval); // Stop the countdown when the button is clicked
      revertButtonContainer.innerHTML = ''; // Remove the button immediately
      studentRow.classList.remove('highlight-row'); // Remove the highlight from the row
  }
  

  revertButton.textContent = `Revert ${mark_name}: ${countdown}`;
  // Update the button text every second to show the countdown
  const countdownInterval = setInterval(() => {
    countdown -= 1;
    if (countdown > 0) {
        revertButton.textContent = `Revert ${mark_name}: ${countdown}`;
    } else {
        clearInterval(countdownInterval); // Stop the countdown when it reaches zero
        revertButtonContainer.innerHTML = ''; // Remove the button
        studentRow.classList.remove('highlight-row'); // Remove the highlight from the row
    }
  }, 1000);

  revertButtonContainer.appendChild(revertButton);
}

function usage_selectStudent(event){
  const table = document.getElementById('usage_students_table');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  // Filter out rows with the 'student-missing' class
  const availableRows = rows.filter(row => !row.classList.contains('student-missing'));
  if (availableRows.length === 0) return;

  // Randomly select a student row from the available rows
  const randomIndex = Math.floor(Math.random() * availableRows.length);
  const selectedRow = availableRows[randomIndex];

  // Highlight the selected row with a border
  rows.forEach(row => row.classList.remove('selected-student'));
  setTimeout(() => {
    selectedRow.classList.add('selected-student');
  }, 1000);

  // Scroll the screen to the selected row
  selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  if(!groupName){
    alert('Please enter a group name');
    return;
  }
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

  if(!studentName){
    alert('Please enter a student name');
    return;
  }
  
  let student = new Student(findMaxIDInObjectList(g_students) + 1, studentName);
  g_students.push(student);

  if(studentGroupId){
    const studentGroup = g_groups.find(group => group.id == studentGroupId);
    g_students_groups.push(new StudentInGroup(student, studentGroup));
  }  
  updateSection_Admin_StudentGroupOption();
  updateSection_Admin_StudentsTable();
  form.elements['student_group'].value = studentGroupId;

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
  const markTypeId = form.elements['mark_type'].value;
  const markValue = form.elements['mark_value'].value;

  if(!markName || !markTypeId || !markValue){
    alert('Please enter a mark name, select a mark type and enter a mark value');
    return;
  }

  const markType = g_mark_types.find(mark_type => mark_type.id == markTypeId);
  const markDescription = form.elements['mark_description'].value || '--Undescribed--';
  g_marks.push(new Mark(findMaxIDInObjectList(g_marks) + 1, markName, markType, markValue, markDescription));
  updateSection_Admin_Marks();
}

function populateMarkType(event) {
  const select = event.target;
  const selectedMarkId = select.value;
  writeObjectListToSelect(select, g_mark_types, 'name', 'id');
  select.value = selectedMarkId || g_mark_types[0].id;
}




// Add event listener to the parent element for select elements
document.querySelector('#admin_mark').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      populateMarkType(event);
  }else if (event.target.matches('button.btn_delete_mark')) {
      deleteMark(event);
  }
});

document.querySelector('#admin_markOfStudent_form').addEventListener('click', function(event) {
  if (event.target.matches('select#admin_mos_slct_group')) {
      populateAdmin_mos_Group(event);
  } else if (event.target.matches('select#admin_mos_slct_student')) {
      populateAdmin_mos_Student(event);
  }
});

document.querySelector('#admin_markOfStudent_form').addEventListener('change', function(event) {
  if (event.target.matches('select#admin_mos_slct_group')) {
      onAdmin_mos_GroupChange(event);
  } else if (event.target.matches('select#admin_mos_slct_student')) {
      onAdmin_mos_StudentChange(event);
  }
});

function populateAdmin_mos_Group(event){
  const selectGroup = event.target;
  const groupId = selectGroup.value;
  const selectStudent = document.getElementById('admin_mos_slct_student');
  const studentId = selectStudent.value;
  
  if(!studentId){
    writeObjectListToSelect(selectGroup, g_groups, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    return;
  }

  const groupsOfStudent = g_students_groups.filter(student_group => student_group.student.id == studentId).map(student_group => student_group.group);
  writeObjectListToSelect(selectGroup, groupsOfStudent, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
  selectGroup.value = groupId;

}

function populateAdmin_mos_Student(event){
  const selectStudent = event.target;
  const studentId = selectStudent.value;
  const selectGroup = document.getElementById('admin_mos_slct_group');
  const groupId = selectGroup.value;

  if(!groupId){
    writeObjectListToSelect(selectStudent, g_students, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    return;
  }

  const studentsInGroup = g_students_groups.filter(student_group => student_group.group.id == groupId).map(student_group => student_group.student);
  writeObjectListToSelect(selectStudent, studentsInGroup, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
  selectStudent.value = studentId;
}

function onAdmin_mos_GroupChange(event){
  const selectGroup = event.target;
  const groupId = selectGroup.value;
 
  if(!groupId){
    const selectStudent = document.getElementById('admin_mos_slct_student');
    writeObjectListToSelect(selectGroup, g_groups, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    writeObjectListToSelect(selectStudent, g_students, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    return;
  }

  const studentsInGroup = g_students_groups.filter(student_group => student_group.group.id == groupId).map(student_group => student_group.student);
  if(studentsInGroup.length === 1){
    const selectStudent = document.getElementById('admin_mos_slct_student');
    writeObjectListToSelect(selectStudent, studentsInGroup, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    selectStudent.value = studentsInGroup[0].id;
  }  
}

function onAdmin_mos_StudentChange(event){
  const selectStudent = event.target;
  const studentId = selectStudent.value;

  if(!studentId){
    const selectGroup = document.getElementById('admin_mos_slct_group');
    writeObjectListToSelect(selectStudent, g_students, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    writeObjectListToSelect(selectGroup, g_groups, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    return;
  }

  const groupsOfStudent = g_students_groups.filter(student_group => student_group.student.id == studentId).map(student_group => student_group.group);
  if(groupsOfStudent.length === 1){
    const selectGroup = document.getElementById('admin_mos_slct_group');
    writeObjectListToSelect(selectGroup, groupsOfStudent, 'name', 'id', addNoneOption={add:true, text:"--Reset--", value:""});
    selectGroup.value = groupsOfStudent[0].id;
  }
}

function createJSON(){
  const data = {
    gradesStrategies: g_gradesStrategies,
    marks: g_marks,
    markTypes: g_mark_types,
    students: g_students,
    groups: g_groups,
    studentsGroups: g_students_groups
  };

  return JSON.stringify(data);
};

function loadFromJSON(jsonString){
  const data = JSON.parse(jsonString);

  g_gradesStrategies = data.gradesStrategies.map(gradeStrategy => GradeStrategy.fromObject(gradeStrategy));
  g_mark_types = data.markTypes.map(markType => MarkType.fromObject(markType));
  g_marks = data.marks.map(mark => Mark.fromObject(mark, g_mark_types));
  g_students = data.students.map(student => Student.fromObject(student));
  g_groups = data.groups.map(group => Group.fromObject(group));
  g_students_groups = data.studentsGroups.map(studentGroup => StudentInGroup.fromObject(studentGroup, g_students, g_groups, g_marks));

  updateSection_Admin();
  updateSection_Usage();
  updateSection_Result();
}

function saveDataToFile() {
  const jsonString = createJSON();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
}

function loadDataFromFile(event) {
  const file = document.getElementById("load_file").files[0];
  if(!file){
    return;
  }
  const reader = new FileReader();
  reader.onload = function() {
      const jsonString = reader.result;
      loadFromJSON(jsonString);
  };
  reader.readAsText(file);  
}

// Function to save data to local storage
function saveDataToLocalStorage() {
  const jsonString = createJSON();
  localStorage.setItem('BadMarks_data', jsonString);
}

// Set up periodic saving every 5 minutes (300000 milliseconds)
setInterval(saveDataToLocalStorage, 300000);

// Function to load data from local storage
function loadDataFromLocalStorage() {
  const jsonString = localStorage.getItem('BadMarks_data');
  if (jsonString) {
    loadFromJSON(jsonString);
  }
}

// Save data when the panel (or window) is closed
window.addEventListener('beforeunload', saveDataToLocalStorage);

function updateMarkOfStudentTable(){
  const studentId = document.getElementById('admin_mos_slct_student').value;
  const groupId = document.getElementById('admin_mos_slct_group').value;

  if(!studentId || !groupId){
    alert('Please select a student and a group');
    return;
  }

  const student = g_students.find(student => student.id == studentId);
  const group = g_groups.find(group => group.id == groupId);
  const student_group = g_students_groups.find(student_group => student_group.student.id == studentId && student_group.group.id == groupId);

  document.getElementById('admin_mos_span_name').textContent = student.name;
  document.getElementById('admin_mos_span_group').textContent = group.name;

  const table = document.getElementById('admin_markOfStudent_table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  if(student_group.marks_assigned.length === 0){
    tbody.innerHTML = '<tr><td colspan="6">No marks assigned</td></tr>';
    return;
  }

  const tbody_fragment = document.createDocumentFragment();
  student_group.marks_assigned.forEach((mark_assignment, index) => {
    const tr = document.createElement('tr');

    const td_name = document.createElement('td');
    td_name.textContent = mark_assignment.mark.name;
    tr.appendChild(td_name);

    const td_type = document.createElement('td');
    td_type.textContent = mark_assignment.mark.type.name;
    tr.appendChild(td_type);

    const td_value = document.createElement('td');
    td_value.textContent = mark_assignment.mark.value;
    tr.appendChild(td_value);

    const td_description = document.createElement('td');
    td_description.textContent = mark_assignment.mark.description;
    tr.appendChild(td_description);

    const td_datetime = document.createElement('td');
    td_datetime.textContent = new Date(mark_assignment.datetime).toLocaleString();
    tr.appendChild(td_datetime);

    const td_delete = document.createElement('td');
    const btn_delete = document.createElement('button');
    btn_delete.textContent = 'Delete';
    btn_delete.classList.add('btn_delete_markOfStudent');
    btn_delete.setAttribute('data-student-id', studentId);
    btn_delete.setAttribute('data-group-id', groupId);
    btn_delete.setAttribute('data-markAssigned-index', index);
    td_delete.appendChild(btn_delete);
    tr.appendChild(td_delete);

    tbody_fragment.appendChild(tr);
  });
  tbody.appendChild(tbody_fragment);
}

function deleteMarkOfStudent(event){
  event.preventDefault();

  const studentId = event.target.getAttribute('data-student-id');
  const groupId = event.target.getAttribute('data-group-id');
  const markAssignedIndex = event.target.getAttribute('data-markAssigned-index');

  const student_group = g_students_groups.find(student_group => student_group.student.id == studentId && student_group.group.id == groupId);

  student_group.removeMarkByIndex(markAssignedIndex);
  updateMarkOfStudentTable();
}

document.getElementById('admin_markOfStudent_table').addEventListener('click', function(event) {
  if (event.target.matches('button.btn_delete_markOfStudent')) {
      deleteMarkOfStudent(event);
  }
});

function populateResultGroupOptions(event){
  const select = event.target;
  writeObjectListToSelect(select, g_groups, 'name', 'id');
}

function populateResultStrategyOptions(event){
  const select = event.target;
  writeObjectListToSelect(select, g_gradesStrategies, 'name', 'name');
}

document.getElementById('result_group_select_list').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      populateResultGroupOptions(event);
  }
});

document.getElementById('result_strategy_select_list').addEventListener('click', function(event) {
  if (event.target.matches('select.populate-on-click')) {
      populateResultStrategyOptions(event);
  }
});


function showResult(event){
  event.preventDefault();

  const groupId = document.getElementById('result_group_select_list').value;
  const strategyName = document.getElementById('result_strategy_select_list').value || "NoStress";

  if (!groupId ) {
    alert('Please select a group');
    return;
  }
  const dateFrom = new Date(document.getElementById('result_group_select_date_from').value ||
    new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1, 
      new Date().getDate()
  ));
  dateFrom.setHours(0, 0, 0, 0);

  const dateTo = new Date(document.getElementById('result_group_select_date_to').value || Date.now());
  dateTo.setHours(23, 59, 59, 999);

  if (dateFrom > dateTo) {
    alert('The "From" date must be before the "To" date');
    return;
  }

  const group = g_groups.find(group => group.id == groupId);
  const strategy = g_gradesStrategies.find(gradeStrategy => gradeStrategy.name == strategyName);

  document.getElementById('result_group_name').textContent = group.name;
  document.getElementById('result_date_from').textContent = dateFrom.toLocaleDateString();
  document.getElementById('result_date_to').textContent = dateTo.toLocaleDateString();

  const tbody = document.getElementById('result_students_table').querySelector('tbody');
  tbody.innerHTML = ''; // Clear existing rows

  g_students_groups.filter(student_group => student_group.group.id == groupId).forEach(student_group => {
    const filteredMarks = student_group.marks_assigned.filter(mark_assignment => {
        const markDate = new Date(mark_assignment.datetime);
        return markDate >= dateFrom && markDate <= dateTo;
    });

    const relativeMarkTypeId = g_mark_types.find(mark_type => mark_type.name === 'relative').id;
    const relativeMarks = filteredMarks.filter(mark_assignment => mark_assignment.mark.type.id === relativeMarkTypeId);

    const absoluteMarkTypeId = g_mark_types.find(mark_type => mark_type.name === 'absolute').id;
    const absoluteMarks = filteredMarks.filter(mark_assignment => mark_assignment.mark.type.id === absoluteMarkTypeId);

    const relativeResult = relativeMarks.length > 0 ? relativeMarks.reduce((sum, mark_assignment) => sum + mark_assignment.mark.value, 0) / relativeMarks.length : 0;
    const absoluteResult = absoluteMarks.reduce((sum, mark_assignment) => sum + mark_assignment.mark.value, 0);

    const overallResult = relativeResult + absoluteResult;

    const degree = calculateGrade(overallResult, strategy);

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${student_group.student.name}</td>
        <td>${relativeResult.toFixed(2)} (${relativeMarks.length} marks)</td>
        <td>${absoluteResult} (${absoluteMarks.length} marks)</td>
        <td>${overallResult.toFixed(2)}</td>
        <td>${degree}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Function to calculate degree based on overall result
function calculateGrade(overallResult, strategy) {
  return strategy.getGrade(overallResult);
}

document.addEventListener('DOMContentLoaded', async () => {

  loadDataFromLocalStorage();
  updateSection_Usage();

});


