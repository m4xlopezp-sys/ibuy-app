export function GET() {
  return Response.json({
    status: 'ok',
    platform: 'IBUY Coatepec de Harinas',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
}
