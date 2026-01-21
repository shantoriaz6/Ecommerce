import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "me",
  "my",
  "you",
  "your",
  "yours",
  "we",
  "our",
  "ours",
  "it",
  "this",
  "that",
  "these",
  "those",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "and",
  "or",
  "but",
  "about",
  "please",
  "tell",
  "show",
  "give",
  "need",
  "want",
  "suggest",
  "recommend",
  "best",
  "good",
  "bad",
  "product",
  "item",
]);

const normalize = (text = "") => String(text).toLowerCase().trim();

const extractKeywords = (message) => {
  const cleaned = normalize(message)
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const parts = cleaned
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);

  const keywords = [];
  for (const p of parts) {
    if (p.length < 3) continue;
    if (STOP_WORDS.has(p)) continue;
    keywords.push(p);
  }

  // prefer the first few meaningful tokens
  return Array.from(new Set(keywords)).slice(0, 5);
};

const getIntent = (message) => {
  const m = normalize(message);
  const wantsSuggestion = /(suggest|recommend|what should i buy|which .* (buy|choose)|best)/i.test(m);
  const asksGoodBad = /(good|bad|worth)/i.test(m);
  const asksPrice = /(price|cost|tk|taka|৳)/i.test(m);
  const asksStock = /(stock|available|availability|in stock)/i.test(m);

  return { wantsSuggestion, asksGoodBad, asksPrice, asksStock };
};

const pickReason = (product) => {
  if (!product) return "";
  const reasons = [];
  if (typeof product.stock === "number") {
    reasons.push(product.stock > 0 ? "in stock" : "currently out of stock");
  }
  if (typeof product.discount === "number" && product.discount > 0) {
    reasons.push(`${product.discount}% discount`);
  }
  if (product.brand) reasons.push(`brand: ${product.brand}`);
  return reasons.length ? reasons.join(", ") : "";
};

const extractFeatures = (description = "") => {
  const text = String(description || "").trim();
  if (!text) return [];

  const normalized = text.replace(/\r/g, "");
  let parts = [];

  if (normalized.includes("\n")) {
    parts = normalized.split("\n");
  } else {
    parts = normalized.split(".");
  }

  const cleaned = parts
    .map((p) => p.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean)
    .filter((p) => p.length >= 6);

  return cleaned.slice(0, 4);
};

const buildGoodBadReply = (product) => {
  const features = extractFeatures(product?.description);
  const reasons = [];

  if (typeof product.stock === "number") {
    reasons.push(product.stock > 0 ? "Available in stock" : "Currently out of stock");
  }
  if (typeof product.discount === "number" && product.discount > 0) {
    reasons.push(`Has a ${product.discount}% discount`);
  }
  if (product.brand) reasons.push(`Trusted/known brand: ${product.brand}`);
  if (typeof product.price === "number") reasons.push(`Price: ৳${product.price}`);

  const header = product.stock > 0
    ? `Yes — “${product.name}” looks like a good option based on the product details in our store.`
    : `Right now, I wouldn’t recommend “${product.name}” because it’s out of stock.`;

  const lines = [header];

  if (reasons.length) {
    lines.push("\nReasons:");
    for (const r of reasons.slice(0, 4)) lines.push(`- ${r}`);
  }

  if (features.length) {
    lines.push("\nKey features (from description):");
    for (const f of features) lines.push(`- ${f}`);
  }

  if (product.category) {
    lines.push(`\nSuitable for: ${product.category} buyers${product.brand ? ` who prefer ${product.brand}` : ""}.`);
  }

  lines.push("\nIf you tell me your budget and what you care about (battery/camera/performance/etc.), I can suggest the best match.");
  return lines.join("\n");
};

