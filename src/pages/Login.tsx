import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err) || 'Failed to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase mb-2 text-black">DAYONE</h1>
          <p className="text-sm sm:text-base font-black uppercase text-gray-600">
            CONTINUE YOUR GRIND
          </p>
        </div>

        <div className="bg-white border-4 border-black p-6">
          <h2 className="text-2xl font-black uppercase mb-6 text-center text-black">SIGN IN</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#DC143C] border-3 border-black p-3">
                <p className="text-white font-black uppercase text-xs">⚠️ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-black">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500]"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-black">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-black text-base uppercase border-3 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase text-gray-600">
              NEW HERE?{' '}
              <Link to="/signup" className="text-black font-black underline hover:text-[#FF4500]">
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

