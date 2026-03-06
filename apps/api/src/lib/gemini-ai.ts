import { createLogger } from "./logger";

const logger = createLogger("gemini-ai");

export const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const HAZARD_TYPES = [
  "fall_hazard",
  "electrical",
  "chemical",
  "fire",
  "confined_space",
  "ppe_violation",
  "structural",
  "machinery",
  "general",
  "ergonomic",
  "environmental",
  "vehicle",
  "noise",
  "biological",
] as const;

const SEVERITY_LEVELS = ["low", "medium", "high", "critical"] as const;

export interface GeminiAnalysisResult {
  hazardType: string;
  severity: string;
  description: string;
  recommendations: string[];
  detectedObjects: string[];
  confidence: number;
  relatedRegulations: string[];
  modelVersion: string;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isValidHazardType(value: unknown): value is string {
  return (
    typeof value === "string" &&
    HAZARD_TYPES.includes(value as (typeof HAZARD_TYPES)[number])
  );
}

function isValidSeverity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    SEVERITY_LEVELS.includes(value as (typeof SEVERITY_LEVELS)[number])
  );
}

function isValidAnalysisResultShape(
  value: unknown,
): value is Omit<GeminiAnalysisResult, "modelVersion"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isValidHazardType(candidate.hazardType) &&
    isValidSeverity(candidate.severity) &&
    typeof candidate.description === "string" &&
    isStringArray(candidate.recommendations) &&
    isStringArray(candidate.detectedObjects) &&
    typeof candidate.confidence === "number" &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    isStringArray(candidate.relatedRegulations)
  );
}

