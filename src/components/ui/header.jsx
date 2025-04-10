import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header({
  toggleSidebar,
  isMobile,
  isSidebarOpen,
  isCollapsed,
  currentPath,
}) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-divider bg-content1 px-4 py-3 md:py-3.5">
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={toggleSidebar}
        aria-label={
          isMobile
            ? isSidebarOpen
              ? "Close sidebar"
              : "Open sidebar"
            : isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
        }
        className="flex-shrink-0"
      >
        <Menu size={20} className="text-default-500" />
      </Button>
      <h2 className="text-medium font-medium text-default-700 capitalize">
        {currentPath}
      </h2>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
