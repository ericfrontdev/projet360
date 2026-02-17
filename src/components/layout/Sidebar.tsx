import {
  LayoutDashboard,
  Map,
  BarChart3,
  Pin,
  Users,
  Briefcase,
  BookOpen,
  Layers,
  ListTodo,
  Settings,
  Zap,
  Puzzle,
  UserPlus,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ProjectItemProps {
  name: string;
  active?: boolean;
}

function ProjectItem({ name, active }: ProjectItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-medium text-primary-foreground">
        {name.charAt(0)}
      </span>
      <span>{name}</span>
    </button>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
            S
          </div>
          <span className="font-semibold">StoryFirst</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          <NavItem icon={<LayoutDashboard size={18} />} label="My Work" />
          <NavItem icon={<Map size={18} />} label="Roadmap" />
          <NavItem icon={<BarChart3 size={18} />} label="Reports" />
        </nav>

        <div className="mt-6 px-3">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
            Pinned
          </p>
          <p className="px-3 text-xs text-muted-foreground">No pinned items.</p>
        </div>

        <div className="mt-6 px-3">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
            Teams
          </p>
          <NavItem icon={<Briefcase size={18} />} label="All Work" active />
          <NavItem icon={<BookOpen size={18} />} label="Stories" />
          <NavItem icon={<Layers size={18} />} label="Epics" />
          <NavItem icon={<ListTodo size={18} />} label="Backlog" />
        </div>

        <div className="mt-6 px-3">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
            Projects
          </p>
          <ProjectItem name="Parent 360" active />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-4">
        <nav className="space-y-1 px-3">
          <NavItem icon={<Zap size={18} />} label="Try AI" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem icon={<Puzzle size={18} />} label="Integrations" />
          <NavItem icon={<UserPlus size={18} />} label="Invite Users" />
        </nav>
      </div>
    </aside>
  );
}
