"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button, ScrollShadow, Tooltip } from "@heroui/react";
import { useAuth } from "@/components/auth/auth-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import RequireAuth from "@/components/auth/require-auth";
import { adminItems } from "@/components/ui/sidebar-items";
import { Menu, HelpCircle, LogOut, X } from "lucide-react";
import { Image } from "@heroui/react";

export default function ResponsiveLayout({ children }) {
  // Use media query for initial state on client
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar starts closed
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop sidebar state
  const [isMobile, setIsMobile] = useState(true); // Assume mobile by default until client-side check
  const { signOut } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  // Extract current section from pathname
  const currentPath = pathname.split("/")?.[2] || "dashboard";

  // Handle window resize and initial setup
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // On desktop, show sidebar expanded by default
      if (!mobile) {
        setIsSidebarOpen(true);
        setIsCollapsed(false);
      } else {
        // On mobile, hide sidebar
        setIsSidebarOpen(false);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  // Toggle sidebar on mobile
  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle sidebar collapse state on desktop
  const toggleDesktopSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle clicks outside sidebar on mobile to close it
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar based on device
  const toggleSidebar = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  return (
    <RequireAuth>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Backdrop overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/50 z-20"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Hidden on mobile when closed */}
        {(isSidebarOpen || !isMobile) && (
          <aside
            ref={sidebarRef}
            className={`${
              isMobile ? "fixed" : "relative"
            } z-30 h-full flex-shrink-0 border-r border-divider bg-content1 transition-all duration-300 ease-in-out ${
              isMobile
                ? "w-[280px]" // Mobile sidebar is always expanded when visible
                : isCollapsed
                  ? "w-16" // Desktop collapsed state
                  : "w-[300px]" // Desktop expanded state
            }`}
            style={{ overflowX: "hidden" }}
          >
            <div
              className={`flex flex-col h-full p-3 md:p-4 ${
                isMobile
                  ? "w-[280px]" // Mobile sidebar width
                  : isCollapsed
                    ? "w-16" // Desktop collapsed width
                    : "w-[300px]" // Desktop expanded width
              }`}
            >
              {/* Logo and Close Button */}
              <div
                className={`flex items-center justify-between gap-2 mb-6 py-2 ${
                  isCollapsed && !isMobile ? "justify-center" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isCollapsed && !isMobile ? "justify-center" : ""
                  }`}
                >
                  <div className="flex items-center justify-center rounded-full">
                    {/* <Image src="./" alt="Logo" width={42} /> */}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span className="text-sm font-bold uppercase whitespace-nowrap tracking-wide">
                      Gold Galleria Portal
                    </span>
                  )}
                </div>

                {/* Close button - Only visible on mobile */}
                {isMobile && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsSidebarOpen(false)}
                    className="ml-auto flex-shrink-0"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <ScrollShadow className="flex-grow px-1" hideScrollBar>
                <Sidebar
                  defaultSelectedKey={currentPath}
                  items={adminItems}
                  collapsed={isCollapsed && !isMobile}
                  className={isCollapsed && !isMobile ? "py-2" : "gap-y-6"}
                />
              </ScrollShadow>

              {/* Bottom actions */}
              <div
                className={`mt-auto flex flex-col gap-2 pt-4 border-t border-divider ${
                  isCollapsed && !isMobile ? "items-center" : ""
                }`}
              >
                {isCollapsed && !isMobile ? (
                  <>
                    {/* <Tooltip content="Help & Support" placement="right">
                      <Button
                        isIconOnly
                        className="justify-center mb-3"
                        variant="light"
                      >
                        <HelpCircle size={20} className="text-default-500" />
                      </Button>
                    </Tooltip> */}

                    <Tooltip content="Log Out" placement="right">
                      <Button
                        isIconOnly
                        className="justify-center"
                        variant="light"
                        onPress={handleSignOut}
                      >
                        <LogOut size={20} className="text-default-500" />
                      </Button>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    {/* <Button
                      fullWidth
                      className="justify-start text-default-500 data-[hover=true]:text-foreground h-10"
                      startContent={
                        <HelpCircle
                          size={20}
                          className="text-default-500 flex-shrink-0"
                        />
                      }
                      variant="light"
                    >
                      <span className="truncate">Help & Support</span>
                    </Button> */}

                    <Button
                      fullWidth
                      className="justify-start text-default-500 data-[hover=true]:text-foreground h-10"
                      startContent={
                        <LogOut
                          size={20}
                          className="text-default-500 flex-shrink-0"
                        />
                      }
                      variant="light"
                      onPress={handleSignOut}
                    >
                      <span className="truncate">Log Out</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-grow h-full w-full overflow-auto">
          {/* Header */}
          <Header
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            isCollapsed={isCollapsed}
            currentPath={currentPath}
          />
          {/* Page content */}
          <main className="flex-grow overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
