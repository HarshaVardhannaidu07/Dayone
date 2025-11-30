import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getActiveChallenge, Challenge } from '@/lib/api/challenges'
import { getTodayCheckIn, updateCheckIn, useEmergencyProtocol, getChallengeCheckIns } from '@/lib/api/checkins'

export default function Dashboard() {
  const {profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedHabits, setCompletedHabits] = useState<string[]>([])
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')
  const [todayCheckedIn, setTodayCheckedIn] = useState(false)
  const [isEmergencyDay, setIsEmergencyDay] = useState(false)
  const [totalCompletedDays, setTotalCompletedDays] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const challenge = await getActiveChallenge()
      setActiveChallenge(challenge)
      
      if (challenge) {
        // Get all check-ins to calculate accurate progress
        const allCheckIns = await getChallengeCheckIns(challenge.id)
        const completedCount = allCheckIns.filter(c => c.is_complete).length
        setTotalCompletedDays(completedCount)
        
        // Get today's check-in
        const todayCheckIn = await getTodayCheckIn(challenge.id)
        if (todayCheckIn) {
          setCompletedHabits(todayCheckIn.completed_habits)
          setTodayCheckedIn(todayCheckIn.is_complete)
          setIsEmergencyDay(todayCheckIn.is_emergency)
        } else {
          // Reset for new day
          setCompletedHabits([])
          setTodayCheckedIn(false)
          setIsEmergencyDay(false)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleHabit = (habit: string) => {
    // Can't toggle if already checked in
    if (todayCheckedIn) return
    
    if (completedHabits.includes(habit)) {
      setCompletedHabits(completedHabits.filter(h => h !== habit))
    } else {
      setCompletedHabits([...completedHabits, habit])
    }
  }

  const handleCompleteCheckIn = async () => {
    if (!activeChallenge) return
    
    const allHabitsComplete = completedHabits.length === activeChallenge.habit_sequence.length
    
    if (!allHabitsComplete) {
      alert('Complete all habits before checking in!')
      return
    }

    setCheckInLoading(true)
    try {
      await updateCheckIn(activeChallenge.id, activeChallenge.habit_sequence, completedHabits)
      setTodayCheckedIn(true)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
      
      // Reload to get updated streak and stats
      await loadData()
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred.')
      }
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleEmergency = async () => {
    if (!activeChallenge) return
    if (!emergencyReason.trim()) {
      alert('Please provide a reason for emergency use')
      return
    }

    try {
      const result = await useEmergencyProtocol(activeChallenge.id, emergencyReason)
      
      if (result.success) {
        alert(`${result.message}\n${result.remaining} emergencies remaining.`)
        setShowEmergency(false)
        setEmergencyReason('')
        await loadData()
      } else {
        alert(`Emergency failed: ${result.error}`)
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(`Error: ${error.message}`)
    }
  }

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, diffDays)
  }

  const calculateProgress = () => {
    if (!activeChallenge) return 0
    // Progress based on ACTUAL completed days, not elapsed time
    return Math.min((totalCompletedDays / activeChallenge.duration) * 100, 100)
  }

  const calculateDaysLeft = () => {
    if (!activeChallenge) return 0
    return Math.max(0, activeChallenge.duration - totalCompletedDays)
  }

  const isChallengeComplete = () => {
    return activeChallenge && totalCompletedDays >= activeChallenge.duration
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">🔥</div>
          <div className="text-xl sm:text-2xl font-black uppercase">LOADING...</div>
        </div>
      </div>
    )
  }

  const allHabitsComplete = activeChallenge && completedHabits.length === activeChallenge.habit_sequence.length

  return (
    <div className="min-h-screen bg-white">
    {/* REAL CONFETTI CELEBRATION */}
      {showSuccess && (
        <>
          {/* Confetti particles */}
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => {
              const colors = ['#FF4500', '#FFD700', '#10B981', '#FF1493', '#00BFFF']
              const left = Math.random() * 100
              const delay = Math.random() * 0.5
              const duration = 3 + Math.random() * 2
              
              return (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${left}%`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              )
            })}
          </div>
          
          {/* Success modal */}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#10B981] border-6 border-black p-8 sm:p-12 text-center max-w-md">
              <div className="text-6xl sm:text-8xl mb-4 confetti-shake">🎉</div>
              <div className="text-3xl sm:text-4xl font-black uppercase text-black mb-3">
                DAY COMPLETE!
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black mb-2">
                STREAK: {activeChallenge?.current_streak} DAYS! 🔥
              </div>
              <div className="text-base sm:text-lg font-bold text-black">
                {totalCompletedDays} / {activeChallenge?.duration} COMPLETE
              </div>
              <div className="mt-6 text-sm font-bold text-black opacity-75">
                Keep grinding, warrior! 💪
              </div>
            </div>
          </div>
        </>
      )}

      {/* EMERGENCY MODAL */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full">
            <h3 className="text-2xl font-black uppercase mb-4 text-black">EMERGENCY PROTOCOL</h3>
            <p className="text-sm font-bold mb-4 text-black">
              Use 1 of {3 - (activeChallenge?.emergency_uses || 0)} remaining emergency breaks.
            </p>
            <textarea
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              placeholder="WHY DO YOU NEED THIS EMERGENCY?"
              rows={4}
              className="w-full px-4 py-3 border-3 border-black font-bold text-sm mb-4 uppercase"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergency(false)}
                className="flex-1 py-3 bg-[#F5F5F5] border-3 border-black font-black uppercase text-sm"
              >
                CANCEL
              </button>
              <button
                onClick={handleEmergency}
                className="flex-1 py-3 bg-[#DC143C] text-white border-3 border-black font-black uppercase text-sm"
              >
                USE EMERGENCY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-black text-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🔥</span>
              <h1 className="text-lg sm:text-xl font-black uppercase">DAYONE</h1>
              {profile && (
                <span className="hidden sm:inline-block px-2 py-1 bg-[#FF4500] text-black font-black uppercase text-xs border-2 border-white">
                  {profile.tier}
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black font-black uppercase text-xs border-2 border-white hover:bg-[#F5F5F5] transition-all"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        {!activeChallenge ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-5xl sm:text-6xl mb-3">🎯</div>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase">
                WELCOME, {profile?.username}
              </h2>
              <p className="text-sm sm:text-base font-bold text-red-950 uppercase px-4">
                BUILD CONSISTENCY THAT MAKES OTHERS UNCOMFORTABLE
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-3xl sm:text-4xl font-black text-black mb-1">{profile?.current_streak || 0}</div>
                <div className="text-xs font-black uppercase text-black">CURRENT STREAK</div>
              </div>

              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-3xl sm:text-4xl font-black text-black mb-1">{profile?.longest_streak || 0}</div>
                <div className="text-xs font-black uppercase text-black">BEST STREAK</div>
              </div>

              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-3xl sm:text-4xl font-black text-black mb-1">{profile?.total_completed_challenges || 0}</div>
                <div className="text-xs font-black uppercase text-black">DONE</div>
              </div>
            </div>

            <div className="text-center px-4">
              <button
                onClick={() => navigate('/challenge/create')}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-[#FF4500] text-black font-black text-base sm:text-xl uppercase border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                START CHALLENGE →
              </button>
            </div>
          </div>
        ) : isChallengeComplete() ? (
          // CHALLENGE COMPLETED STATE
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-4xl font-black uppercase text-black">CHALLENGE COMPLETED!</h2>
            <p className="text-xl font-bold text-black">
              You completed {activeChallenge.duration} days. Legendary!
            </p>
            <button
              onClick={() => navigate('/challenge/create')}
              className="px-12 py-5 bg-[#FF4500] text-black font-black text-xl uppercase border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              START NEW CHALLENGE →
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Rest of the active challenge UI... continues below */}
{/* CHALLENGE CARD */}
            <div className="bg-[#FF4500] border-4 border-black p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="text-xs font-black uppercase mb-1 text-black">ACTIVE CHALLENGE</div>
                  <h2 className="text-xl sm:text-3xl font-black uppercase mb-1 break-words text-black">{activeChallenge.title}</h2>
                  <div className="text-base sm:text-lg font-black text-black">
                    DAY {calculateDaysElapsed(activeChallenge.start_date)} / {activeChallenge.duration}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl sm:text-5xl font-black mb-1 text-black">{activeChallenge.current_streak}</div>
                  <div className="text-xs sm:text-sm font-black uppercase whitespace-nowrap text-black">DAY STREAK 🔥</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm font-black uppercase text-black">
                  <span>PROGRESS</span>
                  <span>{Math.round(calculateProgress())}%</span>
                </div>
                <div className="h-5 sm:h-6 bg-white border-3 border-black">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="text-xs font-bold text-black text-right">
                  {totalCompletedDays} of {activeChallenge.duration} days complete
                </div>
              </div>
            </div>
          {/* CHALLENGE DETAILS (COLLAPSIBLE) */}
            {activeChallenge && (
              <details className="bg-white border-4 border-black">
                <summary className="p-4 cursor-pointer font-black uppercase text-black hover:bg-[#F5F5F5] transition-colors flex justify-between items-center">
                  <span>📋 CHALLENGE DETAILS</span>
                  <span className="text-xs">CLICK TO EXPAND</span>
                </summary>
                
                <div className="p-4 sm:p-6 border-t-4 border-black space-y-6">
                  {/* Declaration */}
                  {activeChallenge.declaration_text && (
                    <div>
                      <h4 className="text-sm font-black uppercase mb-2 text-black flex items-center gap-2">
                        <span>📜</span> YOUR DECLARATION
                      </h4>
                      <div className="bg-[#FFF8DC] border-3 border-black p-4 text-sm font-bold text-black italic">
                        "{activeChallenge.declaration_text}"
                      </div>
                    </div>
                  )}
                  
                  {/* Scheduled Time */}
                  <div>
                    <h4 className="text-sm font-black uppercase mb-2 text-black flex items-center gap-2">
                      <span>⏰</span> DAILY GRIND TIME
                    </h4>
                    <div className="bg-[#F5F5F5] border-3 border-black p-3 text-base font-black text-black">
                      {activeChallenge.scheduled_time}
                    </div>
                  </div>
                  
            
                  
                  {/* Habit List */}
                  <div>
                    <h4 className="text-sm font-black uppercase mb-3 text-black flex items-center gap-2">
                      <span>✅</span> DAILY HABITS
                    </h4>
                    <div className="space-y-2">
                      {activeChallenge.habit_sequence.map((habit: string, index: number) => (
                        <div key={index} className="bg-[#F5F5F5] border-2 border-black p-2 text-sm font-bold text-black">
                          {index + 1}. {habit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            )}
            {/* TODAY'S STATUS */}
            {todayCheckedIn ? (
              <div className="bg-[#10B981] border-4 border-black p-6 text-center">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-2xl font-black uppercase text-black mb-2">
                  {isEmergencyDay ? 'EMERGENCY USED TODAY' : 'TODAY COMPLETE!'}
                </h3>
                <p className="text-sm font-bold text-black">
                  {isEmergencyDay 
                    ? 'Emergency protocol activated. Streak preserved.' 
                    : 'All habits completed. Great work!'}
                </p>
                <p className="text-xs font-bold text-black mt-2">
                  Come back tomorrow to continue your grind 🔥
                </p>
              </div>
            ) : (
              /* TODAY'S GRIND */
              <div className="bg-white border-4 border-black p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl">✅</span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-black">TODAY'S GRIND</h3>
                </div>

                <div className="space-y-3 mb-4 sm:mb-6">
                  {activeChallenge.habit_sequence.map((habit, index) => {
                    const isComplete = completedHabits.includes(habit)
                    return (
                      <div
                        key={index}
                        onClick={() => toggleHabit(habit)}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-3 border-black cursor-pointer transition-all ${
                          isComplete
                            ? 'bg-[#10B981] hover:bg-[#059669]'
                            : 'bg-[#F5F5F5] hover:bg-[#E8E8E8]'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl flex-shrink-0 text-black">
                          {isComplete ? '☑' : '☐'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm sm:text-base font-black uppercase break-words text-black ${isComplete ? 'line-through' : ''}`}>
                            {index + 1}. {habit}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button 
                  onClick={handleCompleteCheckIn}
                  disabled={!allHabitsComplete || checkInLoading}
                  className={`w-full py-4 sm:py-5 font-black text-base sm:text-xl uppercase border-4 border-black transition-all ${
                    allHabitsComplete
                      ? 'bg-[#10B981] text-black hover:translate-x-1 hover:translate-y-1'
                      : 'bg-[#F5F5F5] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {checkInLoading ? 'SAVING...' : allHabitsComplete ? 'COMPLETE CHECK-IN →' : 'COMPLETE ALL HABITS FIRST'}
                </button>

                <button
                  onClick={() => setShowEmergency(true)}
                  disabled={activeChallenge.emergency_uses >= 3}
                  className={`w-full mt-3 py-3 font-black text-sm uppercase border-3 border-black transition-all ${
                    activeChallenge.emergency_uses >= 3
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#DC143C] text-white hover:translate-x-1 hover:translate-y-1'
                  }`}
                >
                  {activeChallenge.emergency_uses >= 3 ? '❌ NO EMERGENCIES LEFT' : '🚨 EMERGENCY PROTOCOL'}
                </button>
              </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black mb-1 text-black">{totalCompletedDays}</div>
                <div className="text-xs font-black uppercase text-black">PERFECT DAYS</div>
              </div>

              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black mb-1 text-black">
                  {calculateDaysLeft()}
                </div>
                <div className="text-xs font-black uppercase text-black">DAYS LEFT</div>
              </div>

              <div className="bg-[#F5F5F5] border-3 border-black p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black mb-1 text-black">{3 - activeChallenge.emergency_uses}</div>
                <div className="text-xs font-black uppercase text-black">EMERGENCY</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}