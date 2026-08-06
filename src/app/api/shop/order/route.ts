import { NextResponse } from "next/server";
import { getShopConfig, getShopProduct, isShopOpen } from "@/lib/shop";

export type ShopOrderPayload = {
  productId: string;
  size: string;
  quantity: number;
  printName: string;
  printNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  note?: string;
};

function isNonEmptyString(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function buildOrderBody(order: ShopOrderPayload, productName: string, price: number): string {
  const lines = [
    "Neuer Trikot-Bestellwunsch",
    "",
    `Produkt: ${productName} (${order.productId})`,
    `Preis: ${price} € inkl. Wunschdruck`,
    `Größe: ${order.size}`,
    `Anzahl: ${order.quantity}`,
    `Wunschname: ${order.printName || "—"}`,
    `Wunschnummer: ${order.printNumber || "—"}`,
    "",
    `Name: ${order.customerName}`,
    `E-Mail: ${order.customerEmail}`,
    `Telefon: ${order.customerPhone?.trim() || "—"}`,
    `Hinweis: ${order.note?.trim() || "—"}`,
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  if (!isShopOpen()) {
    return NextResponse.json(
      { error: "Der Shop ist derzeit geschlossen." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const data = body as Partial<ShopOrderPayload>;
  const shop = getShopConfig();
  const product = data.productId ? getShopProduct(data.productId) : undefined;

  if (!product) {
    return NextResponse.json({ error: "Bitte ein Produkt wählen." }, { status: 400 });
  }
  if (!isNonEmptyString(data.size, 10) || !shop.sizes.includes(data.size)) {
    return NextResponse.json({ error: "Bitte eine gültige Größe wählen." }, { status: 400 });
  }

  const quantity = Number(data.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return NextResponse.json({ error: "Anzahl muss zwischen 1 und 10 liegen." }, { status: 400 });
  }
  if (!isNonEmptyString(data.customerName, 120)) {
    return NextResponse.json({ error: "Bitte deinen Namen angeben." }, { status: 400 });
  }
  if (!isNonEmptyString(data.customerEmail, 160) || !data.customerEmail.includes("@")) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail angeben." }, { status: 400 });
  }

  const order: ShopOrderPayload = {
    productId: product.id,
    size: data.size,
    quantity,
    printName: typeof data.printName === "string" ? data.printName.trim().slice(0, 40) : "",
    printNumber: typeof data.printNumber === "string" ? data.printNumber.trim().slice(0, 3) : "",
    customerName: data.customerName.trim(),
    customerEmail: data.customerEmail.trim(),
    customerPhone:
      typeof data.customerPhone === "string" ? data.customerPhone.trim().slice(0, 40) : "",
    note: typeof data.note === "string" ? data.note.trim().slice(0, 500) : "",
  };

  const subject = `Bestellwunsch: ${product.name} · ${order.size} · ${order.customerName}`;
  const text = buildOrderBody(order, product.name, product.price);
  const mailto = `mailto:${encodeURIComponent(shop.orderEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const from = process.env.SHOP_FROM_EMAIL?.trim() || "Shop <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [shop.orderEmail],
          reply_to: order.customerEmail,
          subject,
          text,
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error("Resend error:", detail);
        return NextResponse.json({
          ok: true,
          mode: "mailto",
          mailto,
          warning: "E-Mail-Versand fehlgeschlagen — bitte Bestellung per Mail-Programm senden.",
        });
      }

      return NextResponse.json({ ok: true, mode: "sent" });
    } catch (err) {
      console.error("Resend request failed:", err);
      return NextResponse.json({
        ok: true,
        mode: "mailto",
        mailto,
        warning: "E-Mail-Versand fehlgeschlagen — bitte Bestellung per Mail-Programm senden.",
      });
    }
  }

  return NextResponse.json({ ok: true, mode: "mailto", mailto });
}
