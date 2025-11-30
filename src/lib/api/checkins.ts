import { supabase } from '@/lib/supabase'

export interface CheckIn {
  id: string
  challenge_id: string
  user_id: string
  check_in_date: string
  completed_habits: string[]
  total_habits: number
  is_complete: boolean
  is_emergency: boolean
  emergency_reason: string | null
  notes: string | null
  created_at: string
}

// Get today's check-in
export async function getTodayCheckIn(challengeId: string): Promise<CheckIn | null> {
  // Use local date (not UTC) to avoid timezone issues
  const today = new Date()
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('check_in_date', localDate)
    .maybeSingle()

  if (error) throw error
  return data as CheckIn | null
}

// Get all check-ins for a challenge
export async function getChallengeCheckIns(challengeId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('check_in_date', { ascending: true })

  if (error) throw error
  return data as CheckIn[]
}

// Create or update check-in
export async function updateCheckIn(
  challengeId: string,
  habitSequence: string[],
  completedHabits: string[]
): Promise<CheckIn> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const today = new Date()
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isComplete = completedHabits.length === habitSequence.length

  const checkInData = {
    challenge_id: challengeId,
    user_id: session.user.id,
    check_in_date: localDate,
    completed_habits: completedHabits,
    total_habits: habitSequence.length,
    is_complete: isComplete,
    is_emergency: false,
  }

  const { data, error } = await supabase
    .from('check_ins')
    .upsert(checkInData, {
      onConflict: 'challenge_id,check_in_date'
    })
    .select()
    .single()

  if (error) throw error
  return data as CheckIn
}

// Use emergency protocol
export async function useEmergencyProtocol(
  challengeId: string,
  reason: string
): Promise<{ success: boolean; remaining?: number; message?: string; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('use_emergency_protocol', {
    p_challenge_id: challengeId,
    p_user_id: session.user.id,
    p_reason: reason,
  })

  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  
  // Handle JSON response
  if (!data.success) {
    return {
      success: false,
      error: data.error || 'Emergency protocol failed'
    }
  }
  
  return {
    success: true,
    remaining: data.remaining_emergencies,
    message: data.message,
  }
}
