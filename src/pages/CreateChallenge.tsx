import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createChallenge } from '@/lib/api/challenges'

export default function CreateChallenge() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState<30 | 55 | 66 | 90>(66)
  const [startDate, setStartDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('05:00')
  const [habits, setHabits] = useState([''])
  const [declarationText, setDeclarationText] = useState('')
  const [presolutions, setPresolutions] = useState([{ obstacle: '', minimum_practice: '' }])

  const addHabit = () => setHabits([...habits, ''])
  const updateHabit = (index: number, value: string) => {
    const newHabits = [...habits]
    newHabits[index] = value
    setHabits(newHabits)
  }
  const removeHabit = (index: number) => {
    if (habits.length > 1) {
      setHabits(habits.filter((_, i) => i !== index))
    }
  }

  const addPresolution = () => setPresolutions([...presolutions, { obstacle: '', minimum_practice: '' }])
  const updatePresolution = (index: number, field: 'obstacle' | 'minimum_practice', value: string) => {
    const newPresolutions = [...presolutions]
    newPresolutions[index][field] = value
    setPresolutions(newPresolutions)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const filteredHabits = habits.filter(h => h.trim())
      const filteredPresolutions = presolutions.filter(p => p.obstacle && p.minimum_practice)

      await createChallenge({
        title,
        duration,
        start_date: startDate,
        scheduled_time: scheduledTime,
        habit_sequence: filteredHabits,
        declaration_text: declarationText,
        declaration_signature: null,
        presolutions: filteredPresolutions.length > 0 ? filteredPresolutions : undefined,
      })

      navigate('/dashboard')
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert(String(error))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-5xl mb-3">🔥</div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase mb-2">CREATE CHALLENGE</h1>
          <p className="text-xs sm:text-sm font-black uppercase text-gray-600">
            STEP {step} OF 4
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6 sm:mb-8">
          <div className="h-4 sm:h-5 bg-[#F5F5F5] border-3 border-black">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white border-4 border-black p-5 sm:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black uppercase mb-2 text-black">CHALLENGE NAME</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="MY UNBREAKABLE CHALLENGE"
                  className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500] uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-3 text-black">DURATION</label>
                <div className="grid grid-cols-2 gap-3">
                  {([30, 55, 66, 90] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-3 sm:py-4 font-black text-base sm:text-lg uppercase border-3 transition-all ${
                        duration === d
                          ? 'bg-[#FF4500] text-black border-black'
                          : 'bg-[#F5F5F5] text-black border-black hover:bg-[#E8E8E8]'
                      }`}
                    >
                      {d} DAYS
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2 text-black">START DATE</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500]"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-3 text-black">DAILY TIME</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {[
                    { time: '05:00', label: 'EARLY' },
                    { time: '18:00', label: 'EVENING' },
                    { time: '21:00', label: 'NIGHT' },
                  ].map(({ time, label }) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setScheduledTime(time)}
                      className={`py-3 border-3 transition-all ${
                        scheduledTime === time
                          ? 'bg-black text-white border-black'
                          : 'bg-[#F5F5F5] border-black hover:bg-[#E8E8E8]'
                      }`}
                    >
                      <div className="font-black text-sm">{time}</div>
                      <div className="text-xs font-bold mt-0.5">{label}</div>
                    </button>
                  ))}
                </div>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500]"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase mb-3 text-black">YOUR HABITS</label>
              {habits.map((habit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={habit}
                    onChange={(e) => updateHabit(index, e.target.value)}
                    placeholder={`HABIT ${index + 1}`}
                    className="flex-1 px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500] uppercase"
                  />
                  {habits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHabit(index)}
                      className="px-4 bg-[#DC143C] text-white border-3 border-black font-black hover:translate-x-1 transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHabit}
                className="w-full py-3 border-3 border-dashed border-black font-black text-sm uppercase hover:bg-[#F5F5F5] transition-colors text-black"
              >
                + ADD HABIT
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase mb-2 text-black">YOUR DECLARATION</label>
              <textarea
                value={declarationText}
                onChange={(e) => setDeclarationText(e.target.value)}
                placeholder="I COMMIT TO..."
                rows={6}
                className="w-full px-4 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500] resize-none uppercase"
              />
              <p className="text-xs font-bold uppercase text-gray-600">
                THIS IS YOUR VOW. MAKE IT POWERFUL.
              </p>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase mb-2 text-black">OBSTACLES</label>
              {presolutions.map((ps, index) => (
                <div key={index} className="space-y-3 p-4 border-3 border-black bg-[#F5F5F5]">
                  <input
                    type="text"
                    value={ps.obstacle}
                    onChange={(e) => updatePresolution(index, 'obstacle', e.target.value)}
                    placeholder="OBSTACLE"
                    className="w-full px-4 py-2 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500] uppercase"
                  />
                  <input
                    type="text"
                    value={ps.minimum_practice}
                    onChange={(e) => updatePresolution(index, 'minimum_practice', e.target.value)}
                    placeholder="BACKUP PLAN"
                    className="w-full px-4 py-2 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-[#FF4500] uppercase"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addPresolution}
                className="w-full py-3 border-3 border-dashed border-black font-black text-sm uppercase hover:bg-[#F5F5F5] transition-colors text-black"
              >
                + ADD OBSTACLE
              </button>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 sm:py-4 bg-[#F5F5F5] text-black font-black text-sm sm:text-base uppercase border-3 border-black hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                ← BACK
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!title || !startDate}
                className="flex-1 py-3 sm:py-4 bg-black text-white font-black text-sm sm:text-base uppercase border-3 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 sm:py-4 bg-[#FF4500] text-black font-black text-sm sm:text-base uppercase border-3 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? 'CREATING...' : 'CREATE 🔥'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
