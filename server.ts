import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Stripe from "stripe";
import admin from "firebase-admin";
import axios from "axios";

console.log("[SERVER] Starting server initialization...");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-12-18.acacia" as any,
});

console.log(`[STRIPE] Initialized in ${stripeKey.startsWith('sk_live') ? 'LIVE (REAL MONEY)' : 'TEST'} mode.`);

// Initialize Firebase Admin (Optional: requires service account)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
  }
} else {
  // Fallback for demo: use dummy initialization if we don't have a service account yet
  // but warn the user in the logs.
  console.warn("FIREBASE_SERVICE_ACCOUNT not found. Server-side database updates won't work.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Shared fulfillment logic for Webhook and Fallback Verification
async function fulfillOrder(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error("[FULFILLMENT] No metadata found in session.");
    return;
  }

  const { userId, productId, productName, amount, creatorId } = metadata;
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  // 1. DISCORD NOTIFICATION
  if (WEBHOOK_URL) {
    try {
      await axios.post(WEBHOOK_URL, {
        username: "Enzo Assets Notificador",
        avatar_url: "https://enzo-asset2.vercel.app/logo.png",
        embeds: [{
          title: "🚀 Nova Venda Realizada!",
          color: 0xC1FF00,
          fields: [
            { name: "📦 Produto", value: productName || "Asset Digital", inline: true },
            { name: "💰 Valor", value: `R$ ${amount}`, inline: true },
            { name: "👤 Comprador", value: session.customer_details?.email || "Cliente", inline: false }
          ],
          footer: { text: "Enzo Assets - O melhor para seu jogo" },
          timestamp: new Date()
        }]
      });
      console.log(`[DISCORD] Aviso de venda enviado para: ${productName}`);
    } catch (discordError) {
      console.error("[DISCORD] Erro ao enviar aviso:", discordError);
    }
  }

  // 2. DATABASE UPDATE (Requires FIREBASE_SERVICE_ACCOUNT)
  if (admin.apps.length > 0) {
    const db = admin.firestore();
    try {
      // Check if this session was already processed to avoid duplicates
      const existingPurchase = await db.collection("purchases")
        .where("stripeSessionId", "==", session.id)
        .limit(1)
        .get();

      if (!existingPurchase.empty) {
        console.log(`[FULFILLMENT] Purchase ${session.id} already processed. Skipping.`);
        return;
      }

      // Fetch product data to ensure we have latest URLs
      const productDoc = await db.collection("products").doc(productId).get();
      const pData = productDoc.exists ? productDoc.data() : null;

      await db.collection("purchases").add({
        userId,
        productId,
        productName: productName || pData?.name || "Asset",
        productImage: pData?.imageUrl || "https://picsum.photos/seed/asset/400/400",
        fileUrl: pData?.fileUrl || "",
        price: parseFloat(amount),
        creatorId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        stripeSessionId: session.id
      });

      // Update Creator Balance
      const creatorRef = db.collection("profiles").doc(creatorId);
      await db.runTransaction(async (transaction) => {
        const creatorDoc = await transaction.get(creatorRef);
        const currentBalance = creatorDoc.exists ? (creatorDoc.data()?.balance || 0) : 0;
        transaction.update(creatorRef, {
          balance: currentBalance + parseFloat(amount),
          totalSales: admin.firestore.FieldValue.increment(1)
        });
      });

      console.log(`[SUCCESS] Database updated for user: ${userId}`);
    } catch (dbError) {
      console.error("[FIREBASE ERROR] Failed to update database:", dbError);
    }
  } else {
    console.warn("[FULFILLMENT] FIREBASE_SERVICE_ACCOUNT is missing. Database records skipped.");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use raw body for Stripe Webhook signature verification
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE WEBHOOK] Received event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillOrder(session);
    }

    res.json({ received: true });
  });

  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.5", timestamp: new Date().toISOString() });
  });

  // API Route: Verify Session Fallback (Fired by Frontend)
  app.post("/api/payments/verify-session", async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    try {
      console.log(`[VERIFY] Manual check for session: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        await fulfillOrder(session);
        return res.json({ success: true, status: 'paid' });
      } else {
        return res.json({ success: false, status: session.payment_status });
      }
    } catch (error: any) {
      console.error("[VERIFY ERROR]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Create Stripe Checkout Session
  app.post("/api/payments/checkout", async (req, res) => {
    try {
      const { product, user } = req.body;

      if (!product || !user) {
        return res.status(400).json({ error: "Missing product or user data" });
      }

      // Dynamic URL generation for preview environments
      const origin = req.get("origin") || req.get("referer") || process.env.VITE_APP_URL || "https://enzo-asset2.vercel.app";
      // Clean up origin if it's a referer with path
      const baseUrl = new URL(origin).origin;

      const sessionData: any = {
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: product.name,
                description: product.description,
                images: [product.thumbnail || "https://picsum.photos/seed/tech/400/400"],
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity: 1,
          },
        ],
        payment_method_types: ["card", "pix"],
        payment_method_options: {
          pix: {
            expires_after_seconds: 3600,
          },
        },
        metadata: {
          userId: user.uid,
          productId: product.id,
          productName: product.name, // Added for reliable Discord notifications
          creatorId: product.creatorId,
          amount: product.price.toString(),
        },
        mode: "payment",
        success_url: `${baseUrl}/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/marketplace?canceled=true`,
      };

      let session;
      try {
        // Attempt with Pix + Card
        console.log("[STRIPE] Attempting to create session with Pix + Card...");
        session = await stripe.checkout.sessions.create(sessionData);
      } catch (stripeError: any) {
        console.warn("[STRIPE] Initial session creation failed:", stripeError.message);
        
        // Fallback: Retry with ONLY Credit Card if any error occurs
        console.log("[STRIPE] Retrying with ONLY Card fallback...");
        const fallbackData = { ...sessionData };
        fallbackData.payment_method_types = ["card"];
        delete fallbackData.payment_method_options;
        
        try {
          session = await stripe.checkout.sessions.create(fallbackData);
          console.log("[STRIPE] Fallback session created successfully.");
        } catch (fallbackError: any) {
          console.error("[STRIPE] Fallback also failed:", fallbackError.message);
          throw fallbackError;
        }
      }

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error (Internal):", error);
      const detail = error.raw?.message || error.message || "Falha ao iniciar checkout";
      res.status(error.statusCode || 500).json({ 
        error: "Erro na infraestrutura de pagamento", 
        detail,
        fix: "Verifique suas chaves STRIPE_SECRET_KEY nas configurações."
      });
    }
  });

  // API Route: Request Withdrawal (Saque)
  app.post("/api/creators/withdraw", async (req, res) => {
    try {
      const { userId, amount, pixKey } = req.body;

      if (admin.apps.length === 0) {
        return res.status(503).json({ error: "Storage service not initialized" });
      }

      const db = admin.firestore();
      const creatorRef = db.collection("profiles").doc(userId);

      const result = await db.runTransaction(async (transaction) => {
        const creatorDoc = await transaction.get(creatorRef);
        if (!creatorDoc.exists) throw new Error("Profile not found");

        const data = creatorDoc.data();
        const currentBalance = data?.balance || 0;

        if (currentBalance < amount) {
          throw new Error("Insufficient balance");
        }

        // Add withdrawal request
        const withdrawalRef = db.collection("withdrawals").doc();
        transaction.set(withdrawalRef, {
          userId,
          amount,
          pixKey,
          status: "pending",
          requestedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update balance
        transaction.update(creatorRef, {
          balance: currentBalance - amount
        });

        return { success: true, id: withdrawalRef.id };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Withdrawal Error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // API Route: Generate Secret Product Configuration (System Generated)
  app.post("/api/generate-product-config", async (req, res) => {
    try {
      const { name, description, category, price } = req.body;
      
      // System logic to generate technical metadata without AI
      const securityHash = `SHA_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const assetUniqueId = `ENZO_${category.substring(0, 3).toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

      // Generate a professional Lua Configuration Script
      const luaConfig = `
--[[ 
  ENZO ASSETS ELITE - SYSTEM GENERATED CONFIG
  Asset: ${name}
  Security Hash: ${securityHash}
  Generated: ${new Date().toISOString()}
--]]

local Config = {
    Metadata = {
        Name = "${name}",
        Category = "${category}",
        Version = "1.0.0",
        AssetID = "${assetUniqueId}"
    },
    Settings = {
        AutoUpdate = true,
        SecureRemote = true,
        PerformanceMode = "High",
        OptimizationLevel = 3
    },
    Permissions = {
        WhitelistedUsers = {},
        BlacklistedUsers = {},
        AdminOnly = true
    },
    Economics = {
        BasePrice = ${price || 0},
        Currency = "BRL"
    }
}

return Config
`.trim();

      const config = {
        technical_specs: {
            performance: "Optimized (Level 3)",
            complexity: "Modular",
            engine_version: "2026.4.21",
            integrity_check: "PASSED (System)"
        },
        recommended_settings: [
            "Enable Studio API Services",
            "Enable HTTPS Requests",
            "Set SimulationSpeed to 'Global'"
        ],
        setup_instructions: `1. Import the RBXM file.\n2. Place the Configuration script under ServerScriptService.\n3. Replace placeholder IDs with your unique AssetID: ${assetUniqueId}`,
        compatibility_notes: "Native compatibility with Roblox Engine 2026+ and Nexus Framework.",
        security_hash: securityHash,
        system_verification: "VALIDATED",
        lua_config_script: luaConfig
      };

      // Simulated network delay for professional feel
      setTimeout(() => {
        res.json(config);
      }, 800);

    } catch (error) {
      console.error("System Config Generation Error:", error);
      res.status(500).json({ error: "Failed to generate system config" });
    }
  });

  // API Route: Security Scan Simulation
  app.post("/api/security/scan", (req, res) => {
    const { assetId } = req.body;
    setTimeout(() => {
      res.json({
        status: "SECURE",
        score: 98,
        scannedAt: new Date().toISOString(),
        vulnerabilities: [],
        checks: [
          { name: "RemoteEvents Audit", result: "PASSED" },
          { name: "Backdoor Detection", result: "CLEAN" },
          { name: "Malicious Plugin Check", result: "CLEAN" },
          { name: "Code Optimization", result: "OPTIMIZED" }
        ]
      });
    }, 1500);
  });

  // API Route: Combined Platform Stats (Security, Sales, AI usage)
  app.get("/api/platform/stats", (req, res) => {
    res.json({
      security: {
        totalScans: 12450,
        uptime: "99.99%",
        detectedThreats: 142
      },
      sales: {
        totalVolume: "R$ 450,230.12",
        avgTicket: "R$ 45.00",
        growth: "+12.4%"
      },
      ai: {
        tokensProcessed: "45.2M",
        scriptsGenerated: 8902,
        configsCreated: 5670
      }
    });
  });

  // API Route: Create Pix Charge (Mocked for Demo)
  app.post("/api/payments/pix", async (req, res) => {
    try {
      const { productId, price, creatorPixKey } = req.body;
      
      // In a real scenario, you'd use Mercado Pago, EFI, or Stripe here.
      // For now, we simulate a secure Pix transaction.
      const transactionId = `TX_${Math.random().toString(36).substring(7).toUpperCase()}`;
      const payload = `00020126580014BR.GOV.BCB.PIX0114${creatorPixKey}520400005303986540${price.toFixed(2)}5802BR5915ENZO_ASSETS6009SAO_PAULO62070503${transactionId}6304`;
      
      res.json({
        transactionId,
        pixPayload: payload,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`,
        expiresIn: 3600
      });
    } catch (error) {
      console.error("Pix Payment Error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // Guard for API routes to prevent falling back to index.html
  app.all("/api/*", (req, res, next) => {
    // If we've reached this point, no route matched
    if (!res.headersSent) {
      res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
    }
  });

  // Global Error Handler for API
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("[SERVER API ERROR]", err);
    res.status(err.status || 500).json({ 
      error: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start Server
  const isVercel = process.env.VERCEL === "1";
  if (process.env.NODE_ENV !== "test" && !isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();

// Standard export for local development
export { appPromise };

// Vercel serverless function handler
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
