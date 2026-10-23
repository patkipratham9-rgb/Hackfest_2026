import { NextRequest, NextResponse } from "next/server";
import {
  getVertexAIRecommendations,
  typesenseSearch,
  analyzeProductImageWithVertexVision,
  generateGeminiContent,
  sendDialogflowMessage,
  transcribeAudio,
  forecastDemand,
  classifyCustomerSentiment,
  predictCustomerLifetimeValueAndChurn,
  getIntelligenceNodePricingInsights,
  evaluateSiftFraudRisk,
  optimizeDeliveryRoute,
  generateSmartMarketingCampaign,
  extractProductAttributesLilyAI,
} from "@/lib/aiIntegrations";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload = {} } = body;

    switch (action) {
      case "vertex_recommendations": {
        const res = await getVertexAIRecommendations({
          userId: payload.userId,
          viewedProductIds: payload.viewedProductIds,
          candidateProducts: payload.candidateProducts || [],
          locality: payload.locality,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "typesense_search": {
        const res = await typesenseSearch({
          query: payload.query || "",
          products: payload.products || [],
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "vertex_vision": {
        const res = await analyzeProductImageWithVertexVision({
          imageUrlOrBase64: payload.imageUrlOrBase64 || "",
          hintName: payload.hintName,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "gemini_generate": {
        const res = await generateGeminiContent(payload.prompt || "Hello LocalLoop");
        return NextResponse.json({ success: true, data: res });
      }

      case "dialogflow_message": {
        const res = await sendDialogflowMessage({
          sessionId: payload.sessionId || `session_${Date.now()}`,
          message: payload.message || "",
          role: payload.role || "customer",
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "speech_to_text": {
        const res = await transcribeAudio(payload);
        return NextResponse.json({ success: true, data: res });
      }

      case "vertex_forecasting": {
        const res = await forecastDemand({
          storeId: payload.storeId || "store-1",
          currentStock: payload.currentStock || 25,
          dailyVelocity: payload.dailyVelocity || 4,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "monkeylearn_sentiment": {
        const res = await classifyCustomerSentiment(payload.text || "");
        return NextResponse.json({ success: true, data: res });
      }

      case "bigquery_ml": {
        const res = await predictCustomerLifetimeValueAndChurn({
          ordersPlaced: payload.ordersPlaced || 1,
          totalSpend: payload.totalSpend || 500,
          daysSinceLastOrder: payload.daysSinceLastOrder || 2,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "intelligence_node": {
        const res = await getIntelligenceNodePricingInsights({
          productName: payload.productName || "Filter Coffee Powder",
          category: payload.category || "Filter Coffee & Tea",
          currentPrice: payload.currentPrice || 180,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "sift_fraud_shield": {
        const res = await evaluateSiftFraudRisk({
          userId: payload.userId,
          orderAmount: payload.orderAmount || 250,
          customerPhone: payload.customerPhone || "9845122334",
          paymentMethod: payload.paymentMethod || "upi",
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "route4me_route": {
        const res = await optimizeDeliveryRoute({
          storeAddress: payload.storeAddress || "Vidyanagar, Hubballi",
          destinationAddress: payload.destinationAddress || "Gokul Road, Hubballi",
          isHomeDelivery: Boolean(payload.isHomeDelivery),
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "mailchimp_ai": {
        const res = await generateSmartMarketingCampaign({
          storeName: payload.storeName || "Meena Store",
          productName: payload.productName || "Fresh Coffee",
          locality: payload.locality || "Vidyanagar",
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "lily_ai_attributes": {
        const res = await extractProductAttributesLilyAI({
          name: payload.name || "Item",
          description: payload.description || "",
          category: payload.category || "Grocery",
        });
        return NextResponse.json({ success: true, data: res });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown AI action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "AI integration execution failed" },
      { status: 500 }
    );
  }
}
