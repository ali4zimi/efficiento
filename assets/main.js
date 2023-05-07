// Description: This file contains the main javascript code for the extension

// Get the elements from the DOM
const resetButton = document.querySelector('.reset-button');
const clockEl = document.querySelector('.clock .time');
const dateEl = document.querySelector('.date');
const greetingEl = document.querySelector('.greeting-section');
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const todoList = document.querySelector('.todo-list');
const addTodoForm = document.querySelector('.add-todo-form');
const showDialogButton = document.querySelectorAll('.edit-todo');

const noteList = document.querySelector('.note-list');
const addNoteForm = document.querySelector('.add-note-form');

addNoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let note = {
    "content": addNoteForm.content.value
  }
  notes.push(note);
  chrome.storage.sync.set({ notes });
  addNoteForm.content.value = '';
  renderNoteList();
});

const renderNoteList = () => {
  noteList.innerHTML = '';

  notes.forEach((note) => {
    const noteEl = document.createElement('li');
    noteEl.classList.add('note-item')
    noteEl.innerHTML = `<div class="note-content">
          ${note.content}
          </div>`;
    noteList.append(noteEl);
  });
}

const defaultSettings = {
  clock: true,
  hour24: true,
  greeting: true,
  wallpaper: true,
  weather: true,
  defaultTab: 'eh-matrix',
};

const settings = {};
const todos = [];
const notes = [];

chrome.storage.sync.get().then(data => {
  if (data.settings) {
    Object.assign(settings, data.settings);
  } else {
    chrome.storage.sync.set({ settings: defaultSettings });
    Object.assign(settings, defaultSettings);
  }

  if (data.todos) {
    todos.length = 0;
    todos.push(...data.todos);
  } else {
    chrome.storage.sync.set({ todos });
  }

  if (data.notes) {
    notes.length = 0;
    notes.push(...data.notes);
  } else {
    chrome.storage.sync.set({ notes });
  }

  if (data.markers) {
    markers.length = 0;
    markers.push(...data.markers);
  } else {
    chrome.storage.sync.set({ markers });
  }

  updateClock();
  updateGreeting();
  // updateWallpaper();
  tabManager.init();
  initializeTodoList();
  renderNoteList();

  renderMarkers();

  document.body.classList.remove('hidden')
});

//////////////////////////////////
///////// RESET BUTTON ///////////
//////////////////////////////////
resetButton.addEventListener('click', () => {
  chrome.storage.sync.set({ settings: defaultSettings });
  // delete todos
  chrome.storage.sync.remove('todos');
  // delete notes
  chrome.storage.sync.remove('notes');
  // delete markers
  chrome.storage.sync.remove('markers');
  // reload the page
  window.location.reload();
});

//////////////////////////////////
////// UPDATE WALLPAPER //////////
//////////////////////////////////

