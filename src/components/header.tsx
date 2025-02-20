import { NavUser } from "./nav-user"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-medium">Dashboard</div>
        <NavUser user={{
          name: "User Name",
          email: "user@example.com",
          avatar: ""
        }} />
      </div>
    </header>
  );
} 