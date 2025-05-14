"use client";

import { HTMLAttributes, ReactNode } from "react";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BookOpen, Menu, Users, X } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/ecole_peg/eleves/",
      icon: Users,
      title: "Eleves",
    },
    {
      href: "/ecole_peg/enseignants/",
      icon: Users,
      title: "Enseignants",
    },
    {
      href: "/ecole_peg/cours/",
      icon: BookOpen,
      title: "Cours",
    },
    {
      href: "/ecole_peg/sessions/",
      icon: BookOpen,
      title: "Sessions et séances",
    },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <div className="text-xl font-bold text-primary">École PEG</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-1 p-4">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname.startsWith(route.href) ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                pathname.startsWith(route.href) && "bg-secondary"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-5 w-5" />
                {route.title}
              </Link>
            </Button>
          ))}
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">
                  admin@ecole-peg.ch
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 lg:p-6 lg:pl-80">{children}</main>
      </div>
    </div>
  );
}
