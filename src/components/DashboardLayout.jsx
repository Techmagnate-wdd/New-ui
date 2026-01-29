export function DashboardLayout({ children }) {
  return (
      <div className="min-h-screen flex w-full">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --sidebar-background: #4f6d86;
              --sidebar-foreground: #ffffff;
              --sidebar-primary: #ffffff;
              --sidebar-primary-foreground: #4f6d86;
              --sidebar-accent: rgba(255, 255, 255, 0.1);
              --sidebar-accent-foreground: #ffffff;
              --sidebar-border: rgba(255, 255, 255, 0.1);
            }
          `,
          }}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
  );
}
