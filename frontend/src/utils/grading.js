export const DEFAULT_GRADING_SCHEMES = {
  O_LEVEL: {
    id: 'scheme-o-level-default',
    name: 'O-Level Default',
    level: 'O_LEVEL',
    passMark: 50,
    bands: [
      { min: 80, max: 100, grade: 'A', points: 6, remark: 'Excellent' },
      { min: 70, max: 79.99, grade: 'B', points: 5, remark: 'Very Good' },
      { min: 60, max: 69.99, grade: 'C', points: 4, remark: 'Good' },
      { min: 50, max: 59.99, grade: 'D', points: 3, remark: 'Pass' },
      { min: 40, max: 49.99, grade: 'E', points: 2, remark: 'Below Average' },
      { min: 0, max: 39.99, grade: 'F', points: 0, remark: 'Fail' }
    ]
  },
  A_LEVEL: {
    id: 'scheme-a-level-default',
    name: 'A-Level Default',
    level: 'A_LEVEL',
    passMark: 50,
    bands: [
      { min: 80, max: 100, grade: 'A', points: 6, remark: 'Distinction' },
      { min: 70, max: 79.99, grade: 'B', points: 5, remark: 'Very Good' },
      { min: 60, max: 69.99, grade: 'C', points: 4, remark: 'Credit' },
      { min: 50, max: 59.99, grade: 'D', points: 3, remark: 'Pass' },
      { min: 40, max: 49.99, grade: 'E', points: 2, remark: 'Weak Pass' },
      { min: 0, max: 39.99, grade: 'F', points: 0, remark: 'Fail' }
    ]
  }
}

export const normalizePercentage = (rawScore, maxScore) => {
  const safeRaw = Number(rawScore)
  const safeMax = Number(maxScore)

  if (!Number.isFinite(safeRaw) || !Number.isFinite(safeMax) || safeMax <= 0) {
    return 0
  }

  const percentage = (safeRaw / safeMax) * 100
  return Number(Math.max(0, Math.min(percentage, 100)).toFixed(2))
}

export const getDefaultGradingScheme = (level = 'O_LEVEL') => {
  return DEFAULT_GRADING_SCHEMES[level] || DEFAULT_GRADING_SCHEMES.O_LEVEL
}

export const calculateGrade = ({ rawScore, maxScore, gradingScheme }) => {
  const scheme = gradingScheme || getDefaultGradingScheme()
  const percentage = normalizePercentage(rawScore, maxScore)
  const band = scheme.bands.find((item) => percentage >= item.min && percentage <= item.max) || scheme.bands[scheme.bands.length - 1]

  return {
    rawScore: Number(rawScore || 0),
    maxScore: Number(maxScore || 0),
    percentage,
    grade: band.grade,
    points: band.points,
    remark: band.remark,
    passed: percentage >= (scheme.passMark || 50)
  }
}

export const getGradeBadgeClasses = (grade) => {
  if (grade === 'A') return 'bg-green-100 text-green-800'
  if (grade === 'B') return 'bg-blue-100 text-blue-800'
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800'
  if (grade === 'D' || grade === 'E') return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export const summarizeGrades = (results = []) => {
  if (!results.length) {
    return {
      averagePercentage: 0,
      passRate: 0,
      highestScore: 0,
      lowestScore: 0
    }
  }

  const percentages = results.map((result) => Number(result.percentage || 0))
  const passed = results.filter((result) => result.passed).length

  return {
    averagePercentage: Number((percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(2)),
    passRate: Number(((passed / results.length) * 100).toFixed(2)),
    highestScore: Math.max(...percentages),
    lowestScore: Math.min(...percentages)
  }
}