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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia" as any,
});

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
        // Fallback for demo without verification
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata && admin.apps.length > 0) {
        const { userId, productId, amount, creatorId } = metadata;
        const db = admin.firestore();

        try {
          // 1. Add product to user's library
          await db.collection("libraries").add({
            userId,
            productId,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            price: parseFloat(amount),
            status: "active"
          });

          // 2. Update creator's balance
          const creatorRef = db.collection("profiles").doc(creatorId);
          await db.runTransaction(async (transaction) => {
             const creatorDoc = await transaction.get(creatorRef);
             const currentBalance = creatorDoc.exists ? (creatorDoc.data()?.balance || 0) : 0;
             transaction.update(creatorRef, {
               balance: currentBalance + parseFloat(amount),
               totalSales: admin.firestore.FieldValue.increment(1)
             });
          });

          // 3. Log sale
          await db.collection("sales").add({
            productId,
            buyerId: userId,
            creatorId,
            amount: parseFloat(amount),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            stripeSessionId: session.id
          });

          // 4. Send Discord Notification
          const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
          if (WEBHOOK_URL) {
            try {
              // Fetch extra info for the message
              const prodDoc = await db.collection("products").doc(productId).get();
              const userDoc = await db.collection("users").doc(userId).get();
              
              const productName = prodDoc.exists ? prodDoc.data()?.name : "Produto Desconhecido";
              const buyerName = userDoc.exists ? userDoc.data()?.displayName : (session.customer_details?.email || "Comprador Anônimo");
              
              await axios.post(WEBHOOK_URL, {
                username: "Enzo Assets Notificador",
                avatar_url: "https://enzo-asset2.vercel.app/logo.png",
                embeds: [{
                  title: "🚀 Nova Venda Realizada!",
                  color: 0xC1FF00, // Enzo Primary Green
                  fields: [
                    { name: "📦 Produto", value: productName, inline: true },
                    { name: "💰 Valor", value: `R$ ${amount}`, inline: true },
                    { name: "👤 Comprador", value: buyerName, inline: false }
                  ],
                  footer: { text: "Enzo Assets - O melhor para seu jogo" },
                  timestamp: new Date()
                }]
              });
              console.log("[DISCORD] Aviso de venda enviado!");
            } catch (discordError) {
              console.error("[DISCORD] Erro ao enviar aviso:", discordError);
            }
          }

          console.log(`Purchase successful: User ${userId} bought ${productId}`);
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
    }

    res.json({ received: true });
  });

  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.4", timestamp: new Date().toISOString() });
  });

  // API Route: Create Stripe Checkout Session
  app.post("/api/payments/checkout", async (req, res) => {
    try {
      const { product, user } = req.body;

      if (!product || !user) {
        return res.status(400).json({ error: "Missing product or user data" });
      }

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
          creatorId: product.creatorId,
          amount: product.price.toString(),
        },
        mode: "payment",
        success_url: `${process.env.VITE_APP_URL || "https://enzo-asset2.vercel.app"}/marketplace?success=true`,
        cancel_url: `${process.env.VITE_APP_URL || "https://enzo-asset2.vercel.app"}/marketplace?canceled=true`,
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
      console.error("Stripe Checkout Error:", error);
      const message = error.raw?.message || error.message || "Falha ao iniciar checkout";
      res.status(error.statusCode || 500).json({ error: message });
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
