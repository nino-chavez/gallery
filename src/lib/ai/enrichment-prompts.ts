/**
 * AI Enrichment Prompts - Two-Bucket Model
 *
 * Bucket 1: Concrete & Filterable (user-facing search filters)
 * Bucket 2: Abstract & Internal (AI story detection only)
 *
 * Each bucket has its own prompt to ensure clear separation of concerns.
 */

// =============================================================================
// BUCKET 1: User-Facing Metadata (Concrete & Searchable)
// =============================================================================

export const BUCKET1_PROMPT = `Analyze this volleyball photo and extract CONCRETE, SEARCHABLE metadata.

BE OBJECTIVE. BE CONCRETE. These fields will be exposed as user search filters.

Required Fields:

1. **play_type** (string | null): The specific sports action shown

   VOLLEYBALL: "spike", "block", "dig", "set", "serve", "pass"
   - "spike": Player attacking/hitting the ball over the net
   - "block": Player jumping to block at the net
   - "dig": Defensive save, usually low to ground
   - "set": Setting the ball for an attack
   - "serve": Serving the ball
   - "pass": Passing/bumping the ball to teammate

   BASKETBALL: "dunk", "layup", "jump_shot", "rebound", "block", "pass", "dribble"
   - "dunk": Player dunking the ball
   - "layup": Close-range shot at basket
   - "jump_shot": Mid-range or three-point shot
   - "rebound": Grabbing a missed shot
   - "block": Blocking opponent's shot
   - "pass": Passing to teammate
   - "dribble": Ball handling/driving

   SOCCER: "kick", "header", "tackle", "save", "dribble", "pass"
   SOFTBALL/BASEBALL: "pitch", "hit", "catch", "throw", "slide", "run"
   FOOTBALL: "throw", "catch", "run", "tackle", "block", "kick"
   TRACK: "sprint", "hurdle", "relay", "jump", "throw"

   CRITICAL RULES:
   - Return NULL if photo_category is "candid", "portrait", "warmup", or "ceremony"
   - ONLY "action" category photos should have a play_type value
   - Choose the PRIMARY action if multiple actions visible
   - Use underscores not hyphens (jump_shot NOT jump-shot)

2. **action_intensity** (string): The intensity level of the action
   Options: "low", "medium", "high", "peak"
   - "low": Warmup, practice, casual play
   - "medium": Standard gameplay, no critical moment
   - "high": Important play, rally in progress
   - "peak": Spectacular moment, game-critical play

3. **sport_type** (string): The sport being played
   Options: "volleyball", "basketball", "soccer", "tennis", etc.

4. **photo_category** (string): The type of photo
   Options: "action", "celebration", "candid", "portrait", "warmup", "ceremony"

5. **composition** (string): The PRIMARY composition pattern used (SINGLE VALUE ONLY)
   Options: "rule_of_thirds", "leading_lines", "centered", "symmetry", "frame_within_frame"
   - "rule_of_thirds": Subject positioned at intersection points of rule-of-thirds grid
   - "leading_lines": Strong lines (court lines, net, body lines) leading to subject
   - "centered": Subject positioned in center of frame
   - "symmetry": Balanced, mirror-like composition
   - "frame_within_frame": Subject framed by foreground elements (net, people, architecture)

   CRITICAL RULES:
   - Return ONLY ONE value (the most dominant composition pattern)
   - Use UNDERSCORES not hyphens (rule_of_thirds NOT rule-of-thirds)
   - NO multi-value strings (NO "close-up|dramatic-angle")
   - If multiple patterns present, choose the PRIMARY one

6. **time_of_day** (string): When the photo was taken (based on lighting)
   Options: "golden_hour", "midday", "evening", "blue_hour", "night", "dawn"
   - Analyze sky color, shadows, light temperature

7. **lighting** (string): The lighting type/quality
   Options: "natural", "backlit", "dramatic", "soft", "artificial"
   - "natural": Window or outdoor daylight
   - "backlit": Subject silhouetted against light
   - "dramatic": High contrast, directional light
   - "soft": Diffused, even lighting
   - "artificial": Gym/indoor artificial lighting

8. **color_temperature** (string): The overall color temperature
   Options: "warm", "cool", "neutral"
   - "warm": Golden, orange, sunset tones
   - "cool": Blue, teal, dawn tones
   - "neutral": Balanced, no strong color cast

Return ONLY JSON in this exact format (SINGLE composition value with underscores):
{
  "play_type": "block",
  "action_intensity": "peak",
  "sport_type": "volleyball",
  "photo_category": "action",
  "composition": "rule_of_thirds",
  "time_of_day": "evening",
  "lighting": "artificial",
  "color_temperature": "neutral"
}

NO explanations. NO markdown. ONLY JSON.`;