const parseBudget = (message = "") => {
  const m = normalize(message)
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!m) return null;

  const toNumber = (numStr, kSuffix) => {
    const n = Number(numStr);
    if (!Number.isFinite(n)) return null;
    return kSuffix ? Math.round(n * 1000) : Math.round(n);
  };

  // Range like: 20000-30000, 20k-30k, 20k to 30k, between 20000 and 30000
  let match = m.match(/(?:between|from)\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?\s*(?:to|and|-)\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (!match) {
    match = m.match(/\b৳?\s*(\d+(?:\.\d+)?)\s*(k)?\s*[-–]\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?\b/i);
  }
  if (match) {
    const a = toNumber(match[1], match[2]);
    const b = toNumber(match[3], match[4]);
    if (a != null && b != null) {
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      return { min, max };
    }
  }

  // Under / below / less than: under 30000, below 30k
  match = m.match(/(?:under|below|less than|upto|up to|max)\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (match) {
    const max = toNumber(match[1], match[2]);
    if (max != null) return { max };
  }

  // Over / above / more than: above 20000
  match = m.match(/(?:over|above|more than|min)\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (match) {
    const min = toNumber(match[1], match[2]);
    if (min != null) return { min };
  }

  // Budget: budget 30000 / my budget is 25k
  match = m.match(/(?:budget)\s*(?:is|=|:)?\s*৳?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (match) {
    const max = toNumber(match[1], match[2]);
    if (max != null) return { max };
  }

  // If they used the currency sign, treat first amount as max
  match = m.match(/৳\s*(\d+(?:\.\d+)?)(\s*k)?/i);
  if (match) {
    const max = toNumber(match[1], Boolean(match[2]));
    if (max != null) return { max };
  }

  return null;
};

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const message = req.body?.message;
  const productId = req.body?.productId;
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "Message is required");
  }

  const intent = getIntent(message);
  const keywords = extractKeywords(message);
  const budget = parseBudget(message);

  let products = [];

  // If caller provides a productId (e.g. from Product Details page), use it as primary context.
  let contextProduct = null;
  if (productId && mongoose.Types.ObjectId.isValid(String(productId))) {
    contextProduct = await Product.findOne({ _id: productId, isActive: true });
  }

  // Use an aggregation so we can filter by effective (discounted) price.
  const baseMatch = { isActive: true };
  const pipeline = [{ $match: baseMatch }];

  if (keywords.length) {
    const or = keywords.flatMap((kw) => [
      { name: { $regex: kw, $options: "i" } },
      { category: { $regex: kw, $options: "i" } },
      { brand: { $regex: kw, $options: "i" } },
    ]);
    pipeline.push({ $match: { $or: or } });
  }

  pipeline.push({
    $addFields: {
      effectivePrice: {
        $round: [
          {
            $multiply: ["$price", { $subtract: [1, { $divide: ["$discount", 100] }] }],
          },
          0,
        ],
      },
    },
  });

  if (budget?.min != null || budget?.max != null) {
    const priceQuery = {};
    if (budget.min != null) priceQuery.$gte = budget.min;
    if (budget.max != null) priceQuery.$lte = budget.max;
    pipeline.push({ $match: { effectivePrice: priceQuery } });
  }

  pipeline.push({ $sort: { discount: -1, stock: -1, effectivePrice: 1, createdAt: -1 } });
  pipeline.push({ $limit: 5 });

  products = await Product.aggregate(pipeline);

  // If we have a context product, prefer it as the first item.
  if (contextProduct) {
    const withoutDup = products.filter((p) => String(p._id) !== String(contextProduct._id));
    // Ensure effectivePrice exists when mixing aggregated docs with mongoose doc
    const ctx = contextProduct.toObject();
    const effectivePrice = Math.round(ctx.price * (1 - (ctx.discount || 0) / 100));
    products = [{ ...ctx, effectivePrice }, ...withoutDup].slice(0, 5);
  }

  // If user asked for suggestions but we couldn't match keywords, suggest popular deals.
  if (!products.length && intent.wantsSuggestion) {
    const fallback = [
      { $match: { isActive: true } },
      {
        $addFields: {
          effectivePrice: {
            $round: [
              {
                $multiply: ["$price", { $subtract: [1, { $divide: ["$discount", 100] }] }],
              },
              0,
            ],
          },
        },
      },
      { $sort: { discount: -1, stock: -1, effectivePrice: 1, createdAt: -1 } },
      { $limit: 5 },
    ];
    products = await Product.aggregate(fallback);
  }

  const top = products[0] || null;

  let reply = "";
  const suggestions = [];

  const budgetText = budget
    ? budget.min != null && budget.max != null
      ? `between ৳${budget.min} and ৳${budget.max}`
      : budget.max != null
        ? `under ৳${budget.max}`
        : budget.min != null
          ? `above ৳${budget.min}`
          : ""
    : "";

  if (!products.length) {
    if (intent.asksGoodBad) {
      reply =
        "I can definitely tell you if a product is good and why — which product do you mean? Please type the product name (or open the product page and ask again).";
    } else if (budget) {
      reply = `I couldn’t find any products ${budgetText}. Try adjusting the range, or tell me the category/brand you prefer (e.g., “phone under ৳30000”).`;
    } else {
      reply =
        "I can help with product info and suggestions. Tell me what you’re looking for (category like ‘phone’, brand, or a product name), and your budget if you have one.";
    }
  } else if (intent.asksPrice && top) {
    reply = `Price for “${top.name}” is ৳${top.price}. ${pickReason(top) ? `(${pickReason(top)})` : ""}`;
  } else if (intent.asksStock && top) {
    reply = `Availability for “${top.name}”: ${top.stock > 0 ? `In stock (${top.stock} available)` : "Currently out of stock"}.`;
  } else if (intent.asksGoodBad && top) {
    reply = buildGoodBadReply(top);
  } else if (intent.wantsSuggestion) {
    reply = budgetText
      ? `Here are some products ${budgetText}. If you tell me your preferred brand and what matters most, I’ll recommend the best one.`
      : "Here are a few suggestions based on what you typed. If you share your budget + preferred category/brand, I can narrow it down.";
  } else {
    reply =
      "Here’s what I found. If you want, ask ‘is it good or bad?’ or ‘suggest me something under ৳X’ and I’ll guide you.";
  }

  for (const p of products) {
    suggestions.push({
      _id: p._id,
      name: p.name,
      price: p.price,
      effectivePrice: typeof p.effectivePrice === "number" ? p.effectivePrice : Math.round(p.price * (1 - (p.discount || 0) / 100)),
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      discount: p.discount,
      image: p.image,
      reason: pickReason(p),
    });
  }

  return res.status(200).json(new ApiResponse(200, { reply, suggestions }, "Chat reply"));
});
