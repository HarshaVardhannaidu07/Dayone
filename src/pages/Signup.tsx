import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

      try {
      await signUp(email, password, username)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create account')
      } else {
        setError(String(err) || 'Failed to create account')
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
          <h1 className="text-3xl sm:text-4xl font-black uppercase mb-2">DAYONE</h1>
          <p className="text-sm sm:text-base font-black uppercase text-gray-600">
            BEGIN YOUR JOURNEY
          </p>
        </div>

        <div className="bg-white border-4 border-black p-6">
          <h2 className="text-2xl font-black uppercase mb-6 text-center text-black">CREATE ACCOUNT</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#DC143C] border-3 border-black p-3">
                <p className="text-white font-black uppercase text-xs">⚠️ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-black">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500]"
                placeholder="warrior"
                required
              />
            </div>

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
              className="w-full py-4 bg-[#FF4500] text-black font-black text-base uppercase border-3 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'START GRINDING →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase text-gray-600">
              ALREADY GRINDING?{' '}
              <Link to="/login" className="text-black font-black underline hover:text-[#FF4500]">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