export async function analyzeHazardImage(
  apiKey: string,
  imageData: ArrayBuffer,
  mimeType: string,
): Promise<GeminiAnalysisResult | null> {
  try {
    if (!apiKey || !mimeType || imageData.byteLength === 0) {
      return null;
    }

    const bytes = new Uint8Array(imageData);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    const prompt = `당신은 산업안전보건 관리자입니다. 작업 현장 이미지를 분석해 위험요소를 식별하고 한국 산업안전보건법 관점에서 개선 조치를 제안하세요.

You are an occupational safety manager. Analyze the workplace image and return strict JSON only.

Requirements:
1) hazardType: choose exactly one from [fall_hazard, electrical, chemical, fire, confined_space, ppe_violation, structural, machinery, general, ergonomic, environmental, vehicle, noise, biological].
2) severity: choose one of [low, medium, high, critical].
3) description: Korean description of the hazard with context.
4) recommendations: specific Korean corrective actions.
5) detectedObjects: objects/conditions detected in the image.
6) confidence: number between 0 and 1.
7) relatedRegulations: Korean OSHA references (산업안전보건법 및 관련 시행령/고시/안전보건규칙).

Output must be valid JSON and match the schema exactly.`;

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              hazardType: {
                type: "STRING",
                enum: [...HAZARD_TYPES],
              },
              severity: {
                type: "STRING",
                enum: [...SEVERITY_LEVELS],
              },
              description: {
                type: "STRING",
              },
              recommendations: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              detectedObjects: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              confidence: {
                type: "NUMBER",
              },
              relatedRegulations: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
            },
            required: [
              "hazardType",
              "severity",
              "description",
              "recommendations",
              "detectedObjects",
              "confidence",
              "relatedRegulations",
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini hazard analysis failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidAnalysisResultShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini hazard analysis failed", {
      error: {
        name: "GeminiAnalysisError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}

// === Education Content AI Analysis ===

const EDUCATION_QUALITY_LEVELS = [
  "excellent",
  "good",
  "adequate",
  "needs_improvement",
  "poor",
] as const;

const EDUCATION_CATEGORIES = [
  "safety_training",
  "equipment_operation",
  "emergency_response",
  "hazard_awareness",
  "ppe_usage",
  "regulatory_compliance",
  "health_wellness",
  "general_safety",
] as const;

export interface EducationAnalysisResult {
  category: string;
  qualityLevel: string;
  summary: string;
  keyLearningPoints: string[];
  safetyRelevance: string;
  relatedStatutoryTraining: string[];
  improvements: string[];
  targetAudience: string;
  confidence: number;
  modelVersion: string;
}

function isValidEducationAnalysisShape(
  value: unknown,
): value is Omit<EducationAnalysisResult, "modelVersion"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const c = value as Record<string, unknown>;

  return (
    typeof c.category === "string" &&
    EDUCATION_CATEGORIES.includes(
      c.category as (typeof EDUCATION_CATEGORIES)[number],
    ) &&
    typeof c.qualityLevel === "string" &&
    EDUCATION_QUALITY_LEVELS.includes(
      c.qualityLevel as (typeof EDUCATION_QUALITY_LEVELS)[number],
    ) &&
    typeof c.summary === "string" &&
    isStringArray(c.keyLearningPoints) &&
    typeof c.safetyRelevance === "string" &&
    isStringArray(c.relatedStatutoryTraining) &&
    isStringArray(c.improvements) &&
    typeof c.targetAudience === "string" &&
    typeof c.confidence === "number" &&
    c.confidence >= 0 &&
    c.confidence <= 1
  );
}

function buildEducationPrompt(contentType: string): string {
  const base = `당신은 산업안전보건 교육 전문가입니다. 교육 콘텐츠를 분석하여 품질과 안전교육 적합성을 평가하세요.

You are an occupational safety education specialist. Analyze the education content and return strict JSON only.

Requirements:
1) category: choose exactly one from [safety_training, equipment_operation, emergency_response, hazard_awareness, ppe_usage, regulatory_compliance, health_wellness, general_safety].
2) qualityLevel: choose one of [excellent, good, adequate, needs_improvement, poor].
3) summary: Korean summary of the education content (2-3 sentences).
4) keyLearningPoints: key learning objectives in Korean (3-5 items).
5) safetyRelevance: Korean explanation of how this content relates to workplace safety.
6) relatedStatutoryTraining: related Korean statutory training requirements (산업안전보건법 관련 법정교육).
7) improvements: Korean suggestions for improving the content.
8) targetAudience: Korean description of the target audience.
9) confidence: number between 0 and 1.

Output must be valid JSON and match the schema exactly.`;

  if (contentType === "IMAGE") {
    return `${base}

Analyze the attached safety education image material.`;
  }
  if (contentType === "DOCUMENT") {
    return `${base}

Analyze the attached safety education document.`;
  }
  return `${base}

Analyze the following safety education text content.`;
}

const EDUCATION_RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    category: {
      type: "STRING" as const,
      enum: [...EDUCATION_CATEGORIES],
    },
    qualityLevel: {
      type: "STRING" as const,
      enum: [...EDUCATION_QUALITY_LEVELS],
    },
    summary: { type: "STRING" as const },
    keyLearningPoints: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    safetyRelevance: { type: "STRING" as const },
    relatedStatutoryTraining: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    improvements: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    targetAudience: { type: "STRING" as const },
    confidence: { type: "NUMBER" as const },
  },
  required: [
    "category",
    "qualityLevel",
    "summary",
    "keyLearningPoints",
    "safetyRelevance",
    "relatedStatutoryTraining",
    "improvements",
    "targetAudience",
    "confidence",
  ],
};

