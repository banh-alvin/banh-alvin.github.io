export async function Todo() {
  return {
    data() {
      return {
        todos: [],
        newTodo: "",
        editingIndex: -1,
        editValue: "",
      };
    },
    mounted() {
      this.loadTodos();
    },
    methods: {
      addTodo() {
        if (!this.newTodo.trim()) return;

        this.todos.push({
          id: Date.now(),
          text: this.newTodo,
          completed: false,
        });

        this.newTodo = "";
        this.saveTodos();
      },

      toggleComplete(index) {
        this.todos[index].completed = !this.todos[index].completed;
        this.saveTodos();
      },

      startEdit(index) {
        this.editingIndex = index;
        this.editValue = this.todos[index].text;
      },

      saveEdit() {
        if (this.editingIndex !== -1) {
          this.todos[this.editingIndex].text = this.editValue;
          this.editingIndex = -1;
          this.saveTodos();
        }
      },

      cancelEdit() {
        this.editingIndex = -1;
      },

      deleteTodo(index) {
        this.todos.splice(index, 1);
        this.saveTodos();
      },

      saveTodos() {
        localStorage.setItem("todos", JSON.stringify(this.todos));
      },

      loadTodos() {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
          this.todos = JSON.parse(savedTodos);
        }
      },
    },
    template: await fetch("./todo.html").then((r) => r.text()),
  };
}