// =============================================================================
// BUCKET 2: Internal Metadata (AI Story Detection)
// =============================================================================

export const BUCKET2_PROMPT = `Analyze this volleyball photo for INTERNAL AI story detection metadata.

These fields are NOT user-facing. They're used by the AI Story Curation Engine to generate narrative collections like "Comeback Stories", "Game-Winning Rallies", etc.

BE SUBJECTIVE where needed. Focus on narrative potential.

Required Fields:

1. **emotion** (string): The primary emotion conveyed
   Options: "triumph", "determination", "intensity", "focus", "excitement", "serenity"
   - "triumph": Victory, celebration, achievement
   - "determination": Grit, resolve, effort
   - "intensity": High energy, focused aggression
   - "focus": Concentration, calm precision
   - "excitement": Joy, anticipation, enthusiasm
   - "serenity": Calm, peaceful, composed

2. **sharpness** (number): Technical sharpness quality (0-10)
   - 0-3: Blurry, out of focus
   - 4-6: Acceptable sharpness
   - 7-8: Sharp, good quality
   - 9-10: Exceptionally sharp, tack-sharp

3. **composition_score** (number): Aesthetic composition quality (0-10)
   - 0-3: Poor composition, unbalanced
   - 4-6: Acceptable composition
   - 7-8: Good composition, well-balanced
   - 9-10: Excellent composition, award-worthy

4. **exposure_accuracy** (number): Exposure quality (0-10)
   - 0-3: Over/underexposed, poor histogram
   - 4-6: Acceptable exposure
   - 7-8: Good exposure, proper histogram
   - 9-10: Perfect exposure

5. **emotional_impact** (number): Subjective emotional intensity (0-10)
   - How strongly does this photo convey emotion?
   - 0-3: Little emotional content
   - 4-6: Some emotional content
   - 7-8: Strong emotional impact
   - 9-10: Exceptional emotional resonance

6. **time_in_game** (string | null): When in the game this occurred
   Options: "first_5_min", "middle", "final_5_min", "overtime", "unknown"
   - Use visual cues: score displays, player fatigue, crowd intensity
   - If no clear indicators, return "unknown"

7. **ai_confidence** (number): Overall detection confidence (0-1)
   - How confident are you in these assessments?
   - 0.0-0.5: Low confidence, many uncertain fields
   - 0.5-0.7: Medium confidence, some uncertain fields
   - 0.7-0.9: High confidence, most fields clear
   - 0.9-1.0: Very high confidence, all fields clear

Return ONLY JSON in this exact format:
{
  "emotion": "triumph",
  "sharpness": 8.5,
  "composition_score": 7.5,
  "exposure_accuracy": 8.0,
  "emotional_impact": 9.0,
  "time_in_game": "final_5_min",
  "ai_confidence": 0.85
}

NO explanations. NO markdown. ONLY JSON.`;

// =============================================================================
// Combined Prompt (If running in single API call)
// =============================================================================