export async function analyzeEducationContent(
  apiKey: string,
  contentType: "IMAGE" | "TEXT" | "DOCUMENT",
  options: {
    imageData?: ArrayBuffer;
    mimeType?: string;
    textContent?: string;
    title?: string;
  },
): Promise<EducationAnalysisResult | null> {
  try {
    if (!apiKey) {
      return null;
    }

    const prompt = buildEducationPrompt(contentType);
    const parts: Array<
      { text: string } | { inline_data: { mime_type: string; data: string } }
    > = [];

    if (options.title) {
      parts.push({ text: `교육 콘텐츠 제목: ${options.title}` });
    }
    parts.push({ text: prompt });

    if (
      (contentType === "IMAGE" || contentType === "DOCUMENT") &&
      options.imageData &&
      options.mimeType
    ) {
      if (options.imageData.byteLength === 0) {
        return null;
      }
      const bytes = new Uint8Array(options.imageData);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binary);
      parts.push({
        inline_data: {
          mime_type: options.mimeType,
          data: base64,
        },
      });
    } else if (contentType === "TEXT") {
      if (!options.textContent) {
        return null;
      }
      parts.push({
        text: `

교육 내용:
${options.textContent}`,
      });
    } else {
      return null;
    }

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EDUCATION_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini education analysis failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidEducationAnalysisShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini education analysis failed", {
      error: {
        name: "GeminiEducationAnalysisError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}

const TBM_RISK_LEVELS = ["high", "medium", "low"] as const;

export interface TbmAnalysisResult {
  riskLevel: string;
  summary: string;
  identifiedRisks: string[];
  safetyChecklist: string[];
  precautions: string[];
  relatedRegulations: string[];
  confidence: number;
  modelVersion: string;
}

function isValidTbmAnalysisShape(
  value: unknown,
): value is Omit<TbmAnalysisResult, "modelVersion"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const c = value as Record<string, unknown>;
  return (
    typeof c.riskLevel === "string" &&
    TBM_RISK_LEVELS.includes(c.riskLevel as (typeof TBM_RISK_LEVELS)[number]) &&
    typeof c.summary === "string" &&
    isStringArray(c.identifiedRisks) &&
    isStringArray(c.safetyChecklist) &&
    isStringArray(c.precautions) &&
    isStringArray(c.relatedRegulations) &&
    typeof c.confidence === "number" &&
    c.confidence >= 0 &&
    c.confidence <= 1
  );
}

const TBM_RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    riskLevel: {
      type: "STRING" as const,
      enum: [...TBM_RISK_LEVELS],
    },
    summary: { type: "STRING" as const },
    identifiedRisks: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    safetyChecklist: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    precautions: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    relatedRegulations: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    confidence: { type: "NUMBER" as const },
  },
  required: [
    "riskLevel",
    "summary",
    "identifiedRisks",
    "safetyChecklist",
    "precautions",
    "relatedRegulations",
    "confidence",
  ],
};

export async function analyzeTbmRecord(
  apiKey: string,
  options: {
    topic: string;
    content?: string | null;
    weatherCondition?: string | null;
    specialNotes?: string | null;
  },
): Promise<TbmAnalysisResult | null> {
  try {
    if (!apiKey || !options.topic) {
      return null;
    }

    const prompt = `당신은 산업안전보건 전문가입니다. TBM(Tool Box Meeting) 회의 내용을 분석하여 위험요소를 식별하고 안전 체크리스트를 생성하세요.

You are an occupational safety expert. Analyze the TBM meeting content and return strict JSON only.

Requirements:
1) riskLevel: choose one of [high, medium, low] based on overall risk assessment.
2) summary: Korean summary of the TBM meeting analysis (2-3 sentences).
3) identifiedRisks: identified workplace hazards/risks in Korean (3-7 items).
4) safetyChecklist: safety checklist items workers should verify before starting work in Korean (5-10 items).
5) precautions: specific precautions and safety measures in Korean (3-5 items).
6) relatedRegulations: related Korean OSHA regulations (산업안전보건법 관련 법규/고시/안전보건규칙).
7) confidence: number between 0 and 1.

Output must be valid JSON and match the schema exactly.`;

    const textParts: string[] = [prompt];
    textParts.push(`\n\nTBM 주제: ${options.topic}`);
    if (options.content) {
      textParts.push(`\nTBM 내용: ${options.content}`);
    }
    if (options.weatherCondition) {
      textParts.push(`\n날씨 상태: ${options.weatherCondition}`);
    }
    if (options.specialNotes) {
      textParts.push(`\n특이사항: ${options.specialNotes}`);
    }

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: textParts.join("") }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: TBM_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini TBM analysis failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidTbmAnalysisShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini TBM analysis failed", {
      error: {
        name: "GeminiTbmAnalysisError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}

const QUIZ_QUESTION_TYPES = ["SINGLE_CHOICE", "OX"] as const;

export interface QuizGenerationResult {
  quizTitle: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    questionType: string;
  }>;
  modelVersion: string;
}

function isValidQuizGenerationShape(
  value: unknown,
): value is Omit<QuizGenerationResult, "modelVersion"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.quizTitle !== "string" ||
    !Array.isArray(candidate.questions)
  ) {
    return false;
  }

  return candidate.questions.every((question) => {
    if (typeof question !== "object" || question === null) {
      return false;
    }

    const q = question as Record<string, unknown>;
    if (
      typeof q.question !== "string" ||
      !isStringArray(q.options) ||
      typeof q.correctAnswer !== "number" ||
      !Number.isInteger(q.correctAnswer) ||
      typeof q.explanation !== "string" ||
      typeof q.questionType !== "string" ||
      !QUIZ_QUESTION_TYPES.includes(
        q.questionType as (typeof QUIZ_QUESTION_TYPES)[number],
      )
    ) {
      return false;
    }

    const expectedOptionCount = q.questionType === "OX" ? 2 : 4;
    return (
      q.options.length === expectedOptionCount &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < q.options.length
    );
  });
}

