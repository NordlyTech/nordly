# AI Insights Generation API

This directory contains API endpoints for AI-powered energy savings insights generation.

## Endpoint: POST `/api/ai/generate`

Generate AI insights for a specific location using OpenAI's language model.

### Prerequisites

- Valid OpenAI API key set in environment variable `OPENAI_API_KEY`
- User must be authenticated with Supabase
- Location must belong to the user's company
- Location must have `location_type` defined

### Request

**Method:** `POST`

**URL:** `/api/ai/generate`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "location_id": "uuid-string"
}
```

### Response - Success (200)

```json
{
  "ok": true,
  "summary": "Operational scheduling and lighting controls are likely the biggest near-term opportunities.",
  "insightsCreated": 4
}
```

### Response - Error (400 | 401 | 500)

```json
{
  "ok": false,
  "error": "A valid location_id is required.",
  "code": "INVALID_REQUEST"
}
```

**Error Codes:**

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_REQUEST` | 400 | Missing/invalid location_id or malformed request body |
| `UNAUTHORIZED` | 401 | User not authenticated, no company membership, or location doesn't belong to user's company |
| `GENERATION_FAILED` | 400 | OpenAI call failed, location missing type, or database insertion failed |
| `MISSING_API_KEY` | 500 | `OPENAI_API_KEY` environment variable not configured |

### Example Usage

#### cURL

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"location_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

#### JavaScript/Fetch

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location_id: '550e8400-e29b-41d4-a716-446655440000'
  })
})

const json = await response.json()

if (json.success) {
  console.log(`Generated ${json.data.insightCount} insights`)
  console.log(`Generation ID: ${json.data.generationId}`)
} else {
  console.error(`Error: ${json.error} (${json.code})`)
}
```

#### TypeScript Client Function

```typescript
async function generateLocationInsights(locationId: string) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ location_id: locationId })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`${error.code}: ${error.error}`)
  }

  const result = await response.json()
  return result.data
}

// Usage
try {
  const insights = await generateLocationInsights('location-uuid')
  console.log(`Generated ${insights.insightCount} insights`)
} catch (error) {
  console.error(error.message)
}
```

### What Happens Behind the Scenes

1. **Auth check**: Validates user is authenticated and has a company membership
2. **Location load**: Retrieves location details (name, type, country, city, floor area, operating hours)
3. **Company load**: Retrieves company details (name, industry, country)
4. **Prompt building**: Constructs a detailed prompt for OpenAI with all available context
5. **OpenAI call**: Invokes `gpt-4o-mini` with JSON response format constraint
6. **Response parsing**: Validates and normalizes the AI-generated insights
7. **Database persistence**: Saves generation record and all insights to Supabase
8. **Return**: Sends back generation ID and insight count

### Data Inserted

**Table: `ai_generations`**
```
├─ company_id
├─ user_id
├─ generation_type ("location_insights")
├─ input_payload_json
├─ prompt_version
├─ model_name
├─ output_payload_json
├─ status ("success" | "error")
└─ created_at
```

**Table: `insights`** (multiple rows, one per insight)
```
├─ company_id
├─ location_id
├─ ai_generation_id
├─ source_type ("ai_generated")
├─ title
├─ summary
├─ description_md
├─ category (hvac, lighting, operations, behavior, equipment, schedule)
├─ confidence_score (0.10–0.90)
├─ estimated_savings_value (EUR/month)
├─ estimated_savings_percent (0–100)
├─ status ("new")
└─ created_at
```

### Error Handling

#### Missing API Key
If `OPENAI_API_KEY` is not configured:
```json
{
  "ok": false,
  "error": "AI generation is not configured. Please contact support.",
  "code": "MISSING_API_KEY"
}
```
**Status:** 500 Internal Server Error

#### Invalid Request Body
```json
{
  "ok": false,
  "error": "Invalid request body. Expected JSON.",
  "code": "INVALID_REQUEST"
}
```
**Status:** 400 Bad Request

#### Location Not Found
```json
{
  "ok": false,
  "error": "Location not found or does not belong to your company.",
  "code": "INVALID_REQUEST"
}
```
**Status:** 400 Bad Request

#### Unauthorized Access
```json
{
  "error": "You must be logged in to generate insights.",
  "code": "UNAUTHORIZED"
}
```
**Status:** 401 Unauthorized

#### OpenAI API Error
```json
{
  "error": "AI generation failed: Insufficient API credits",
  "code": "GENERATION_FAILED"
}
```
**Status:** 400 Bad Request

### Performance Notes

- Typical generation time: **8–15 seconds**
- Request timeout: **30 seconds**
- Maximum insights per generation: **7**
- OpenAI model: **gpt-4o-mini** (cost-optimized)

### API Reliability

- Errors during database insertion are automatically rolled back (ai_generations row deleted)
- Network failures will return a GENERATION_FAILED error with details
- All timestamps are automatically managed by Supabase

### Integration Points

This endpoint is used by:
- **Client mutation action**: `generateInsightsAction()` in `/lib/actions/generateInsights.ts`
- **Locations page**: "Generate AI Insights" button
- **Location detail page**: Generation CTA

For client-side integration, prefer calling the server action `generateInsightsAction()` which already wraps this endpoint with error handling and revalidation.