export const COMBINED_PROMPT = `Analyze this volleyball photo and extract metadata for TWO purposes:

BUCKET 1: User-facing search filters (concrete, objective)
BUCKET 2: Internal story detection (subjective, narrative)

${BUCKET1_PROMPT}

AND ALSO:

${BUCKET2_PROMPT}

Return ONLY JSON combining both buckets:
{
  "bucket1": {
    "play_type": "block",
    "action_intensity": "peak",
    "sport_type": "volleyball",
    "photo_category": "action",
    "composition": "rule_of_thirds",
    "time_of_day": "evening",
    "lighting": "artificial",
    "color_temperature": "neutral"
  },
  "bucket2": {
    "emotion": "triumph",
    "sharpness": 8.5,
    "composition_score": 7.5,
    "exposure_accuracy": 8.0,
    "emotional_impact": 9.0,
    "time_in_game": "final_5_min",
    "ai_confidence": 0.85
  }
}

NO explanations. NO markdown. ONLY JSON.`;

// =============================================================================
// TypeScript Interfaces for AI Responses
// =============================================================================

export interface Bucket1Response {
  play_type: string;
  action_intensity: string;
  sport_type: string;
  photo_category: string;
  composition: string;
  time_of_day: string;
  lighting: string;
  color_temperature: string;
}

export interface Bucket2Response {
  emotion: string;
  sharpness: number;
  composition_score: number;
  exposure_accuracy: number;
  emotional_impact: number;
  time_in_game: string | null;
  ai_confidence: number;
}

export interface CombinedResponse {
  bucket1: Bucket1Response;
  bucket2: Bucket2Response;
}

// =============================================================================
// Schema v2.0 Delta Prompt (Minimal - Only 4 New Fields)
// =============================================================================

export const SCHEMA_V2_DELTA_PROMPT = `Analyze this volleyball photo and extract ONLY these 4 metadata fields:

1. **lighting** (string): The lighting type/quality
   Options: "natural", "backlit", "dramatic", "soft", "artificial"
   - "natural": Window or outdoor daylight
   - "backlit": Subject silhouetted against light
   - "dramatic": High contrast, directional light
   - "soft": Diffused, even lighting
   - "artificial": Gym/indoor artificial lighting

2. **color_temperature** (string): Overall color temperature
   Options: "warm", "cool", "neutral"
   - "warm": Golden, orange, sunset tones
   - "cool": Blue, teal, dawn tones
   - "neutral": Balanced, no strong color cast

3. **time_in_game** (string | null): When in the game this occurred
   Options: "first_5_min", "middle", "final_5_min", "overtime", "unknown"
   - Use visual cues: score displays, player fatigue, crowd intensity, body language
   - If no clear indicators, return "unknown"

4. **ai_confidence** (number): Overall detection confidence (0-1)
   - How confident are you in these 4 assessments?
   - 0.0-0.5: Low confidence
   - 0.5-0.7: Medium confidence
   - 0.7-0.9: High confidence
   - 0.9-1.0: Very high confidence

Return ONLY JSON in this exact format:
{
  "lighting": "artificial",
  "color_temperature": "neutral",
  "time_in_game": "final_5_min",
  "ai_confidence": 0.85
}

NO explanations. NO markdown. ONLY JSON.`;

export interface SchemaV2DeltaResponse {
  lighting: string;
  color_temperature: string;
  time_in_game: string | null;
  ai_confidence: number;
}

// =============================================================================
// Usage Examples
// =============================================================================

export const ENRICHMENT_EXAMPLES = {
  bucket1_only: {
    description: 'Extract only user-facing metadata (cheaper, faster)',
    prompt: BUCKET1_PROMPT,
    cost_estimate: '$0.003-0.006 per photo',
    use_case: 'Initial photo upload, user needs immediate search capability'
  },

  bucket2_only: {
    description: 'Extract only internal metadata (for story generation)',
    prompt: BUCKET2_PROMPT,
    cost_estimate: '$0.003-0.006 per photo',
    use_case: 'Batch story generation, updating story collections'
  },

  combined: {
    description: 'Extract both buckets in single API call (most efficient)',
    prompt: COMBINED_PROMPT,
    cost_estimate: '$0.006-0.015 per photo',
    use_case: 'Full enrichment pipeline, new photo uploads'
  }
};