const QUIZ_GENERATION_RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    quizTitle: { type: "STRING" as const },
    questions: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          question: { type: "STRING" as const },
          options: {
            type: "ARRAY" as const,
            items: { type: "STRING" as const },
          },
          correctAnswer: { type: "INTEGER" as const },
          explanation: { type: "STRING" as const },
          questionType: {
            type: "STRING" as const,
            enum: [...QUIZ_QUESTION_TYPES],
          },
        },
        required: [
          "question",
          "options",
          "correctAnswer",
          "explanation",
          "questionType",
        ],
      },
    },
  },
  required: ["quizTitle", "questions"],
};

export async function generateQuizFromContent(
  apiKey: string,
  options: {
    contentTitle: string;
    contentAnalysis: string;
  },
): Promise<QuizGenerationResult | null> {
  try {
    if (!apiKey || !options.contentTitle || !options.contentAnalysis) {
      return null;
    }

    const prompt = `당신은 산업안전보건 교육 퀴즈 전문가입니다. 교육 콘텐츠 분석 결과를 바탕으로 학습 효과를 측정할 수 있는 퀴즈를 생성하세요.

Generate 5 quiz questions based on the education content analysis.
Requirements:
1) quizTitle: Korean quiz title derived from content
2) questions: array of 5 questions
   - question: Korean question text
   - options: 4 Korean answer choices (for SINGLE_CHOICE) or 2 choices ["O (맞다)", "X (틀리다)"] (for OX)
   - correctAnswer: 0-based index of correct option
   - explanation: Korean explanation of why the answer is correct
   - questionType: "SINGLE_CHOICE" or "OX"
3) Mix question types: at least 3 SINGLE_CHOICE and up to 2 OX questions

Output must be valid JSON and match the schema exactly.`;

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\n교육 콘텐츠 제목: ${options.contentTitle}\n\n교육 콘텐츠 분석 결과(JSON):\n${options.contentAnalysis}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: QUIZ_GENERATION_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini quiz generation failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidQuizGenerationShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini quiz generation failed", {
      error: {
        name: "GeminiQuizGenerationError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}

export interface ActionImageAnalysisResult {
  complianceStatus: string;
  ppeDetected: string[];
  ppeMissing: string[];
  safetyObservations: string[];
  improvementAreas: string[];
  beforeAfterComparison: string | null;
  overallAssessment: string;
  confidence: number;
  modelVersion: string;
}

function isValidActionImageAnalysisShape(
  value: unknown,
): value is Omit<ActionImageAnalysisResult, "modelVersion"> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.complianceStatus === "string" &&
    isStringArray(v.ppeDetected) &&
    isStringArray(v.ppeMissing) &&
    isStringArray(v.safetyObservations) &&
    isStringArray(v.improvementAreas) &&
    (v.beforeAfterComparison === null ||
      typeof v.beforeAfterComparison === "string") &&
    typeof v.overallAssessment === "string" &&
    typeof v.confidence === "number" &&
    v.confidence >= 0 &&
    v.confidence <= 100
  );
}

const ACTION_IMAGE_RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    complianceStatus: {
      type: "STRING" as const,
      enum: ["compliant", "non_compliant", "partial", "not_applicable"],
    },
    ppeDetected: { type: "ARRAY" as const, items: { type: "STRING" as const } },
    ppeMissing: { type: "ARRAY" as const, items: { type: "STRING" as const } },
    safetyObservations: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    improvementAreas: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
    beforeAfterComparison: { type: "STRING" as const, nullable: true },
    overallAssessment: { type: "STRING" as const },
    confidence: { type: "INTEGER" as const },
  },
  required: [
    "complianceStatus",
    "ppeDetected",
    "ppeMissing",
    "safetyObservations",
    "improvementAreas",
    "overallAssessment",
    "confidence",
  ],
};

