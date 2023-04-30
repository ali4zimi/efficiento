// remove settings from chrome.storage;
// chrome.storage.sync.remove('settings');

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
}, 100);



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
  console.log(todos)
  todoList.innerHTML = '';

  todos.forEach(todo => {
    const todoEl = document.createElement('li');
    todoEl.classList.add('todo-item');
    todoEl.innerHTML = `
      <div>
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        ${todo.text} 
      </div>
      <div>
        <button class="delete-todo">Delete</button>
      </div>
      `;
    todoList.appendChild(todoEl);
  });
}



const addTodoForm = document.querySelector('.add-todo-form');

addTodoForm.addEventListener('submit', e => {
  e.preventDefault();

  const todoText = addTodoForm.todo.value.trim();

  if (todoText) {
    todos.push({
      text: todoText,
      completed: false,
    });
    addTodoForm.reset();
    chrome.storage.sync.set({ todos });
    initializeTodoList();
  }
 
});

// delete todo

todoList.addEventListener('click', e => {
  if (e.target.classList.contains('delete-todo')) {
    const todoItem = e.target.closest('.todo-item');
    const todoText = todoItem.querySelector('div:first-child').textContent.trim();

    todos.splice(todos.findIndex(todo => todo.text === todoText), 1);
    chrome.storage.sync.set({ todos });
    initializeTodoList();
  }
});


// toggle todo completed

todoList.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const todoItem = e.target.closest('.todo-item');
    const todoText = todoItem.querySelector('div:first-child').textContent.trim();

    todos.find(todo => todo.text === todoText).completed = !todos.find(todo => todo.text === todoText).completed;
    chrome.storage.sync.set({ todos });
    initializeTodoList();
  }
});
