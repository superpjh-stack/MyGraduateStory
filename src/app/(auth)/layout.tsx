export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-50 via-background to-moss-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-forest-700">MyGraduate</h1>
          <p className="text-sm text-muted-foreground mt-1 font-serif">
            AI 대학원 1년의 여정을 담다
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