export async function analyzeActionImage(
  apiKey: string,
  imageData: string,
  mimeType: string,
): Promise<ActionImageAnalysisResult | null> {
  try {
    if (!apiKey || !mimeType || !imageData) {
      return null;
    }

    const prompt = `당신은 산업안전보건 전문가입니다. 이 조치(시정/개선) 사진을 분석하여 다음을 평가하세요:

1. complianceStatus: 안전 기준 준수 상태 (compliant/non_compliant/partial/not_applicable)
2. ppeDetected: 감지된 개인보호구(PPE) 목록 (예: 안전모, 안전화, 보호장갑 등)
3. ppeMissing: 미착용 또는 누락된 PPE 목록
4. safetyObservations: 안전 관련 관찰 사항 (최대 5개)
5. improvementAreas: 개선이 필요한 영역 (최대 3개)
6. beforeAfterComparison: 개선 전후 비교 설명 (해당되는 경우)
7. overallAssessment: 전반적인 안전 상태 평가 (2-3문장)
8. confidence: 분석 신뢰도 (0-100)

모든 응답은 한국어로 작성하세요.`;

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageData,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ACTION_IMAGE_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini action image analysis failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidActionImageAnalysisShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini action image analysis failed", {
      error: {
        name: "GeminiActionImageAnalysisError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}

export interface AnnouncementDraftResult {
  title: string;
  content: string;
  modelVersion: string;
}

function isValidAnnouncementDraftShape(
  value: unknown,
): value is Omit<AnnouncementDraftResult, "modelVersion"> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const v = value as Record<string, unknown>;
  return typeof v.title === "string" && typeof v.content === "string";
}

const ANNOUNCEMENT_DRAFT_RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    title: { type: "STRING" as const },
    content: { type: "STRING" as const },
  },
  required: ["title", "content"],
};

export async function generateAnnouncementDraft(
  apiKey: string,
  keywords: string,
): Promise<AnnouncementDraftResult | null> {
  try {
    if (!apiKey || !keywords) {
      return null;
    }

    const prompt = `당신은 산업안전보건 공지사항 작성 전문가입니다. 주어진 키워드를 바탕으로 안전 관련 공지사항 초안을 작성하세요.

키워드: ${keywords}

Requirements:
1. title: 간결하고 명확한 공지사항 제목 (한국어)
2. content: HTML 형식의 공지사항 본문 (한국어)
   - <h3> 태그로 섹션 제목
   - <p> 태그로 본문 단락
   - <ul><li> 태그로 목록
   - <strong> 태그로 강조
   - 전문적이고 공식적인 어조
   - 구체적인 안전 지침 포함
   - 관련 법규나 규정 언급 (해당되는 경우)
   - 문의처 안내 포함

공지사항은 현장 근로자가 이해하기 쉽게 작성하세요.`;

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ANNOUNCEMENT_DRAFT_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      logger.error("Gemini announcement draft generation failed", {
        error: {
          name: "GeminiApiError",
          message: `Gemini API returned status ${response.status}`,
        },
      });
      return null;
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed: unknown = JSON.parse(text);
    if (!isValidAnnouncementDraftShape(parsed)) {
      return null;
    }

    return {
      ...parsed,
      modelVersion: GEMINI_MODEL,
    };
  } catch (err) {
    logger.error("Gemini announcement draft generation failed", {
      error: {
        name: "GeminiAnnouncementDraftGenerationError",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    return null;
  }
}
