import { supabase } from '@/lib/supabase'

export interface Challenge {
  id: string
  user_id: string
  title: string
  duration: number
  start_date: string
  end_date: string
  scheduled_time: string
  habit_sequence: string[]
  declaration_text: string
  declaration_signature: string | null
  status: 'active' | 'completed' | 'failed' | 'paused'
  current_streak: number
  total_checkins: number
  emergency_uses: number
  created_at: string
  updated_at: string
}

export interface CreateChallengeData {
  title: string
  duration: number
  start_date: string
  scheduled_time: string
  habit_sequence: string[]
  declaration_text: string
  declaration_signature: string | null
  presolutions?: Array<{
    obstacle: string
    minimum_practice: string
  }>
}

export async function createChallenge(data: CreateChallengeData): Promise<Challenge> {
  console.log('📡 API: Creating challenge...')
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  // Calculate end date
  const startDate = new Date(data.start_date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + data.duration)

  const challengeData = {
    user_id: session.user.id,
    title: data.title,
    duration: data.duration,
    start_date: data.start_date,
    end_date: endDate.toISOString().split('T')[0], // Add this!
    scheduled_time: data.scheduled_time,
    habit_sequence: data.habit_sequence,
    declaration_text: data.declaration_text,
    declaration_signature: data.declaration_signature,
    status: 'active' as const,
  }

  console.log('💾 API: Challenge data:', challengeData)

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert(challengeData)
    .select()
    .single()

  if (error) {
    console.error('❌ API: Challenge insert error:', error)
    throw error
  }

  if (!challenge) {
    throw new Error('No challenge returned')
  }

  console.log('✅ API: Challenge created successfully!')

  // Insert presolutions if any
  if (data.presolutions && data.presolutions.length > 0) {
    const presolutionsToInsert = data.presolutions.map((ps) => ({
      challenge_id: challenge.id,
      obstacle: ps.obstacle,
      minimum_practice: ps.minimum_practice,
    }))

    const { error: presError } = await supabase
      .from('presolutions')
      .insert(presolutionsToInsert)

    if (presError) {
      console.error('⚠️ Presolutions insert error:', presError)
    }
  }

  return challenge as Challenge
}

export async function getActiveChallenge(): Promise<Challenge | null> {
  console.log('📡 API: Fetching active challenge...')
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('❌ API: Error fetching challenge:', error)
    throw error
  }

  console.log('✅ API: Challenge fetched:', data ? 'Found' : 'None')
  return data as Challenge | null
}
