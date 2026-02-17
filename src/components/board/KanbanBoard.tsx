import { KanbanColumn } from "./KanbanColumn";

const columns = [
  {
    id: "backlog",
    title: "Backlog",
    stories: [
      { id: "1", title: "test 3" },
      { id: "2", title: "test" },
      { id: "3", title: "test2" },
      { id: "4", title: "Créer le projet de base", subtasks: 1, completedSubtasks: 1 },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    stories: [],
  },
  {
    id: "inprogress",
    title: "In Progress",
    stories: [
      { id: "5", title: "Créer le projet de base", subtasks: 2, assignee: "E" },
      { id: "6", title: "Créer le projet de base", subtasks: 3, completedSubtasks: 1, assignee: "E" },
    ],
  },
  {
    id: "review",
    title: "In Review",
    stories: [],
  },
  {
    id: "done",
    title: "Done",
    stories: [
      { id: "7", title: "Créer le projet de base", subtasks: 3, assignee: "E" },
    ],
  },
];

export function KanbanBoard() {
  return (
    <div className="flex h-full gap-4 overflow-x-auto">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          stories={column.stories}
          count={column.stories.length}
        />
      ))}
    </div>
  );
}