const updateWallpaper = () => {
  if (settings.wallpaper) {
    const now = new Date();
    const hours = now.getHours();
    const isDayTime = hours > 6 && hours < 20;
    const url = isDayTime ? 'https://source.unsplash.com/1600x900/?nature,water' : 'https://source.unsplash.com/1600x900/?nature,night';
    document.body.style.backgroundImage = `url(${url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = 'none';
  }
}



let countSeconds = 0;
setInterval(() => {
  updateClock();
}, 500);

const updateClock = () => {
  if (settings.clock) {
    const now = new Date();
    const time = {
      "hours": settings.timeFormat === 12 ? now.getHours() % 12 || 12 : now.getHours(),
      "minutes": now.getMinutes().toString().padStart(2, '0'),
      "amPm": ''
    }

    if (!settings.hour24) {
      time.amPm = now.getHours() >= 12 ? 'PM' : 'AM';
    } else {
      time.amPm = '';
    }

    clockEl.innerHTML = `${time.hours}:${time.minutes} ${time.amPm}`;

    if (countSeconds > 10 || countSeconds == 0) {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      const date = {
        "year": now.getFullYear(),
        "month": months[now.getMonth()],
        "day": now.getDate().toString().padStart(2, '0')
      }
      dateEl.innerHTML = `${date.month} ${date.day}, ${date.year}`;
    }
    countSeconds++;
  } else {
    clock.innerHTML = '';
  }
}

//////////////////////////////////
////////// UPDATE GREETING ///////
//////////////////////////////////

const updateGreeting = () => {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    greetingEl.innerHTML = 'Good Morning';
  } else if (hours < 18) {
    greetingEl.innerHTML = 'Good Afternoon';
  } else {
    greetingEl.innerHTML = 'Good Evening';
  }
}

//////////////////////////////////
////////// TAB MANAGEMENT ////////
//////////////////////////////////

const tabManager = {
  init() {
    // activate user definded tab
    tabLinks.forEach(link => {
      tabLinks.forEach(link => {
        if (link.dataset.target === settings.defaultTab) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      tabContents.forEach(content => {
        if (content.dataset.target === settings.defaultTab) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        tabLinks.forEach(link => link.classList.remove('active'));
        link.classList.add('active');
        const target = link.dataset.target;
        tabContents.forEach(content => {
          if (content.dataset.target === target) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
  },



}

//////////////////////////////////
/////////// TODO LIST ////////////
//////////////////////////////////

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

addTodoForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!addTodoForm.todo.value.trim()) {
    return;
  }

  const todo = {
    id: Date.now(),
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



//////////////////////////////////
//////// BOOKMARK MANAGER ////////
//////////////////////////////////

const bookmarks = [];

chrome.bookmarks.getTree(tree => {
  const bookmarksBar = tree[0].children[0].children;
  const otherBookmarks = tree[0].children[1].children;

  bookmarksBar.forEach(bookmark => {
    bookmarks.push(bookmark);
  });

  otherBookmarks.forEach(bookmark => {
    bookmarks.push(bookmark);
  });

  renderBookmarks();

});

const bookmarksListEl = document.getElementById('bookmarkList');

const renderBookmarks = () => {
  bookmarksListEl.innerHTML = '';

  bookmarks.forEach(bookmark => {
    const bookmarkEl = document.createElement('li');
    bookmarkEl.classList.add('bookmark-item');
    bookmarkEl.dataset.id = bookmark.id;
    // add title
    bookmarkEl.title = bookmark.title;
    bookmarkEl.innerHTML = `
          <div class="bookmark-item-wrapper">
            <div class="bookmark-icon">
              <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" alt="icon">
            </div>
            <div class="bookmark-item-title" title="${bookmark.title}">
              <span>${bookmark.title}</span>
            </div>
            <div class="bookmark-remove-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"/></svg>
            </div>
          </div>
        `;

    bookmarksListEl.appendChild(bookmarkEl);
  });
}


//////////////////////////////////
///////// MARKER MANAGER /////////
//////////////////////////////////

const markersListEl = document.getElementById('markerList');
const markers = [];


const renderMarkers = () => {
  markersListEl.innerHTML = '';

  markers.forEach(marker => {
    const markerEl = document.createElement('li');
    markerEl.classList.add('marker-item');
    markerEl.dataset.id = marker.url;
    // add title
    markerEl.title = marker.url;
    markerEl.innerHTML = `
          <div class="marker-item-wrapper">
            <div class="marker-icon">
              <img src="https://www.google.com/s2/favicons?domain=${marker.url}" alt="icon">
            </div>
            <div class="marker-item-title" title="${marker.title}">
              <span>${marker.title}</span>
            </div>
            <div class="marker-remove-button">
              X
            </div>
          </div>
      `;
    markersListEl.appendChild(markerEl);
    markerEl.addEventListener('click', e => {
      if (e.target.classList.contains('marker-remove-button')) {
        const markerItem = e.target.closest('.marker-item');
        const id = markerItem.dataset.id;
        const index = markers.findIndex(marker => marker.url === id);
        markers.splice(index, 1);
        chrome.storage.sync.set({ markers });
        renderMarkers();
      }
      else {
        chrome.tabs.create({ url: marker.url });
      }
    });

  });



}


