import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface QuizQuestion {
  id?: number
  question: string
  options: string[]
  correct_index: number
  explanation?: string | null
  correct_option?: string | null
  student_answer?: string | null
}

export interface Quiz {
  id: number
  batch_id: number
  title: string
  description?: string | null
  difficulty: string
  total_marks: number
  question_count: number
  mode: 'practice' | 'graded'
  status: 'draft' | 'published' | 'closed'
  open_at?: string | null
  close_at?: string | null
  created_by: number
  created_at?: string
  questions?: QuizQuestion[]
  student_submission?: {
    id: number
    quiz_id: number
    student_id: number
    submitted_at?: string | null
    score?: number | null
    status?: string | null
  } | null
  creator?: {
    id: number
    full_name: string
    email: string
    role: string
  } | null
}

export interface QuizSubmissionReport {
  quiz_id: number
  quiz_title: string
  mode: 'practice' | 'graded'
  score: number
  total_marks: number
  percentage: number
  attempted_answers: number
  correct_answers: number
  incorrect_answers: number
  attempt_number: number
  previous_attempt_score: number | null
  current_attempt_score: number
  question_feedback: Array<{
    question_id: number
    question: string
    selected_option: string | null
    correct_option: string
    is_correct: boolean
    marks_awarded: number
    max_marks: number
    explanation?: string | null
  }>
  ai_analysis?: {
    source?: 'ai_model' | 'rule_based_fallback' | string
    summary: string
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export const quizzesService = {
  generate(payload: {
    topic: string
    instructions?: string
    difficulty: string
    question_count: number
    mode: 'practice' | 'graded'
  }): Promise<ApiResponse<{ title: string; difficulty: string; questions: QuizQuestion[] }>> {
    return apiClient.post('/quizzes/ai-generate', payload)
  },

  create(payload: {
    batch_id: number
    title: string
    description?: string
    difficulty: string
    question_count: number
    mode: 'practice' | 'graded'
    questions: QuizQuestion[]
  }): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.post('/quizzes', payload)
  },

  list(batchId: number): Promise<ApiResponse<{ quizzes: Quiz[] }>> {
    return apiClient.get(`/batches/${batchId}/quizzes`)
  },

  get(quizId: number): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.get(`/quizzes/${quizId}`)
  },

  update(quizId: number, payload: Partial<Quiz>): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.put(`/quizzes/${quizId}`, payload)
  },

  updateQuestions(quizId: number, questions: QuizQuestion[]): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.put(`/quizzes/${quizId}/questions`, { questions })
  },

  publish(quizId: number): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.post(`/quizzes/${quizId}/publish`)
  },

  close(quizId: number): Promise<ApiResponse<{ quiz: Quiz }>> {
    return apiClient.post(`/quizzes/${quizId}/close`)
  },

  remove(quizId: number): Promise<ApiResponse<{}>> {
    return apiClient.delete(`/quizzes/${quizId}`)
  },

  submit(quizId: number, answers: Array<{ question_id: number; selected_option: string }>): Promise<ApiResponse<{ submission: any; report: QuizSubmissionReport }>> {
    return apiClient.post(`/quizzes/${quizId}/submit`, { answers })
  },
}
