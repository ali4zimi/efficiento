// remove settings from chrome.storage;
// chrome.storage.sync.remove('settings');

const resetButton = document.querySelector('.reset-button');
resetButton.addEventListener('click', () => {
  chrome.storage.sync.set({ settings: defaultSettings });

  // delete todos
  chrome.storage.sync.remove('todos');

  // reload the page
  window.location.reload();
});


const defaultSettings = {
  clock: true,
  timeFormat: 12,
  greeting: true,
  wallpaper: true,
  weather: true,
};

const settings = {};
const todos = [];

chrome.storage.sync.get().then(data => {
  if (data.settings) {
    Object.assign(settings, data.settings);
  } else {
    chrome.storage.sync.set({ settings: defaultSettings });
    Object.assign(settings, defaultSettings);
  }

  if (data.todos) {
    todos.length = 0; // clear the array
    todos.push(...data.todos);
  } else {
    chrome.storage.sync.set({ todos });
  }
  initializeTodoList();
  updateClock();
});


const clock = document.querySelector('.clock');
const greeting = document.querySelector('.greeting');


const updateClock = () => {
  if (settings.clock) {
    const now = new Date();

    const hours = settings.timeFormat === 12 ? now.getHours() % 12 || 12 : now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    clock.innerHTML = `${hours}:${minutes} ${amPm}`;
  } else {
    clock.innerHTML = '';
  }
}


setInterval(() => {
  updateClock();
}, 500);



const updateGreeting = () => {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    greeting.innerHTML = 'Good Morning';
  } else if (hours < 18) {
    greeting.innerHTML = 'Good Afternoon';
  } else {
    greeting.innerHTML = 'Good Evening';
  }
}

updateGreeting();


//////////////////////////////////
/////////// TODO LIST ////////////
//////////////////////////////////

const todoList = document.querySelector('.todo-list');
// todos.push(todo);

const initializeTodoList = () => {
  todoList.innerHTML = '';

  todos.forEach(todo => {
    const todoEl = document.createElement('li');
    todoEl.classList.add('todo-item');
    todoEl.dataset.id = todo.id;
    todoEl.innerHTML = `
      <div class="todo-item-text">
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span>${todo.text} </span>
      </div>
      <div class="todo-item-tags">
        <div class="priority ${todo.priority}">${todo.priority} </div>
      </div>
      <div class="todo-item-actions">
        <span class="edit-todo">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
        </span>
        <div class="delete-todo">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"/></svg> 
        </div>
      </div>
      `;
    todoList.appendChild(todoEl);
  });
}

//////////////////////////////////
///////// ADD TODO FORM //////////
//////////////////////////////////

const addTodoForm = document.querySelector('.add-todo-form');

addTodoForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!addTodoForm.todo.value.trim()) {
    return;
  }

  const todo = {
    // generate unique integer id
    id: Date.now() ,
    text: addTodoForm.todo.value.trim(),
    priority: addTodoForm.priority.value,
    completed: false,
  }

  todos.push(todo);
  addTodoForm.reset();
  chrome.storage.sync.set({ todos });
  initializeTodoList();
});

//////////////////////////////////
//////// DELETE TODO ITEM ////////
//////////////////////////////////

todoList.addEventListener('click', e => {
  if (e.target.classList.contains('delete-todo') || e.target.closest('.delete-todo')) {
    const todoItem = e.target.closest('.todo-item');
    const id = todoItem.dataset.id;
 
    const index = todos.findIndex(todo => todo.id == id);
    todos.splice(index, 1);
    chrome.storage.sync.set({ todos });
    initializeTodoList();
  }
});


//////////////////////////////////
///// MARK TODO AS COMPLETED /////
//////////////////////////////////

todoList.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const todoItem = e.target.closest('.todo-item');
    const id = todoItem.dataset.id;
    const index = todos.findIndex(todo => todo.id == id);
    todos[index].completed = !todos[index].completed;
    chrome.storage.sync.set({ todos });
  }
});



// show dialog to edit todo

const showDialogButton = document.querySelectorAll('.edit-todo');

todoList.addEventListener('click', e => {
  if (e.target.classList.contains('edit-todo') || e.target.closest('.edit-todo')) {
    const todoItem = e.target.closest('.todo-item');
    const id = todoItem.querySelector('div:first-child').dataset.id;
    const index = todos.findIndex(todo => todo.id === id);
    const todo = todos[index];

    createDialog();
  }
});



// create Dialog box;

const createDialog = () => {
  const dialog = document.createElement('div');
  dialog.classList.add('dialog');
  dialog.innerHTML = `
    <div class="dialog-content">
      <div class="dialog-header">
        <div class="dialog-title">Edit Todo</div>
        <div class="dialog-close">X</div>
      </div>
      <div class="dialog-body">
        <form class="edit-todo-form">
          <input type="text" name="todo" value="Edit todo">
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);
}

