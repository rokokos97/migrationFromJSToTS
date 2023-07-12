// створю тип для ID так як він може бути і рядком і числом
type ID = number | string
// створюю два очевидні інтерфейси для Користувача і Задач
interface ITodo {
  userId: ID
  id: ID
  title: string
  completed: boolean
}
interface IUser {
  id: ID
  name: string
  username?: string
  email?: string
  address?: {
    street: string
    suit: string
    city: string
    zipcode: string
    geo: {
      lat: string
      lng: string
    }
  }
  phone?: string
  website?:string
  company?: {
    name: string
    catchPhrase: string
    bs: string
  }
}

(function() {
  // Globals
  const todoList = document.getElementById('todo-list');
  const userSelect = document.getElementById('user-todo');
  const form = document.querySelector('form');
  let todos:ITodo[] = [];
  let users:IUser[] = [];

  // Attach Events
  document.addEventListener('DOMContentLoaded', initApp);
  // додаємо перевірку чи є форма взагалі перед тим я повісити на неї подію
  form?.addEventListener('submit', handleSubmit);

  // Basic Logic
  function getUserName(userId:ID) {
    const user = users.find((u) => u.id === userId);
    // через те що теоретично користувача може не бути то додаю перевірку і додатково повернемо порожній рядок в разі якщо User не виявиться
    return user?.name || "";
  }
  function printTodo({ id, userId, title, completed }:ITodo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    // оскільки ID може бути числом або рядком потрібно явно вказати що тут ID буде рядком
    li.dataset.id = String(id);
    li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(
      userId
    )}</b></span>`;

    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handleTodoChange);

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';
    close.addEventListener('click', handleClose);

    li.prepend(status);
    li.append(close);
    // додаємо перевірку на наявність Задач
    todoList?.prepend(li);
  }

  function createUserOption(user: IUser) {
    // весь блок огортаємо в перевірку чи існує userSelect
    if (userSelect){
      const option = document.createElement('option');
      // знову явно перетворюємо user.id на рядок як вимагається
      option.value = String(user.id);
      option.innerText = user.name;
  
      userSelect.append(option);
    }
  }

  function removeTodo(todoId: ID) {
    // перевіряємо наявність todos. Весь блок огортаємо в if
    if(todos){
      todos = todos.filter((todo:ITodo) => todo.id !== todoId);
  
      const todo = todoList?.querySelector(`[data-id="${todoId}"]`);
      if(todo){
        todo.querySelector('input')?.removeEventListener('change', handleTodoChange);
        todo.querySelector('.close')?.removeEventListener('click', handleClose);
    
        todo.remove();

      }

    }
  }

  function alertError(error: Error) {
    alert(error.message);
  }

  // Event Logic
  function initApp() {
    Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
      [todos, users] = values;

      // Отправить в разметку
      todos.forEach((todo) => printTodo(todo));
      users.forEach((user) => createUserOption(user));
    });
  }
  function handleSubmit(event: Event) {
    event.preventDefault();
    // перевіряємо наявність  form огортаючи блок в if
    if(form){
      createTodo({
        userId: Number(form.user.value),
        title: form.todo.value,
        completed: false,
      });
    }
  }
  // явно вказуємо this
  function handleTodoChange(this:HTMLInputElement) {
    const parent = this.parentElement
    if(parent){
      const todoId = this.parentElement?.dataset.id;
      const completed = this.checked;
      // тут все одно треба додати додаткову перевірку todoId
      todoId && toggleTodoComplete(todoId, completed);

    }
  }
  function handleClose(this: HTMLSpanElement) {
    // повторюємо попередній випадок з додатковою перевіркою на наявність спан елементу
    const parant = this.parentElement
    
    if(parant){
      const todoId = this.parentElement?.dataset.id;
      todoId && deleteTodo(todoId);
    }
  }

  // Async logic
  // доаємо типізацію для результата викоанання функції. Функція getAllTodos має повернути проміс з массивом todo
  async function getAllTodos():Promise<ITodo[]> {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos?_limit=15'
      );
      const data = await response.json();

      return data;
    } catch (error) {
// перевіряємо чи є error інстасем глобального обєкта Error
      if(error instanceof Error)
        alertError(error);
    }
    // аби позбавитись помилки в разі її винекнення повернемо порожній массив
    return []
  }
// доаємо типізацію для результата викоанання функції. Функція getAllUsers має повернути проміс з массивом users
  async function getAllUsers():Promise<IUser[]> {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/users?_limit=5'
      );
      const data = await response.json();

      return data;
    } catch (error) {
// перевіряємо чи є error інстасем глобального обєкта Error
      if(error instanceof Error)
        alertError(error);
    }
    // аби позбавитись помилки в разі її винекнення повернемо порожній массив
    return []
  }
  // Так як до створення ми не маємо інфо про id просто виключимо його з інтерфейсу ITodo
  async function createTodo(todo:Omit<ITodo, 'id'>) {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos',
        {
          method: 'POST',
          body: JSON.stringify(todo),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const newTodo = await response.json();

      printTodo(newTodo);
    } catch (error) {
// перевіряємо чи є error інстасем глобального обєкта Error
      if(error instanceof Error)
        alertError(error);
    }
  }

  async function toggleTodoComplete(todoId:ID, completed:boolean) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ completed }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to connect with the server! Please try later.');
      }
    } catch (error) {
// перевіряємо чи є error інстасем глобального обєкта Error
      if(error instanceof Error)
        alertError(error);
    }
  }

  async function deleteTodo(todoId:ID) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        removeTodo(todoId);
      } else {
        throw new Error('Failed to connect with the server! Please try later.');
      }
    } catch (error) {
      if(error instanceof Error)
      // перевіряємо чи є error інстасем глобального обєкта Error
        alertError(error);
    }
  }
})()
