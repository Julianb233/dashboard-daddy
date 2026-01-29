import { signIn, signInWithGitHub } from '../actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-wizard-dark">
      <div className="absolute inset-0 bg-gradient-gold opacity-50"></div>
      <div className="max-w-md w-full space-y-8 p-8 bg-wizard-emerald rounded-xl shadow-2xl border border-wizard-gold/20 relative z-10">
        <div>
          <div className="text-center text-5xl mb-4">🫡</div>
          <h2 className="text-center text-3xl font-bold text-wizard-cream">
            Bubba Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-wizard-cream/70">
            Sign in to manage your AI assistant
          </p>
        </div>

        <form action={signIn} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-wizard-gold">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-wizard-dark border border-wizard-gold/30 rounded-lg text-wizard-cream placeholder-wizard-cream/50 focus:outline-none focus:ring-2 focus:ring-wizard-gold focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-wizard-gold">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-wizard-dark border border-wizard-gold/30 rounded-lg text-wizard-cream placeholder-wizard-cream/50 focus:outline-none focus:ring-2 focus:ring-wizard-gold focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-wizard-dark bg-wizard-gold hover:bg-wizard-gold-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wizard-gold transition-all transform hover:scale-[1.02]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-wizard-gold/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-wizard-emerald text-wizard-cream/50">Or continue with</span>
            </div>
          </div>

          <form action={signInWithGitHub} className="mt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-wizard-gold/30 rounded-lg text-sm font-medium text-wizard-cream bg-wizard-dark hover:bg-wizard-medium transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-wizard-cream/50">
          Don&apos;t have an account?{' '}
          <a href="/auth/signup" className="font-medium text-wizard-gold hover:text-wizard-gold-light transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
